import uuid
from pathlib import Path
from django.conf import settings
from django.db import models
from django.utils import timezone

def plant_cover_path(instance, filename):
    return f"plant-covers/{instance.pk}/{uuid.uuid4().hex}{Path(filename).suffix.lower()}"

class PlantSpecies(models.Model):
    slug = models.SlugField(unique=True)
    name = models.JSONField(default=dict)
    scientific = models.CharField(max_length=150)
    art_type = models.CharField(max_length=20, default="split")
    color = models.CharField(max_length=20, default="#e6ede2")
    difficulty = models.JSONField(default=dict)
    light = models.JSONField(default=dict)
    water = models.JSONField(default=dict)
    check_guidance = models.JSONField(default=dict)
    tip = models.JSONField(default=dict)
    beginner = models.BooleanField(default=False)
    drought_tolerant = models.BooleanField(default=False)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return self.name.get("zh", self.slug)

class UserPlant(models.Model):
    # 品种是共享知识；每盆植物都有独立 UUID，不能用 species_id 充当盆栽 ID。
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="plants")
    species = models.ForeignKey(PlantSpecies, on_delete=models.PROTECT, related_name="plants")
    nickname = models.CharField(max_length=80)
    location = models.CharField(max_length=120)
    owner_notes = models.TextField(blank=True, max_length=600)
    cover = models.ImageField(upload_to=plant_cover_path, blank=True, null=True)
    next_check_at = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["owner", "next_check_at"])]

    def __str__(self):
        return f"{self.nickname} ({self.owner.username})"

class PlantAccess(models.Model):
    plant = models.ForeignKey(UserPlant, on_delete=models.CASCADE, related_name="accesses")
    caretaker = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="plant_accesses")
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["plant", "caretaker"], name="unique_plant_caretaker")]

class CareLog(models.Model):
    OBSERVATIONS = [("dry", "Dry"), ("damp", "Damp"), ("unsure", "Unsure")]
    OUTCOMES = [("watered", "Watered"), ("skipped", "Not needed"), ("later", "Check later")]
    plant = models.ForeignKey(UserPlant, on_delete=models.CASCADE, related_name="care_logs")
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="care_logs")
    role = models.CharField(max_length=10, choices=[("owner", "Owner"), ("caretaker", "Caretaker")])
    observation = models.CharField(max_length=10, choices=OBSERVATIONS)
    outcome = models.CharField(max_length=10, choices=OUTCOMES)
    timestamp = models.DateTimeField(default=timezone.now, editable=False)

    class Meta:
        ordering = ["-timestamp", "-id"]
        constraints = [
            models.CheckConstraint(condition=models.Q(observation__in=["dry", "damp", "unsure"]), name="valid_care_observation"),
            models.CheckConstraint(condition=models.Q(outcome__in=["watered", "skipped", "later"]), name="valid_care_outcome"),
            models.CheckConstraint(condition=~models.Q(outcome="watered") | models.Q(observation="dry"), name="water_only_if_dry"),
        ]
