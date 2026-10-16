from datetime import timedelta
from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from plants.care_service import record_care
from plants.models import CareLog, PlantSpecies, UserPlant

User = get_user_model()

class CareTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username="owner", nickname="Owner")
        self.other = User.objects.create_user(username="other", nickname="Other")
        species = PlantSpecies.objects.create(slug="pothos", name={"zh": "绿萝", "en": "Pothos"})
        self.first = UserPlant.objects.create(owner=self.owner, species=species, nickname="Study", location="Study")
        self.second = UserPlant.objects.create(owner=self.owner, species=species, nickname="Bedroom", location="Bedroom")
        self.client = APIClient()
        self.client.force_authenticate(self.owner)
        self.url = f"/api/plants/{self.first.pk}/care/"

    def test_invalid_outcomes_and_missing_confirmation_do_not_write(self):
        old_time = self.first.next_check_at
        for data in [
            {"observation": "damp", "outcome": "watered", "confirmed": True},
            {"observation": "unsure", "outcome": "watered", "confirmed": True},
            {"observation": "dry", "outcome": "watered", "confirmed": False},
            {"observation": "dry", "outcome": "watered"},
            {"observation": "invalid", "outcome": "later", "confirmed": True},
            {"observation": "dry", "outcome": "invalid", "confirmed": True},
        ]:
            self.assertEqual(self.client.post(self.url, data, format="json").status_code, 400)
        self.first.refresh_from_db()
        self.assertEqual(self.first.next_check_at, old_time)
        self.assertFalse(CareLog.objects.exists())

    def test_all_outcomes_use_server_time_actor_and_separate_instances(self):
        other_time = self.second.next_check_at
        for outcome, hours in [("watered", 24), ("skipped", 24), ("later", 2)]:
            before = timezone.now()
            response = self.client.post(self.url, {
                "observation": "dry", "outcome": outcome, "confirmed": True,
                "actor": self.other.pk, "role": "caretaker", "timestamp": "2000-01-01T00:00:00Z",
            }, format="json")
            self.assertEqual(response.status_code, 201, response.data)
            log = CareLog.objects.first()
            self.first.refresh_from_db()
            self.assertGreaterEqual(log.timestamp, before)
            self.assertEqual(log.actor, self.owner)
            self.assertEqual(log.role, "owner")
            self.assertEqual(self.first.next_check_at, log.timestamp + timedelta(hours=hours))
        self.second.refresh_from_db()
        self.assertEqual(self.second.next_check_at, other_time)
        self.assertEqual(self.second.care_logs.count(), 0)
        self.assertEqual(self.client.get(f"/api/care-logs/?plant={self.first.pk}").data["count"], 3)

    def test_failed_schedule_update_rolls_back_log(self):
        old_time = self.first.next_check_at
        with patch.object(UserPlant, "save", side_effect=RuntimeError("forced write failure")):
            with self.assertRaises(RuntimeError):
                record_care(self.owner, self.first.pk, {"observation": "dry", "outcome": "watered", "confirmed": True})
        self.assertFalse(CareLog.objects.exists())
        self.first.refresh_from_db()
        self.assertEqual(self.first.next_check_at, old_time)

    def test_unauthorized_history_and_record_are_denied(self):
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get("/api/care-logs/").data["count"], 0)
        self.assertEqual(self.client.get(f"/api/care-logs/?plant={self.first.pk}").status_code, 404)
        self.assertEqual(self.client.post(self.url, {"observation": "dry", "outcome": "watered", "confirmed": True}, format="json").status_code, 404)
        self.assertFalse(CareLog.objects.exists())

    def test_dashboard_counts_due_overdue_and_future(self):
        self.first.next_check_at = timezone.now() - timedelta(hours=25)
        self.first.save()
        data = self.client.get("/api/dashboard/").data
        self.assertEqual((data["plants"], data["due"], data["overdue"]), (2, 1, 1))
        self.assertEqual(data["history"], 0)
        self.client.post(self.url, {"observation": "damp", "outcome": "skipped", "confirmed": True}, format="json")
        data = self.client.get("/api/dashboard/").data
        self.assertEqual((data["due"], data["overdue"], data["scheduled"], data["history"]), (1, 0, 1, 1))
