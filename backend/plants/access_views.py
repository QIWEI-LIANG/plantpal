from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView
from community.friend_service import are_friends
from community.models import Notification
from community.serializers import FriendRequestSerializer
from config.errors import BusinessError
from .models import PlantAccess, UserPlant
from .serializers import PlantAccessSerializer

class PlantAccessListView(APIView):
    def get(self, request, pk):
        plant = get_object_or_404(UserPlant, pk=pk, owner=request.user)
        return Response(PlantAccessSerializer(plant.accesses.select_related("caretaker").order_by("id"), many=True).data)

    @transaction.atomic
    def post(self, request, pk):
        plant = get_object_or_404(UserPlant, pk=pk, owner=request.user)
        serializer = FriendRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        caretaker = serializer.validated_data["user_id"]
        if not are_friends(request.user, caretaker):
            raise BusinessError("请先成为好友，再授权代管。", "Become friends before granting access.", status=403)
        access, created = PlantAccess.objects.get_or_create(plant=plant, caretaker=caretaker)
        if not created and not access.active:
            access.active = True
            access.save(update_fields=["active"])
            created = True
        if created:
            Notification.objects.create(recipient=caretaker, sender=request.user, plant=plant, kind="access_granted", message="You have been granted care access to a plant.")
        return Response(PlantAccessSerializer(access).data)

class PlantAccessRevokeView(APIView):
    @transaction.atomic
    def delete(self, request, pk, access_id):
        plant = get_object_or_404(UserPlant, pk=pk, owner=request.user)
        access = get_object_or_404(PlantAccess, pk=access_id, plant=plant)
        if access.active:
            access.active = False
            access.save(update_fields=["active"])
            Notification.objects.create(recipient=access.caretaker, sender=request.user, kind="access_revoked", message="Care access to a plant was revoked.")
        return Response(status=204)
