from django.contrib import admin
from .models import CareLog, PlantAccess, PlantSpecies, UserPlant

@admin.register(PlantSpecies)
class PlantSpeciesAdmin(admin.ModelAdmin):
    list_display = ["slug", "scientific", "beginner", "drought_tolerant"]
    search_fields = ["slug", "scientific"]

@admin.register(UserPlant)
class UserPlantAdmin(admin.ModelAdmin):
    list_display = ["nickname", "owner", "species", "location", "next_check_at"]
    list_filter = ["species"]
    search_fields = ["nickname", "owner__username"]
    readonly_fields = ["id", "created_at"]

@admin.register(CareLog)
class CareLogAdmin(admin.ModelAdmin):
    list_display = ["plant", "actor", "observation", "outcome", "timestamp"]
    readonly_fields = ["plant", "actor", "role", "observation", "outcome", "timestamp"]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

@admin.register(PlantAccess)
class PlantAccessAdmin(admin.ModelAdmin):
    list_display = ["plant", "caretaker", "active", "created_at"]
    list_filter = ["active"]
