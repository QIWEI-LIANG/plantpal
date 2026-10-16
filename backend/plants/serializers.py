from datetime import timedelta
from django.utils import timezone
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

    class Meta:
        model = UserPlant
        fields = ["id", "species", "owner", "nickname", "location", "owner_notes", "next_check_at", "created_at", "can_edit", "check_status"]

    def get_can_edit(self, plant):
        return plant.owner_id == self.context["request"].user.id

    def get_check_status(self, plant):
        now = timezone.now()
        if plant.next_check_at > now:
            return "scheduled"
        return "overdue" if plant.next_check_at < now - timedelta(hours=24) else "due"

class PlantWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPlant
        fields = ["species", "nickname", "location", "owner_notes"]

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
