from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from plants.models import CareLog, PlantAccess, PlantSpecies, UserPlant
from community.models import Friendship

User = get_user_model()

class AccessTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username="owner", nickname="Owner")
        self.sitter = User.objects.create_user(username="sitter", nickname="Sitter")
        self.stranger = User.objects.create_user(username="stranger", nickname="Stranger")
        species = PlantSpecies.objects.create(slug="pothos", name={"zh": "绿萝", "en": "Pothos"})
        self.plant = UserPlant.objects.create(owner=self.owner, species=species, nickname="Study", location="Desk", owner_notes="Private note")
        self.other_plant = UserPlant.objects.create(owner=self.owner, species=species, nickname="Bedroom", location="Bedroom")
        self.client = APIClient()
        self.client.force_authenticate(self.owner)
        self.url = f"/api/plants/{self.plant.pk}/"
        Friendship.objects.create(user_low=self.owner, user_high=self.sitter, requester=self.owner, status="accepted")

    def test_friendship_does_not_grant_access(self):
        self.client.force_authenticate(self.sitter)
        self.assertEqual(self.client.get(self.url).status_code, 404)
        self.assertEqual(self.client.get("/api/plants/?scope=caretaking").data["count"], 0)
        self.assertEqual(self.client.post(self.url + "access/", {"user_id": self.stranger.pk}, format="json").status_code, 404)

    def test_grant_limited_permissions_and_immediate_revocation(self):
        granted = self.client.post(self.url + "access/", {"user_id": self.sitter.pk}, format="json")
        self.assertEqual(granted.status_code, 200, granted.data)
        access_id = granted.data["id"]
        self.client.force_authenticate(self.sitter)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["can_edit"])
        self.assertEqual(response.data["owner_notes"], "Private note")
        self.assertEqual(self.client.get("/api/plants/?scope=caretaking").data["count"], 1)
        self.assertEqual(self.client.get(f"/api/plants/{self.other_plant.pk}/").status_code, 404)
        self.assertEqual(self.client.patch(self.url, {"owner_notes": "Tampered"}, format="json").status_code, 404)
        self.assertEqual(self.client.delete(self.url).status_code, 404)
        self.assertEqual(self.client.get(self.url + "access/").status_code, 404)
        self.assertEqual(self.client.post(self.url + "access/", {"user_id": self.stranger.pk}, format="json").status_code, 404)
        result = self.client.post(self.url + "care/", {"observation": "damp", "outcome": "skipped", "confirmed": True, "actor": self.owner.id}, format="json")
        self.assertEqual(result.status_code, 201)
        log = CareLog.objects.get()
        self.assertEqual(log.actor, self.sitter)
        self.assertEqual(log.role, "caretaker")
        self.client.force_authenticate(self.owner)
        self.assertEqual(self.client.delete(self.url + f"access/{access_id}/").status_code, 204)
        self.client.force_authenticate(self.sitter)
        # 同一个已登录会话也必须立即失去后续读取和写入权限。
        self.assertEqual(self.client.get(self.url).status_code, 404)
        self.assertEqual(self.client.get(f"/api/care-logs/?plant={self.plant.pk}").status_code, 404)
        self.assertEqual(self.client.get("/api/care-logs/").data["count"], 0)
        self.assertEqual(self.client.post(self.url + "care/", {"observation": "dry", "outcome": "watered", "confirmed": True}, format="json").status_code, 404)
        self.assertEqual(CareLog.objects.count(), 1)
        self.plant.refresh_from_db()
        self.assertEqual(self.plant.owner_notes, "Private note")

    def test_only_friend_can_receive_grant_and_repeated_grants_are_idempotent(self):
        self.assertEqual(self.client.post(self.url + "access/", {"user_id": self.stranger.id}, format="json").status_code, 403)
        for _ in range(2):
            self.assertEqual(self.client.post(self.url + "access/", {"user_id": self.sitter.id}, format="json").status_code, 200)
        self.assertEqual(PlantAccess.objects.count(), 1)
