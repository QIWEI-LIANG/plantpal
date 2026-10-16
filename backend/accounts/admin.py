from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class PlantPalUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (("Plant Pal", {"fields": ("nickname",)}),)
    add_fieldsets = UserAdmin.add_fieldsets + (("Plant Pal", {"fields": ("nickname",)}),)
    list_display = ["username", "nickname", "email", "is_staff"]
