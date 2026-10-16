from django.db.models import Count, Exists, OuterRef, Q
from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Like, Post
from .serializers import PostSerializer

def posts_for(user):
    return Post.objects.select_related("author").annotate(
        like_count=Count("likes"),
        liked=Exists(Like.objects.filter(post=OuterRef("pk"), user=user)),
    )

class PostListView(generics.ListCreateAPIView):
    serializer_class = PostSerializer

    def get_queryset(self):
        queryset = posts_for(self.request.user)
        query = self.request.query_params.get("search", "").strip()
        if query:
            queryset = queryset.filter(Q(title__icontains=query) | Q(body__icontains=query) | Q(author__username__icontains=query))
        ordering = self.request.query_params.get("ordering", "newest")
        return queryset.order_by("-like_count", "-created_at", "-id") if ordering == "popular" else queryset.order_by("-created_at", "-id")

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class PostDeleteView(APIView):
    def delete(self, request, pk):
        post = get_object_or_404(Post, pk=pk, author=request.user)
        post.delete()
        return Response(status=204)

class PostLikeView(APIView):
    def put(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        # PUT 幂等 + 数据库唯一约束；重复请求不会累计点赞。
        Like.objects.get_or_create(post=post, user=request.user)
        return Response({"liked": True, "like_count": post.likes.count()})

    def delete(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        Like.objects.filter(post=post, user=request.user).delete()
        return Response({"liked": False, "like_count": post.likes.count()})
