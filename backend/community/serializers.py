from rest_framework import serializers
from accounts.models import User
from accounts.serializers import PublicUserSerializer
from .models import Feedback, Friendship, Notification, Post

class FriendshipSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    incoming = serializers.SerializerMethodField()

    class Meta:
        model = Friendship
        fields = ["id", "user", "status", "incoming", "updated_at"]

    def get_user(self, friendship):
        current_id = self.context["request"].user.id
        other = friendship.user_high if friendship.user_low_id == current_id else friendship.user_low
        return PublicUserSerializer(other).data

    def get_incoming(self, friendship):
        return friendship.requester_id != self.context["request"].user.id

class FriendRequestSerializer(serializers.Serializer):
    user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(is_active=True))

class FriendResponseSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=["accepted", "rejected"])

class PostSerializer(serializers.ModelSerializer):
    author = PublicUserSerializer(read_only=True)
    like_count = serializers.IntegerField(read_only=True)
    liked = serializers.BooleanField(read_only=True)
    can_delete = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ["id", "author", "title", "body", "created_at", "like_count", "liked", "can_delete"]
        read_only_fields = ["id", "created_at"]

    def get_can_delete(self, post):
        return post.author_id == self.context["request"].user.id

class NotificationSerializer(serializers.ModelSerializer):
    sender = PublicUserSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = ["id", "sender", "kind", "plant", "message", "is_read", "created_at"]
        read_only_fields = fields

class ReminderInputSerializer(serializers.Serializer):
    recipient = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(is_active=True))
    message = serializers.CharField(max_length=300, required=False, default="Please check your plants.")
    plant = serializers.UUIDField(required=False)

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ["id", "message", "created_at"]
        read_only_fields = ["id", "created_at"]
