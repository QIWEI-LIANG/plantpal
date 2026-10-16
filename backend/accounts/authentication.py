from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import SAFE_METHODS

class CsrfSessionAuthentication(SessionAuthentication):
    def authenticate(self, request):
        # DRF 默认只检查已登录会话；注册、登录的匿名写请求也必须验证 CSRF。
        if request.method not in SAFE_METHODS:
            self.enforce_csrf(request)
        return super().authenticate(request)
