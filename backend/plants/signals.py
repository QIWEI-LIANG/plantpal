from django.db import transaction
from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch import receiver

from .models import UserPlant


@receiver(pre_save, sender=UserPlant)
def remember_previous_cover(sender, instance, **kwargs):
    update_fields = kwargs.get("update_fields")
    if update_fields is not None and "cover" not in update_fields:
        instance._previous_cover = None
        return
    instance._previous_cover = (
        sender.objects.filter(pk=instance.pk).values_list("cover", flat=True).first()
        if not instance._state.adding else None
    )


@receiver(post_save, sender=UserPlant)
def remove_replaced_cover(sender, instance, **kwargs):
    previous = getattr(instance, "_previous_cover", None)
    if previous and previous != instance.cover.name:
        storage = instance.cover.storage
        transaction.on_commit(lambda: storage.delete(previous))


@receiver(post_delete, sender=UserPlant)
def remove_deleted_cover(sender, instance, **kwargs):
    if instance.cover:
        storage, name = instance.cover.storage, instance.cover.name
        transaction.on_commit(lambda: storage.delete(name))
