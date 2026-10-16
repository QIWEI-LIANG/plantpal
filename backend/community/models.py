from django.conf import settings
from django.db import models

class Friendship(models.Model):
    # 排序后的用户对只有一条关系；方向由 requester 决定，杜绝反向重复申请。
    user_low = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="friendships_low")
    user_high = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="friendships_high")
    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="friend_requests")
    status = models.CharField(max_length=10, choices=[("pending", "Pending"), ("accepted", "Accepted"), ("rejected", "Rejected")], default="pending")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user_low", "user_high"], name="unique_friend_pair"),
            models.CheckConstraint(condition=models.Q(user_low__lt=models.F("user_high")), name="ordered_friend_pair"),
            models.CheckConstraint(condition=models.Q(requester=models.F("user_low")) | models.Q(requester=models.F("user_high")), name="requester_is_friend_member"),
        ]

class Post(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="posts")
    title = models.CharField(max_length=160)
    body = models.TextField(max_length=5000)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-id"]

class Like(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="post_likes")

    class Meta:
        constraints = [models.UniqueConstraint(fields=["post", "user"], name="unique_post_like")]

class Notification(models.Model):
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="sent_notifications")
    kind = models.CharField(max_length=30, default="care_reminder")
    # 只发送本人有权限的植物链接；正文不复制主人说明等私密数据。
    plant = models.ForeignKey("plants.UserPlant", on_delete=models.SET_NULL, null=True, blank=True)
    message = models.CharField(max_length=300)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-id"]

class Feedback(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="feedback")
    message = models.TextField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
