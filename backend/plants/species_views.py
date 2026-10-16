from django.db.models import Q
from rest_framework import generics, permissions
from .models import PlantSpecies
from .serializers import PlantSpeciesSerializer

class SpeciesListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = PlantSpeciesSerializer

    def get_queryset(self):
        queryset = PlantSpecies.objects.all()
        query = self.request.query_params.get("search", "").strip()
        if query:
            queryset = queryset.filter(Q(name__zh__icontains=query) | Q(name__en__icontains=query) | Q(scientific__icontains=query))
        category = self.request.query_params.get("category")
        if category == "easy":
            queryset = queryset.filter(beginner=True)
        elif category == "dry":
            queryset = queryset.filter(drought_tolerant=True)
        return queryset

class SpeciesDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = PlantSpeciesSerializer
    queryset = PlantSpecies.objects.all()
