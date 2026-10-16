from django.contrib import admin
from .models import Feedback, Friendship, Like, Notification, Post

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ["user", "created_at"]
    readonly_fields = ["user", "message", "created_at"]

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ["title", "author", "created_at"]
    search_fields = ["title", "body", "author__username"]

@admin.register(Friendship)
class FriendshipAdmin(admin.ModelAdmin):
    list_display = ["user_low", "user_high", "requester", "status"]

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ["recipient", "sender", "kind", "is_read", "created_at"]

admin.site.register(Like)
