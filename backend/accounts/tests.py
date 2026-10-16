from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

User = get_user_model()

class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=True)

    def csrf(self):
        response = self.client.get("/api/auth/csrf/")
        self.assertEqual(response.status_code, 200)
        self.client.credentials(HTTP_X_CSRFTOKEN=self.client.cookies["csrftoken"].value)

    def test_anonymous_registration_and_login_require_csrf(self):
        for endpoint in ["register", "login"]:
            response = self.client.post(f"/api/auth/{endpoint}/", {}, format="json")
            self.assertEqual(response.status_code, 403)
        self.assertEqual(User.objects.count(), 0)

    def test_register_login_profile_logout_and_password_hash(self):
        self.csrf()
        response = self.client.post("/api/auth/register/", {
            "username": "First_User", "nickname": "First",
            "password": "Unique-garden!42", "email": "first@example.com",
        }, format="json")
        self.assertEqual(response.status_code, 201, response.data)
        user = User.objects.get(username="first_user")
        self.assertNotEqual(user.password, "Unique-garden!42")
        self.assertTrue(user.check_password("Unique-garden!42"))
        self.assertEqual(user.plants.count(), 0)
        self.assertEqual(user.care_logs.count(), 0)
        self.assertNotIn("password", response.data)
        self.assertEqual(self.client.get("/api/auth/me/").data["id"], user.id)
        # 登录会旋转 CSRF token；后续写请求重新读取 cookie。
        self.csrf()
        self.assertEqual(self.client.patch("/api/auth/me/", {"nickname": "New name", "is_staff": True}, format="json").status_code, 200)
        user.refresh_from_db()
        self.assertFalse(user.is_staff)
        self.assertEqual(user.nickname, "New name")
        self.client.credentials()
        self.assertEqual(self.client.post("/api/auth/logout/").status_code, 403)
        self.csrf()
        self.assertEqual(self.client.post("/api/auth/logout/").status_code, 204)
        self.assertEqual(self.client.get("/api/auth/me/").status_code, 403)
        self.csrf()
        response = self.client.post("/api/auth/login/", {"username": "FIRST_USER", "password": "Unique-garden!42"}, format="json")
        self.assertEqual(response.status_code, 200)

    def test_weak_password_and_duplicate_username_rejected(self):
        self.csrf()
        self.assertEqual(self.client.post("/api/auth/register/", {"username": "garden", "nickname": "G", "password": "123"}, format="json").status_code, 400)
        User.objects.create_user(username="garden", nickname="G", password="Another!pass42")
        response = self.client.post("/api/auth/register/", {"username": "GARDEN", "nickname": "G", "password": "Another!pass42"}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(User.objects.count(), 1)

    def test_cross_origin_write_rejected(self):
        self.csrf()
        response = self.client.post("/api/auth/register/", {"username": "new_user", "nickname": "G", "password": "Unique-garden!42"}, format="json", HTTP_ORIGIN="http://evil.example")
        self.assertEqual(response.status_code, 403)
        self.assertEqual(User.objects.count(), 0)
