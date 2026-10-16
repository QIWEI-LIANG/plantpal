from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from config.errors import BusinessError
from plants.permissions import accessible_plants
from .friend_service import are_friends
from .models import Feedback, Notification
from .serializers import FeedbackSerializer, NotificationSerializer, ReminderInputSerializer

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).select_related("sender")

    def post(self, request):
        serializer = ReminderInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        recipient = serializer.validated_data["recipient"]
        if not are_friends(request.user, recipient):
            raise BusinessError("只能给已接受申请的好友发送站内提醒。", "Reminders can only be sent to accepted friends.", status=403)
        plant = None
        plant_id = serializer.validated_data.get("plant")
        if plant_id:
            plant = get_object_or_404(accessible_plants(request.user), pk=plant_id)
            get_object_or_404(accessible_plants(recipient), pk=plant_id)
        notification = Notification.objects.create(
            recipient=recipient, sender=request.user, plant=plant,
            message=serializer.validated_data["message"],
        )
        return Response(NotificationSerializer(notification).data, status=201)

class NotificationReadView(APIView):
    def patch(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, recipient=request.user)
        notification.is_read = True
        notification.save(update_fields=["is_read"])
        return Response(NotificationSerializer(notification).data)

class FeedbackCreateView(generics.CreateAPIView):
    serializer_class = FeedbackSerializer
    queryset = Feedback.objects.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
