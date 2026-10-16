from datetime import timedelta
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from community.models import Notification
from .care_service import record_care
from .models import CareLog
from .permissions import accessible_plants, scoped_plants
from .plant_views import request_scope
from .serializers import CareLogSerializer, PlantReadSerializer

class CareRecordView(APIView):
    def post(self, request, pk):
        plant, log = record_care(request.user, pk, request.data)
        return Response({
            "plant": PlantReadSerializer(plant, context={"request": request}).data,
            "log": CareLogSerializer(log).data,
        }, status=201)

class CareHistoryView(generics.ListAPIView):
    serializer_class = CareLogSerializer

    def get_queryset(self):
        plants = scoped_plants(self.request.user, request_scope(self.request))
        plant_id = self.request.query_params.get("plant")
        if plant_id:
            plant_id = serializers.UUIDField().run_validation(plant_id)
            get_object_or_404(accessible_plants(self.request.user), pk=plant_id)
            plants = plants.filter(pk=plant_id)
        return CareLog.objects.filter(plant__in=plants).select_related("plant", "actor")

class DashboardView(APIView):
    def get(self, request):
        plants = scoped_plants(request.user, request_scope(request))
        now = timezone.now()
        return Response({
            "plants": plants.count(),
            "due": plants.filter(next_check_at__lte=now, next_check_at__gte=now - timedelta(hours=24)).count(),
            "overdue": plants.filter(next_check_at__lt=now - timedelta(hours=24)).count(),
            "scheduled": plants.filter(next_check_at__gt=now).count(),
            "history": CareLog.objects.filter(plant__in=plants).count(),
            "unread": Notification.objects.filter(recipient=request.user, is_read=False).count(),
            "server_time": now,
        })
