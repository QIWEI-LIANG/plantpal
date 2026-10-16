from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from config.errors import BusinessError
from .models import Friendship, Notification

def relationships(user):
    return Friendship.objects.filter(Q(user_low=user) | Q(user_high=user)).select_related("user_low", "user_high").order_by("-updated_at")

def are_friends(first, second):
    low, high = sorted([first.pk, second.pk])
    return Friendship.objects.filter(user_low_id=low, user_high_id=high, status="accepted").exists()

@transaction.atomic
def request_friend(user, other):
    if user == other:
        raise BusinessError("不能添加自己为好友。", "You cannot add yourself.")
    low, high = sorted([user.pk, other.pk])
    friendship, created = Friendship.objects.get_or_create(
        user_low_id=low, user_high_id=high, defaults={"requester": user},
    )
    if friendship.status == "rejected":
        friendship.requester = user
        friendship.status = "pending"
        friendship.save()
        created = True
    if created:
        Notification.objects.create(recipient=other, sender=user, kind="friend_request", message="You have a new friend request.")
    return friendship

@transaction.atomic
def respond_to_friend(user, friendship_id, status):
    friendship = get_object_or_404(relationships(user), pk=friendship_id)
    if friendship.requester_id == user.id or friendship.status != "pending":
        raise BusinessError("只有申请接收者可以处理待确认申请。", "Only the recipient can respond to a pending request.", status=403)
    friendship.status = status
    friendship.save(update_fields=["status", "updated_at"])
    if status == "accepted":
        Notification.objects.create(recipient=friendship.requester, sender=user, kind="friend_accepted", message="Your friend request was accepted.")
    return friendship
