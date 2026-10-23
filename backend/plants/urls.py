from django.urls import path
from .plant_views import PlantCoverView, PlantDetailView, PlantListView
from .species_views import SpeciesDetailView, SpeciesListView
from .care_views import CareHistoryView, CareRecordView, DashboardView
from .access_views import PlantAccessListView, PlantAccessRevokeView

urlpatterns = [
    path("plants/<uuid:pk>/cover/", PlantCoverView.as_view()),
    path("plants/<uuid:pk>/access/", PlantAccessListView.as_view()),
    path("plants/<uuid:pk>/access/<int:access_id>/", PlantAccessRevokeView.as_view()),
    path("dashboard/", DashboardView.as_view()),
    path("care-logs/", CareHistoryView.as_view()),
    path("plants/<uuid:pk>/care/", CareRecordView.as_view()),
    path("species/", SpeciesListView.as_view()),
    path("species/<int:pk>/", SpeciesDetailView.as_view()),
    path("plants/", PlantListView.as_view()),
    path("plants/<uuid:pk>/", PlantDetailView.as_view()),
]
