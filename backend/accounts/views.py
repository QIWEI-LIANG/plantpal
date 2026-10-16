from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError, transaction
from django.middleware.csrf import get_token
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from config.errors import BusinessError
from .serializers import LoginSerializer, ProfileSerializer, RegisterSerializer

class CsrfView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"csrfToken": get_token(request)})

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            with transaction.atomic():
                user = serializer.save()
        except IntegrityError as error:
            raise BusinessError("用户名已被使用。", "Username is already taken.") from error
        login(request, user)
        return Response(ProfileSerializer(user).data, status=201)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(request, username=serializer.validated_data["username"].lower(), password=serializer.validated_data["password"])
        if user is None:
            raise BusinessError("用户名或密码不正确。", "Incorrect username or password.", code="invalid_credentials")
        login(request, user)
        return Response(ProfileSerializer(user).data)

class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response(status=204)

class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        return self.request.user
