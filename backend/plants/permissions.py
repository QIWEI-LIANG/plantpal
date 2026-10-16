from django.db.models import Q
from .models import UserPlant

def accessible_plants(user):
    # 每次请求都从数据库检查授权；好友关系本身不参与植物权限判断。
    return UserPlant.objects.filter(
        Q(owner=user) | Q(accesses__caretaker=user, accesses__active=True)
    ).select_related("species", "owner").distinct()

def scoped_plants(user, scope):
    plants = accessible_plants(user)
    if scope == "owned":
        return plants.filter(owner=user)
    if scope == "caretaking":
        return plants.exclude(owner=user)
    return plants
