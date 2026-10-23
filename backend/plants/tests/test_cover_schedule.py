from datetime import timedelta
from io import BytesIO
from pathlib import Path
from tempfile import TemporaryDirectory

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.utils import timezone
from PIL import Image
from rest_framework.test import APIClient

from plants.models import PlantAccess, PlantSpecies, UserPlant


class CoverAndScheduleTests(TestCase):
    def setUp(self):
        directory = TemporaryDirectory(prefix="plantpal-test-covers-")
        self.addCleanup(directory.cleanup)
        settings = override_settings(MEDIA_ROOT=directory.name)
        settings.enable()
        self.addCleanup(settings.disable)
        self.media = Path(directory.name)
        User = get_user_model()
        self.owner = User.objects.create_user(username="owner", nickname="Owner")
        self.sitter = User.objects.create_user(username="sitter", nickname="Sitter")
        self.stranger = User.objects.create_user(username="stranger", nickname="Stranger")
        self.species = PlantSpecies.objects.create(slug="pothos", name={"zh": "绿萝", "en": "Pothos"})
        self.plant = UserPlant.objects.create(owner=self.owner, species=self.species, nickname="Desk plant", location="Study")
        self.url = f"/api/plants/{self.plant.pk}/"
        self.client = APIClient()
        self.client.force_authenticate(self.owner)

    def image(self, format="PNG"):
        output = BytesIO()
        Image.new("RGB", (32, 24), "green").save(output, format=format)
        return SimpleUploadedFile("photo." + format.lower(), output.getvalue(), content_type="image/" + format.lower())

    def upload(self):
        response = self.client.patch(self.url, {"cover": self.image()}, format="multipart")
        self.assertEqual(response.status_code, 200, response.data)
        return response.data["cover_url"]

    def test_upload_is_persisted_and_served_only_to_authorized_users(self):
        url = self.upload()
        self.plant.refresh_from_db()
        self.assertTrue(self.plant.cover.storage.exists(self.plant.cover.name))
        self.assertEqual(self.client.get(self.url).data["cover_url"], url)
        self.assertNotIn("/media/", url)
        response = self.client.get(url)
        try:
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response["Cache-Control"], "private, no-store")
            with Image.open(BytesIO(b"".join(response.streaming_content))) as image:
                self.assertEqual(image.format, "JPEG")
                self.assertEqual(image.size, (32, 24))
        finally:
            response.close()
        self.client.force_authenticate(self.stranger)
        self.assertEqual(self.client.get(url).status_code, 404)
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get(url).status_code, 403)

    def test_caretaker_can_view_but_cannot_modify_cover_or_schedule_and_revocation_applies(self):
        url = self.upload()
        access = PlantAccess.objects.create(plant=self.plant, caretaker=self.sitter)
        self.client.force_authenticate(self.sitter)
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        response.close()
        self.assertEqual(self.client.patch(self.url, {"cover": self.image()}, format="multipart").status_code, 404)
        self.assertEqual(self.client.patch(self.url, {"next_check_at": timezone.now().isoformat()}, format="json").status_code, 404)
        access.active = False
        access.save()
        self.assertEqual(self.client.get(url).status_code, 404)

    def test_invalid_unsupported_and_oversized_images_do_not_change_existing_cover(self):
        url = self.upload()
        oversized = self.image()
        oversized = SimpleUploadedFile("large.png", oversized.read() + b"0" * (5 * 1024 * 1024), content_type="image/png")
        for file in [SimpleUploadedFile("fake.png", b"not an image", content_type="image/png"), self.image("GIF"), oversized]:
            response = self.client.patch(self.url, {"cover": file}, format="multipart")
            self.assertEqual(response.status_code, 400, response.data)
            self.assertEqual(self.client.get(self.url).data["cover_url"], url)
        self.assertEqual(len(list(self.media.rglob("*.jpg"))), 1)

    def test_replacing_removing_and_deleting_plant_clean_up_cover_files(self):
        first_url = self.upload()
        self.plant.refresh_from_db()
        first_name = self.plant.cover.name
        with self.captureOnCommitCallbacks(execute=True):
            second_url = self.upload()
        self.assertNotEqual(first_url, second_url)
        self.assertFalse((self.media / first_name).exists())
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.patch(self.url, {"cover": None}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.data["cover_url"])
        self.assertFalse(list(self.media.rglob("*.jpg")))
        url = self.upload()
        with self.captureOnCommitCallbacks(execute=True):
            self.assertEqual(self.client.delete(self.url).status_code, 204)
        self.assertFalse(list(self.media.rglob("*.jpg")))
        self.assertEqual(self.client.get(url).status_code, 404)

    def test_create_with_cover_and_custom_schedule(self):
        when = timezone.now().replace(microsecond=0) + timedelta(days=3)
        response = self.client.post("/api/plants/", {"species": self.species.pk, "nickname": "New plant", "location": "Window", "cover": self.image(), "next_check_at": when.isoformat()}, format="multipart")
        self.assertEqual(response.status_code, 201, response.data)
        plant = UserPlant.objects.get(pk=response.data["id"])
        self.assertEqual(plant.next_check_at, when)
        self.assertTrue(plant.cover)
        self.assertEqual(response.data["check_status"], "scheduled")

    def test_custom_schedule_respects_time_zone_and_changes_reminders(self):
        when = timezone.now().replace(microsecond=0) + timedelta(days=2)
        # 同一时刻以 +08:00 输入，数据库中仍按 UTC 比较。
        value = when.astimezone(timezone.get_current_timezone()).isoformat()
        response = self.client.patch(self.url, {"next_check_at": value}, format="json")
        self.assertEqual(response.status_code, 200, response.data)
        self.plant.refresh_from_db()
        self.assertEqual(self.plant.next_check_at, when)
        self.assertEqual(response.data["check_status"], "scheduled")
        self.assertEqual(self.client.get("/api/dashboard/?scope=owned").data["scheduled"], 1)
        for hours, expected in [(1, "due"), (25, "overdue")]:
            response = self.client.patch(self.url, {"next_check_at": (timezone.now() - timedelta(hours=hours)).isoformat()}, format="json")
            self.assertEqual(response.data["check_status"], expected)
        saved = UserPlant.objects.get(pk=self.plant.pk).next_check_at
        for invalid in [None, "not-a-date"]:
            self.assertEqual(self.client.patch(self.url, {"next_check_at": invalid}, format="json").status_code, 400)
        self.assertEqual(UserPlant.objects.get(pk=self.plant.pk).next_check_at, saved)
