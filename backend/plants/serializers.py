from datetime import timedelta
from io import BytesIO
from pathlib import Path
from django.core.files.base import ContentFile
from django.utils import timezone
from PIL import Image, ImageOps
from rest_framework import serializers
from accounts.serializers import PublicUserSerializer
from .models import CareLog, PlantAccess, PlantSpecies, UserPlant

class PlantSpeciesSerializer(serializers.ModelSerializer):
    type = serializers.CharField(source="art_type", read_only=True)
    check = serializers.JSONField(source="check_guidance", read_only=True)

    class Meta:
        model = PlantSpecies
        fields = ["id", "slug", "name", "scientific", "type", "color", "difficulty", "light", "water", "check", "tip", "beginner", "drought_tolerant"]

class PlantReadSerializer(serializers.ModelSerializer):
    species = PlantSpeciesSerializer()
    owner = PublicUserSerializer()
    can_edit = serializers.SerializerMethodField()
    check_status = serializers.SerializerMethodField()
    cover_url = serializers.SerializerMethodField()

    class Meta:
        model = UserPlant
        fields = ["id", "species", "owner", "nickname", "location", "owner_notes", "cover_url", "next_check_at", "created_at", "can_edit", "check_status"]

    def get_cover_url(self, plant):
        if not plant.cover:
            return None
        return f"/api/plants/{plant.pk}/cover/?v={Path(plant.cover.name).stem}"

    def get_can_edit(self, plant):
        return plant.owner_id == self.context["request"].user.id

    def get_check_status(self, plant):
        now = timezone.now()
        if plant.next_check_at > now:
            return "scheduled"
        return "overdue" if plant.next_check_at < now - timedelta(hours=24) else "due"

class PlantWriteSerializer(serializers.ModelSerializer):
    cover = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = UserPlant
        fields = ["species", "nickname", "location", "owner_notes", "next_check_at", "cover"]

    def validate_cover(self, value):
        if value is None:
            return value
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("图片不能超过 5 MB。 / Image must be under 5 MB.")
        try:
            with Image.open(value) as image:
                if image.format not in {"JPEG", "PNG", "WEBP"}:
                    raise serializers.ValidationError("请选择 JPG、PNG 或 WebP 图片。 / Choose JPG, PNG or WebP.")
                if image.width * image.height > 25_000_000:
                    raise serializers.ValidationError("图片不能超过 2500 万像素。 / Image must be at most 25 megapixels.")
                # 统一方向并重新编码，去除 EXIF 等元数据，限制存储及展示尺寸。
                image = ImageOps.exif_transpose(image)
                image.thumbnail((2000, 2000))
                rgba = image.convert("RGBA")
                flattened = Image.new("RGB", rgba.size, "white")
                flattened.paste(rgba, mask=rgba.getchannel("A"))
                output = BytesIO()
                flattened.save(output, format="JPEG", quality=88)
        except (OSError, ValueError, Image.DecompressionBombError) as error:
            raise serializers.ValidationError("图片损坏或无法读取。 / Image is corrupt or unreadable.") from error
        return ContentFile(output.getvalue(), name="cover.jpg")

    def validate_species(self, species):
        if self.instance and self.instance.species_id != species.id:
            raise serializers.ValidationError("The species of an existing plant cannot be changed.")
        return species

class CareLogSerializer(serializers.ModelSerializer):
    actor = PublicUserSerializer()
    plant_name = serializers.CharField(source="plant.nickname")
    plant_location = serializers.CharField(source="plant.location")

    class Meta:
        model = CareLog
        fields = ["id", "plant", "plant_name", "plant_location", "actor", "role", "observation", "outcome", "timestamp"]
        read_only_fields = fields

class CareInputSerializer(serializers.Serializer):
    observation = serializers.ChoiceField(choices=CareLog.OBSERVATIONS)
    outcome = serializers.ChoiceField(choices=CareLog.OUTCOMES)
    confirmed = serializers.BooleanField()

    def validate(self, attrs):
        if not attrs["confirmed"]:
            raise serializers.ValidationError("Confirm that you have checked the plant first.")
        if attrs["outcome"] == "watered" and attrs["observation"] != "dry":
            raise serializers.ValidationError("Damp or uncertain soil cannot be recorded as watered.")
        return attrs

class PlantAccessSerializer(serializers.ModelSerializer):
    caretaker = PublicUserSerializer()

    class Meta:
        model = PlantAccess
        fields = ["id", "caretaker", "active", "created_at"]
