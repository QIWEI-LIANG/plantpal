from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.functions import Lower

class User(AbstractUser):
    nickname = models.CharField(max_length=30)

    class Meta:
        constraints = [models.UniqueConstraint(Lower("username"), name="unique_username_case_insensitive")]

    def __str__(self):
        return self.username
