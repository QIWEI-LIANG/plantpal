from io import StringIO
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import TestCase
from rest_framework.test import APIClient
from plants.models import PlantSpecies, UserPlant

User = get_user_model()

class PlantTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username="owner", nickname="Owner", password="garden-test!42")
        self.other = User.objects.create_user(username="other", nickname="Other", password="garden-test!42")
        self.species = PlantSpecies.objects.create(slug="pothos", name={"zh": "绿萝", "en": "Pothos"}, scientific="Epipremnum aureum")
        self.client = APIClient()
        self.client.force_authenticate(self.owner)

    def create_plant(self, nickname="Desk pothos", location="Study"):
        return self.client.post("/api/plants/", {"species": self.species.id, "nickname": nickname, "location": location, "owner": self.other.id}, format="json")

    def test_two_pots_same_species_have_separate_ids_and_owner(self):
        first = self.create_plant()
        second = self.create_plant("Bedroom pothos", "Bedroom")
        self.assertEqual(first.status_code, 201, first.data)
        self.assertNotEqual(first.data["id"], second.data["id"])
        self.assertEqual(UserPlant.objects.count(), 2)
        self.assertTrue(all(plant.owner == self.owner for plant in UserPlant.objects.all()))
        self.assertEqual(self.client.get("/api/plants/").data["count"], 2)

    def test_other_user_cannot_read_edit_or_delete(self):
        plant_id = self.create_plant().data["id"]
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get("/api/plants/").data["count"], 0)
        url = f"/api/plants/{plant_id}/"
        for response in [
            self.client.get(url),
            self.client.patch(url, {"owner_notes": "Changed"}, format="json"),
            self.client.delete(url),
        ]:
            self.assertEqual(response.status_code, 404)
        self.assertEqual(UserPlant.objects.count(), 1)

    def test_owner_can_edit_and_delete_instance(self):
        plant_id = self.create_plant().data["id"]
        url = f"/api/plants/{plant_id}/"
        response = self.client.patch(url, {"nickname": "Updated", "location": "Kitchen", "owner_notes": "Ask me first"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.client.get(url).data["owner_notes"], "Ask me first")
        self.assertEqual(self.client.delete(url).status_code, 204)
        self.assertFalse(UserPlant.objects.exists())

    def test_anonymous_can_search_guides_but_not_private_plants(self):
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get("/api/plants/").status_code, 403)
        response = self.client.get("/api/species/?search=绿萝")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)

    def test_seed_is_idempotent_and_preserves_edited_species(self):
        self.species.scientific = "Edited by admin"
        self.species.save()
        for _ in range(2):
            call_command("seed_plants", stdout=StringIO())
        self.species.refresh_from_db()
        self.assertEqual(self.species.scientific, "Edited by admin")
        self.assertEqual(PlantSpecies.objects.count(), 6)
        self.assertEqual(UserPlant.objects.count(), 0)
