from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.models import User
from accounts.serializers import PublicUserSerializer
from .friend_service import relationships, request_friend, respond_to_friend
from .serializers import FriendRequestSerializer, FriendResponseSerializer, FriendshipSerializer

class UserSearchView(generics.ListAPIView):
    serializer_class = PublicUserSerializer

    def get_queryset(self):
        query = self.request.query_params.get("search", "").strip()
        if len(query) < 2:
            return User.objects.none()
        return User.objects.filter(is_active=True, username__icontains=query).exclude(pk=self.request.user.pk).order_by("username")

class FriendshipListView(generics.ListAPIView):
    serializer_class = FriendshipSerializer

    def get_queryset(self):
        return relationships(self.request.user)

    def post(self, request):
        serializer = FriendRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        friendship = request_friend(request.user, serializer.validated_data["user_id"])
        return Response(FriendshipSerializer(friendship, context={"request": request}).data)

class FriendshipResponseView(APIView):
    def patch(self, request, pk):
        serializer = FriendResponseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        friendship = respond_to_friend(request.user, pk, serializer.validated_data["status"])
        return Response(FriendshipSerializer(friendship, context={"request": request}).data)
