from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import User

class PublicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "nickname"]

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "nickname", "email"]
        read_only_fields = ["id", "username"]

class RegisterSerializer(serializers.Serializer):
    username = serializers.RegexField(r"^[A-Za-z0-9_]{3,30}$")
    nickname = serializers.CharField(max_length=30)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, max_length=128, trim_whitespace=False)
    password_confirm = serializers.CharField(write_only=True, max_length=128, trim_whitespace=False)

    def validate_username(self, value):
        value = value.lower()
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "两次密码不一致。 / Passwords do not match."})
        user = User(username=attrs["username"], nickname=attrs["nickname"], email=attrs.get("email", ""))
        try:
            validate_password(attrs["password"], user=user)
        except DjangoValidationError as error:
            raise serializers.ValidationError({"password": error.messages}) from error
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        return User.objects.create_user(**validated_data)

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, max_length=128, trim_whitespace=False)
