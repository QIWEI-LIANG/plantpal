from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.test import TestCase
from rest_framework.test import APIClient
from plants.models import PlantSpecies, UserPlant
from .models import Feedback, Friendship, Like, Notification, Post

User = get_user_model()

class CommunityTests(TestCase):
    def setUp(self):
        self.first = User.objects.create_user(username="first", nickname="First")
        self.second = User.objects.create_user(username="second", nickname="Second")
        self.third = User.objects.create_user(username="third", nickname="Third")
        self.client = APIClient()
        self.client.force_authenticate(self.first)

    def test_request_accept_reject_and_relationship_isolation(self):
        first = self.client.post("/api/friendships/", {"user_id": self.second.id}, format="json")
        self.assertEqual(first.status_code, 200)
        self.client.post("/api/friendships/", {"user_id": self.second.id}, format="json")
        self.assertEqual(Friendship.objects.count(), 1)
        url = f"/api/friendships/{first.data['id']}/"
        self.assertEqual(self.client.patch(url, {"status": "accepted"}, format="json").status_code, 403)
        self.client.force_authenticate(self.third)
        self.assertEqual(self.client.get("/api/friendships/").data["count"], 0)
        self.assertEqual(self.client.patch(url, {"status": "accepted"}, format="json").status_code, 404)
        self.client.force_authenticate(self.second)
        self.client.post("/api/friendships/", {"user_id": self.first.id}, format="json")
        self.assertEqual(Friendship.objects.count(), 1)
        self.assertEqual(self.client.patch(url, {"status": "rejected"}, format="json").status_code, 200)
        self.client.force_authenticate(self.first)
        self.client.post("/api/friendships/", {"user_id": self.second.id}, format="json")
        self.client.force_authenticate(self.second)
        self.assertEqual(self.client.patch(url, {"status": "accepted"}, format="json").status_code, 200)
        self.assertEqual(Friendship.objects.get().status, "accepted")

    def test_search_does_not_expose_email_or_plant_data(self):
        response = self.client.get("/api/users/?search=second")
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(set(response.data["results"][0]), {"id", "username", "nickname"})
        self.assertEqual(self.client.get("/api/users/").data["count"], 0)

    def test_post_creation_ownership_search_and_unique_idempotent_likes(self):
        response = self.client.post("/api/posts/", {"title": "My pothos", "body": "<script>alert(1)</script>", "author": self.second.id}, format="json")
        self.assertEqual(response.status_code, 201)
        post = Post.objects.get()
        self.assertEqual(post.author, self.first)
        self.assertEqual(post.body, "<script>alert(1)</script>")
        self.client.force_authenticate(self.second)
        self.assertEqual(self.client.delete(f"/api/posts/{post.id}/").status_code, 404)
        url = f"/api/posts/{post.id}/like/"
        for _ in range(2):
            self.assertEqual(self.client.put(url).data["like_count"], 1)
        self.assertEqual(Like.objects.count(), 1)
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Like.objects.create(post=post, user=self.second)
        for _ in range(2):
            self.assertEqual(self.client.delete(url).data["like_count"], 0)
        self.assertEqual(self.client.get("/api/posts/?search=pothos").data["count"], 1)
        self.client.force_authenticate(self.first)
        self.assertEqual(self.client.delete(f"/api/posts/{post.id}/").status_code, 204)

    def test_post_sorting_and_pagination(self):
        old = Post.objects.create(author=self.first, title="Old", body="Old")
        new = Post.objects.create(author=self.first, title="New", body="New")
        Like.objects.create(post=old, user=self.second)
        self.assertEqual(self.client.get("/api/posts/?ordering=popular").data["results"][0]["id"], old.id)
        self.assertEqual(self.client.get("/api/posts/?ordering=newest").data["results"][0]["id"], new.id)
        response = self.client.get("/api/posts/?page_size=1")
        self.assertEqual(len(response.data["results"]), 1)
        self.assertIsNotNone(response.data["next"])

    def test_notifications_only_to_friends_and_only_recipient_marks_read(self):
        self.assertEqual(self.client.post("/api/notifications/", {"recipient": self.second.id}, format="json").status_code, 403)
        Friendship.objects.create(user_low=self.first, user_high=self.second, requester=self.first, status="accepted")
        sent = self.client.post("/api/notifications/", {"recipient": self.second.id, "message": "Please check the soil."}, format="json")
        self.assertEqual(sent.status_code, 201)
        notification = Notification.objects.get(kind="care_reminder")
        url = f"/api/notifications/{notification.id}/"
        self.assertEqual(self.client.patch(url, {}, format="json").status_code, 404)
        self.assertEqual(self.client.get("/api/notifications/").data["count"], 0)
        self.client.force_authenticate(self.second)
        self.assertEqual(self.client.get("/api/notifications/").data["count"], 1)
        self.assertEqual(self.client.patch(url, {}, format="json").status_code, 200)
        notification.refresh_from_db()
        self.assertTrue(notification.is_read)

    def test_reminder_cannot_attach_unshared_plant_and_feedback_persists(self):
        Friendship.objects.create(user_low=self.first, user_high=self.second, requester=self.first, status="accepted")
        species = PlantSpecies.objects.create(slug="pothos")
        plant = UserPlant.objects.create(owner=self.first, species=species, nickname="Private", location="Study")
        self.assertEqual(self.client.post("/api/notifications/", {"recipient": self.second.id, "plant": str(plant.pk)}, format="json").status_code, 404)
        result = self.client.post("/api/feedback/", {"message": "Please improve care reminders.", "user": self.second.id}, format="json")
        self.assertEqual(result.status_code, 201)
        self.assertEqual(Feedback.objects.get().user, self.first)
