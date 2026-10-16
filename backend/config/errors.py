from rest_framework.exceptions import APIException
from rest_framework.views import exception_handler

class BusinessError(APIException):
    def __init__(self, zh, en, code="invalid", status=400):
        self.status_code = status
        self.message = {"zh": zh, "en": en}
        self.error_code = code
        super().__init__(en, code=code)

def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return None
    code = getattr(exc, "default_code", "invalid")
    if isinstance(exc, BusinessError):
        code = exc.error_code
        message = exc.message
    else:
        message = {
            "zh": {400: "请检查填写的信息。", 403: "请登录，或确认你有操作权限。", 404: "内容不存在或你没有访问权限。", 429: "操作过于频繁，请稍后重试。"}.get(response.status_code, "请求失败，请重试。"),
            "en": {400: "Please check the entered information.", 403: "Please sign in or check your access.", 404: "Not found or no access.", 429: "Too many requests. Please try later."}.get(response.status_code, "Request failed. Please retry."),
        }
    response.data = {"error": {"code": code, "message": message, "fields": response.data}}
    return response
