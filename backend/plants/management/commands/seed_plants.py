import json
from pathlib import Path
from django.core.management.base import BaseCommand
from plants.models import PlantSpecies

class Command(BaseCommand):
    help = "Add missing plant species; never overwrite existing or user-owned data."

    def handle(self, *args, **options):
        data_path = Path(__file__).resolve().parents[2] / "seed_data.json"
        data = json.loads(data_path.read_text(encoding="utf-8"))
        added = 0
        for item in data:
            slug = item["slug"]
            defaults = {key: value for key, value in item.items() if key != "slug"}
            _, created = PlantSpecies.objects.get_or_create(slug=slug, defaults=defaults)
            added += int(created)
        self.stdout.write(self.style.SUCCESS(f"Added {added} species; existing species were preserved."))
