from django.urls import path
from .friend_views import FriendshipListView, FriendshipResponseView, UserSearchView
from .notification_views import FeedbackCreateView, NotificationListView, NotificationReadView
from .post_views import PostDeleteView, PostLikeView, PostListView

urlpatterns = [
    path("users/", UserSearchView.as_view()),
    path("friendships/", FriendshipListView.as_view()),
    path("friendships/<int:pk>/", FriendshipResponseView.as_view()),
    path("posts/", PostListView.as_view()),
    path("posts/<int:pk>/", PostDeleteView.as_view()),
    path("posts/<int:pk>/like/", PostLikeView.as_view()),
    path("notifications/", NotificationListView.as_view()),
    path("notifications/<int:pk>/", NotificationReadView.as_view()),
    path("feedback/", FeedbackCreateView.as_view()),
]
