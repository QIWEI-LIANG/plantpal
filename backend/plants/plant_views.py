from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView

from config.errors import BusinessError
from .models import UserPlant
from .permissions import scoped_plants, accessible_plants
from .serializers import PlantReadSerializer, PlantWriteSerializer

def request_scope(request):
    scope = request.query_params.get("scope", "all")
    if scope not in ["owned", "caretaking", "all"]:
        raise BusinessError("无效的植物范围。", "Invalid plant scope.")
    return scope

class PlantListView(generics.ListCreateAPIView):
    serializer_class = PlantReadSerializer

    def get_queryset(self):
        queryset = scoped_plants(self.request.user, request_scope(self.request))
        query = self.request.query_params.get("search", "").strip()
        if query:
            queryset = queryset.filter(Q(nickname__icontains=query) | Q(location__icontains=query) | Q(species__name__zh__icontains=query) | Q(species__name__en__icontains=query))
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = PlantWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        plant = serializer.save(owner=request.user)
        return Response(PlantReadSerializer(plant, context={"request": request}).data, status=201)

class PlantDetailView(APIView):
    def get(self, request, pk):
        plant = get_object_or_404(accessible_plants(request.user), pk=pk)
        return Response(PlantReadSerializer(plant, context={"request": request}).data)

    def patch(self, request, pk):
        plant = get_object_or_404(UserPlant, pk=pk, owner=request.user)
        serializer = PlantWriteSerializer(plant, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        plant = serializer.save()
        return Response(PlantReadSerializer(plant, context={"request": request}).data)

    def delete(self, request, pk):
        plant = get_object_or_404(UserPlant, pk=pk, owner=request.user)
        plant.delete()
        return Response(status=204)
