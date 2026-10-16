from datetime import timedelta
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import CareLog
from .permissions import accessible_plants
from .serializers import CareInputSerializer

@transaction.atomic
def record_care(user, plant_id, data):
    # 授权在事务内重新检查，撤权后不能沿用之前打开页面时的权限。
    plant = get_object_or_404(accessible_plants(user), pk=plant_id)
    serializer = CareInputSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    observation = serializer.validated_data["observation"]
    outcome = serializer.validated_data["outcome"]
    now = timezone.now()
    log = CareLog.objects.create(
        plant=plant, actor=user,
        role="owner" if plant.owner_id == user.id else "caretaker",
        observation=observation, outcome=outcome, timestamp=now,
    )
    # 记录和安排同成同败，服务端时间为准；这是检查周期，不是浇水周期。
    plant.next_check_at = now + timedelta(hours=2 if outcome == "later" else 24)
    plant.save(update_fields=["next_check_at"])
    return plant, log
