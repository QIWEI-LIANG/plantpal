from django.apps import AppConfig


class PlantsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "plants"

    def ready(self):
        from . import signals  # noqa: F401
