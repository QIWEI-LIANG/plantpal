# PlantPal 后端

Django 5.2.18 + Django REST Framework 3.18.3 + SQLite，使用 Python 3.11。实际位置为 `D:\GitHub\plantpal\backend`。完整安装、环境变量、功能限制及迁移验证记录见[根目录 README](../README.md)。

## 数据库状态

已通过 Django ORM 接入 SQLite，默认文件为 `backend/db.sqlite3`，配置见 [`config/settings.py`](config/settings.py) 的 `DATABASES`；`DJANGO_DB_NAME` 可覆盖文件路径。用户、品种、个人盆栽、养护记录、代管授权、好友、帖子、点赞、提醒和反馈均持久化到数据库，无需另外安装数据库服务。

2026-10-23 已确认：10 张业务表齐全、6 个品种已初始化、全部迁移（含封面字段）已应用、模型与迁移一致，SQLite 完整性及外键检查通过，30 项后端测试通过。添加字段前已备份数据库，迁移后原有业务记录保持一致。

业务表清单、实际数据库路径查询、完整性检查及备份恢复说明见[数据库文档](../README.md#数据库已接入-sqlite)。初次安装执行下方 `migrate` 和 `seed_plants`；已有数据库更新代码后执行 `migrate`，保留已有文件。

## 首次运行（PowerShell）

```powershell
Set-Location 'D:\GitHub\plantpal'
Set-Location .\backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements-lock.txt
if (!(Test-Path -LiteralPath .env)) { Copy-Item .env.example .env }
python -c "from dotenv import dotenv_values, set_key; from django.core.management.utils import get_random_secret_key; set_key('.env', 'DJANGO_SECRET_KEY', get_random_secret_key()) if not dotenv_values('.env').get('DJANGO_SECRET_KEY') else None"
python manage.py migrate
python manage.py seed_plants
# 可选：交互创建自己的管理员
python manage.py createsuperuser
python manage.py runserver 127.0.0.1:8000
```

已有可用 `.venv` 时跳过创建。激活受执行策略限制时，将 `python` 换成 `.\.venv\Scripts\python.exe`。实际 `.env` 不提交，已有密钥应保留；`DJANGO_DB_NAME` 默认相对 backend 目录解析为 `db.sqlite3`，不随当前终端目录变化。不要删除现有数据库。

下次启动只需在仓库根目录执行：

```powershell
Set-Location 'D:\GitHub\plantpal'
pnpm dev:backend
```

API：http://127.0.0.1:8000/api/species/；Admin：http://127.0.0.1:8000/admin/。前端通过 Vite 的 `/api` 同源代理访问。管理员需自行交互创建，本次迁移未创建管理员。

## 文件职责

- `accounts/`：自定义用户、注册/登录、资料与 Session/CSRF；匿名写请求也验证 CSRF。
- `plants/`：品种、盆栽 UUID、养护记录、逐盆授权和撤销，含测试与种子命令。
- `community/`：好友、帖子、点赞、站内提醒和反馈。
- `config/`：环境加载、数据库、路由、分页和统一错误响应。
- 各应用 `migrations/`：必须提交的模型历史；`requirements-lock.txt` 固定直接及间接依赖。

`seed_plants` 读取 `plants/seed_data.json`，按唯一 slug 仅补充缺失品种，不覆盖管理员编辑，不生成用户业务数据。已有指南在 Admin 中编辑。养护记录和下次检查时间在同一事务保存。好友关系不自动赋予植物权限，授权撤销在下一次 API 请求时生效。

注册需要 `password_confirm` 与 `password` 一致。主人可修改盆栽 `next_check_at`（带时区的 ISO 时间），提醒按该时间计算；下次记录养护后仍按 2/24 小时规则重新安排。

盆栽创建/编辑接口支持 multipart 的 `cover` 图片字段，JSON `cover: null` 可移除。Pillow 13.0.0 校验 JPG/PNG/WebP（最大 5 MB、2500 万像素），统一方向、去除元数据并保存为最长边不超过 2000 像素的 JPEG。文件保存在 `media/plant-covers/`，备份时需与数据库一起保存。`GET /api/plants/{id}/cover/` 检查主人/有效代管权限，不公开媒体目录；更换、移除或删除盆栽后清理旧封面。

## 检查与测试（在 backend 目录）

```powershell
.\.venv\Scripts\python.exe manage.py check
.\.venv\Scripts\python.exe manage.py makemigrations --check --dry-run
.\.venv\Scripts\python.exe manage.py migrate --check
.\.venv\Scripts\python.exe manage.py test accounts plants community --verbosity 2
.\.venv\Scripts\python.exe -m pip check
```

测试使用独立测试数据库和临时媒体目录。目前共 30 项测试，包含封面上传、格式/大小限制、读取与修改权限、撤权、文件清理、检查时间与时区、注册确认密码。

当前支持植物封面上传，尚未接入自动图片识别、邮件/短信、后台推送或生产部署配置。虚拟环境、实际环境变量、数据库、用户文件和迁移备份不提交 Git。
