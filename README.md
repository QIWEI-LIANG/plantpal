# PlantPal 植物养护应用

React + Vite 前端、Django REST Framework 后端的本地全栈项目。业务数据保存在 SQLite；认证使用 Django Session + CSRF，localStorage 只保存界面语言。

仓库根目录：`D:\GitHub\plantpal`。前端：`plant-nursery/`。后端：`backend/`。根目录 pnpm 脚本负责转发启动和检查命令，现有 Git 历史保留。

## 当前功能与限制

- 注册（含确认密码）、登录、退出、当前账户及昵称/邮箱编辑。
- 中英文品种搜索和养护指南；每盆植物独立新增、编辑、删除，拥有自己的 UUID、位置、主人说明和历史。植物详情右上侧提供红色删除按钮，删除前再次确认。
- 支持上传 JPG/PNG/WebP 作为盆栽封面（最大 5 MB、2500 万像素），可更换或恢复默认插画；封面只向主人及当前获授权的代管者提供。所有弹窗的关闭按钮固定在顶部，内容独立滚动。
- 可在植物详情的删除按钮下方修改“下次检查”时间，点击“保存植物资料”生效；提醒按保存的时间分类，未来安排按时间排序。首页识别入口整张卡片可点击。
- 首页统计、待检查/逾期/未来安排；观察土壤并确认后记录养护，服务端原子更新历史和下次检查时间。
- 好友申请与处理、逐盆代管授权和撤销；好友关系本身不共享植物。代管者可查看和记录养护，不能编辑、删除或再次授权。
- 站内提醒与已读状态、纯文本论坛帖子、点赞和反馈；中英文界面。
- **植物识别尚未接入**：目前只有本地图片预览和手动选择品种，不上传图片、不调用识别服务，也不生成模拟识别结果。
- 未实现邮件/短信、后台推送、实时聊天或生产部署；SQLite 用于本地开发，尚未进行生产并发压力验证。页面关闭后不会继续发送提醒。

## 数据库：已接入 SQLite

项目已有完整的数据库持久化实现，无需新增数据库。前端通过 `/api` 调用 Django，后端通过 ORM 读写 SQLite；刷新页面或重启服务后，已保存的业务数据仍然保留。浏览器 localStorage 只保存语言偏好。

- 配置位置：[`backend/config/settings.py`](backend/config/settings.py) 中的 `DATABASES`。
- 默认文件：`backend/db.sqlite3`；可通过 `backend/.env` 的 `DJANGO_DB_NAME` 修改，相对路径以 `backend/` 为基准。
- 初始化方式：`migrate` 创建表，`seed_plants` 补充 6 个共享品种；完整命令见下文“首次安装”。无需安装 MySQL、PostgreSQL 或独立 SQLite 服务。
- 版本管理：提交模型、迁移文件及品种种子数据；实际数据库文件和 `.env` 已由 `.gitignore` 排除。

### 业务表与用途

| 数据表 | 对应模型 | 保存内容 |
| --- | --- | --- |
| `accounts_user` | `User` | 账户、密码哈希、昵称、邮箱 |
| `plants_plantspecies` | `PlantSpecies` | 中英文品种信息和养护指南 |
| `plants_userplant` | `UserPlant` | 每盆植物的 UUID、主人、昵称、位置、说明、封面文件路径和下次检查时间 |
| `plants_plantaccess` | `PlantAccess` | 逐盆代管授权及有效状态 |
| `plants_carelog` | `CareLog` | 养护人、身份、土壤观察、处理结果和服务端时间 |
| `community_friendship` | `Friendship` | 好友申请、发起人和处理状态 |
| `community_post` | `Post` | 帖子作者、标题、正文和发布时间 |
| `community_like` | `Like` | 用户对帖子的点赞关系 |
| `community_notification` | `Notification` | 收发人、关联植物、提醒内容及已读状态 |
| `community_feedback` | `Feedback` | 用户反馈及提交时间 |

Django 另建 Session、权限、管理日志和迁移记录等系统表。盆栽通过外键关联主人和品种，养护记录与代管授权关联具体盆栽；用户名、品种 slug、代管关系、好友用户对及点赞关系设有唯一约束。养护记录还通过数据库约束限制观察/处理结果，并禁止对非干燥土壤记录“已浇水”。

### 检查与日常维护

以下命令在仓库根目录执行，使用已安装依赖的后端虚拟环境：

```powershell
# 显示当前配置实际使用的数据库路径
.\backend\.venv\Scripts\python.exe backend/manage.py shell -c "from django.conf import settings; print(settings.DATABASES['default']['NAME'])"
# [X] 表示迁移已应用；migrate --check 无输出且退出码为 0 表示无待应用迁移
.\backend\.venv\Scripts\python.exe backend/manage.py showmigrations
.\backend\.venv\Scripts\python.exe backend/manage.py migrate --check
# SQLite 完整性检查应返回 [('ok',)]；外键检查应返回 []
.\backend\.venv\Scripts\python.exe backend/manage.py shell -c "from django.db import connection; c = connection.cursor(); c.execute('PRAGMA integrity_check'); print(c.fetchall()); c.execute('PRAGMA foreign_key_check'); print(c.fetchall())"
```

模型变更后，先执行 `makemigrations` 生成并提交迁移，再执行 `migrate` 更新数据库。更新代码后先检查并应用仓库已有迁移，不要删除数据库重建。`seed_plants` 可重复运行，不覆盖已有品种编辑。

备份时先停止 Django 及其他访问该数据库的进程，再将**实际配置路径**下的 SQLite 文件及 `backend/media/` 封面目录一起复制到仓库外的备份目录。恢复前同样停止相关进程并备份当前数据，再恢复数据库及对应封面文件，执行 `migrate` 和上述完整性检查。`.env` 单独保管，保持 `DJANGO_SECRET_KEY` 稳定。

2026-10-23 检查结果：本地 `backend/db.sqlite3` 存在，以上 10 张业务表齐全，包含 6 个品种；全部迁移（含 `plants.0002_userplant_cover`）已应用，模型与迁移一致，SQLite 完整性检查为 `ok`，无外键违规，30 项后端测试通过。添加封面字段前已备份数据库，并核对原有业务记录保持一致。

## 技术栈与目录

本次验证环境：Windows PowerShell、Python 3.11.6、Node.js 24.10.0、pnpm 12.9.1。现有锁文件解析为 React/React DOM 19.3.0、Vite 8.3.2；后端直接依赖固定为 Django 5.2.18、Django REST Framework 3.18.3、python-dotenv 1.2.4、Pillow 13.0.0。数据库使用 Python 内置 SQLite 驱动，无需另外安装数据库服务。

Node 版本要求：`^20.19.0 || ^22.13.0 || >=24`。前端沿用 pnpm 和 `pnpm-lock.yaml`；不要混用 npm 生成另一份锁文件。后端 `requirements.txt` 固定直接依赖，`requirements-lock.txt` 同时固定间接依赖，安装时使用后者。

```text
D:\GitHub\plantpal\
├── .git/                       # 现有仓库历史
├── .gitattributes              # 文本 LF 与图片二进制规则
├── .gitignore                  # 排除依赖、环境、数据库和用户文件
├── package.json                # 根目录启动、检查和构建入口
├── pnpm-lock.yaml              # 根目录工具锁文件
├── README.md
├── backend/
│   ├── manage.py               # Django 管理入口
│   ├── .env.example            # 可提交的环境变量模板
│   ├── requirements.txt / requirements-lock.txt
│   ├── config/                 # 环境变量、数据库、路由、分页和错误格式
│   ├── accounts/               # 自定义用户、Session、CSRF、账户接口与测试
│   ├── plants/                 # 品种、盆栽、养护记录、授权与测试
│   │   ├── migrations/         # 必须提交的数据库版本历史
│   │   ├── seed_data.json      # 6 个品种的初始化数据
│   │   └── management/commands/seed_plants.py
│   ├── community/              # 好友、帖子、点赞、站内提醒、反馈与测试
│   ├── media/                  # 用户上传的植物封面，不提交
│   ├── .venv/                  # 本地重建的虚拟环境，不提交
│   └── db.sqlite3              # 默认本地数据库，不提交
└── plant-nursery/
    ├── package.json / pnpm-lock.yaml
    ├── vite.config.js          # /api 同源代理到 Django
    ├── eslint.config.js / .prettierrc.json
    ├── index.html / public/
    ├── docs/                   # 原型截图，不代表当前功能验收结果
    └── src/
        ├── pages/              # 各页面；首页从 HomePage.jsx 开始修改
        ├── components/         # 布局、表单、详情、养护、授权和分页
        ├── services/api.js      # fetch、Cookie/CSRF、超时和错误处理
        ├── hooks/              # 会话、请求、提交与植物状态
        ├── data/               # 格式化与语言偏好存储
        ├── styles/             # 原样式与 fullstack.css
        └── App.jsx / main.jsx  # 页面状态和应用入口
```

`accounts`、`plants`、`community` 均包含初始 migration。数据库默认路径由 `config/settings.py` 相对后端目录解析，与终端当前目录无关。

## 首次安装：Windows PowerShell

先安装 Python 3.11、符合要求的 Node.js 和 pnpm 12.9.1。若没有 pnpm，可先执行 `npm install --global pnpm@12.9.1` 安装工具；项目依赖仍使用 pnpm 安装。

### 终端 A：配置并启动后端

```powershell
# 从仓库根目录开始
Set-Location 'D:\GitHub\plantpal'
Set-Location .\backend

# 以下命令均在 D:\GitHub\plantpal\backend 执行
# 仅在没有可用 .venv 时创建；移动项目后请在新位置重建虚拟环境
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements-lock.txt

# 已有 .env 时保留，不覆盖已有密钥
if (!(Test-Path -LiteralPath .env)) { Copy-Item .env.example .env }
python -c "from dotenv import dotenv_values, set_key; from django.core.management.utils import get_random_secret_key; set_key('.env', 'DJANGO_SECRET_KEY', get_random_secret_key()) if not dotenv_values('.env').get('DJANGO_SECRET_KEY') else None"

python manage.py migrate
python manage.py seed_plants
# 可选：需要访问管理后台时，交互创建你自己的管理员
python manage.py createsuperuser
python manage.py runserver 127.0.0.1:8000
```

若执行策略阻止 `Activate.ps1`，可跳过激活，把后续 `python` 替换为 `.\.venv\Scripts\python.exe`；无需更改系统执行策略。本次迁移已在新位置重建 `.venv` 并保留原 `.env` 与数据库，现有工作区可直接使用下面的重新启动命令。

`seed_plants` 按唯一 slug 补充缺失的 6 个品种，可重复执行；不会覆盖管理后台修改过的指南，也不会创建用户、个人盆栽、好友或历史。修改数据库中已有指南请使用 Django Admin。

环境变量在 `backend/.env` 配置，由 `python-dotenv` 加载；进程环境变量优先。模板 `backend/.env.example` 不含真实密钥：

| 变量                            | 用途                                                              |
| ------------------------------- | ----------------------------------------------------------------- |
| `DJANGO_SECRET_KEY`           | 必填，首次生成后保持稳定，不提交 Git                              |
| `DJANGO_DEBUG`                | 本地 HTTP 开发使用 `True`；也影响 Cookie Secure 设置            |
| `DJANGO_ALLOWED_HOSTS`        | 默认 `127.0.0.1,localhost`                                      |
| `DJANGO_CSRF_TRUSTED_ORIGINS` | 开发端口 5173、预览端口 4173 的 Origin，逗号分隔                  |
| `DJANGO_DB_NAME`              | 默认 `db.sqlite3`，相对路径从 `backend/` 解析；也支持绝对路径 |

保留现有数据库，更新模型后执行迁移；不要用删除数据库解决迁移问题。生产环境需要另外配置 HTTPS、静态文件和部署服务。

### 终端 B：安装并启动前端

```powershell
# 以下命令均在仓库根目录 D:\GitHub\plantpal 执行
Set-Location 'D:\GitHub\plantpal'
pnpm install --frozen-lockfile
pnpm --dir plant-nursery install --frozen-lockfile
pnpm dev
```

- 前端：http://127.0.0.1:5173/
- Django API / 品种：http://127.0.0.1:8000/api/species/
- 管理后台：http://127.0.0.1:8000/admin/

Vite 把 `/api` 代理到 `http://127.0.0.1:8000`；浏览器通过前端同源路径访问接口，Session Cookie 和 CSRF 随请求传递。前后端必须同时运行。统一使用 `127.0.0.1`，避免与 `localhost` 混用导致 Cookie 分离；不需要另外添加 CORS 库或前端 `.env`。

## 关闭后，下次重新启动

两个终端分别按 `Ctrl+C` 停止。重新启动无需再次安装、初始化品种或创建管理员。

终端 A（后端，以下命令从仓库根目录开始，不依赖环境激活）：

```powershell
Set-Location 'D:\GitHub\plantpal'
pnpm dev:backend
```

也可使用激活方式：

```powershell
Set-Location 'D:\GitHub\plantpal'
Set-Location .\backend
.\.venv\Scripts\Activate.ps1
python manage.py runserver 127.0.0.1:8000
```

终端 B（前端）：

```powershell
Set-Location 'D:\GitHub\plantpal'
pnpm dev
```

根目录后端 pnpm 脚本使用 Windows `.venv\Scripts\python.exe`，无需激活；其他平台应使用对应虚拟环境的 Python 直接运行 `backend/manage.py`。

## 检查、测试和构建预览

```powershell
# 仓库根目录
Set-Location 'D:\GitHub\plantpal'
pnpm lint
pnpm build
pnpm check:backend
pnpm test:backend

# backend 目录；使用明确的虚拟环境 Python，不依赖激活
Set-Location .\backend
.\.venv\Scripts\python.exe manage.py check
.\.venv\Scripts\python.exe manage.py makemigrations --check --dry-run
.\.venv\Scripts\python.exe manage.py migrate --check
.\.venv\Scripts\python.exe manage.py test accounts plants community --verbosity 2
.\.venv\Scripts\python.exe -m pip check
```

前端没有单独的自动化测试脚本，现有检查为 lint 和 build。Django 测试使用独立测试数据库。

构建后，在仓库根目录执行 `pnpm preview`，访问 http://127.0.0.1:4173/；仍需启动 Django。当前预览配置也代理 `/api`，不是生产部署方案。

此前工作区迁移已验证：两份 pnpm 锁文件的冻结安装、后端锁定依赖安装、前端 lint/build、Django check、模型与 migration 一致性、本地已应用迁移检查、pip check、原有 23 项后端测试。另在独立临时数据库执行了全部迁移和品种初始化，并验证前端 HTML、Vite API 代理、品种列表、CSRF/Session、注册/登录/退出、盆栽创建、养护记录及重新登录后的读取，以及 Admin 登录页。

2026-10-23 的 `improve.md` 改进已验证前端 lint/build、30 项后端测试、迁移一致性及依赖检查。另使用 Chrome 自动验证注册密码确认、首页整卡跳转、上传封面创建植物、修改检查时间并持久化、桌面/手机尺寸下滚动弹窗仍可关闭、取消/确认删除及未来提醒和养护历史展示。测试数据已清理，现有用户和植物保留；未执行全部页面或生产部署回归，旧原型截图不作为这些检查的依据。

## 数据与权限说明

`PlantSpecies` 是共享品种，`UserPlant` 是具体盆栽；同品种可以拥有多盆，操作时使用盆栽 UUID。旧 `plant-pal-v1` localStorage 演示数据不会自动导入账户。

养护需要 `observation`、`outcome` 和 `confirmed=true`。只有干土观察可提交已浇水；稍后检查延后 2 小时，其余结果延后 24 小时。时间由服务端记录，界面按浏览器时区显示。代管授权在每次 API 请求中检查，撤销后后续请求立即受限；页面通过轮询和重新聚焦刷新。

注册接口 `POST /api/auth/register/` 必须提交与 `password` 一致的 `password_confirm`。主人可通过 `PATCH /api/plants/{id}/` 修改 `next_check_at`（带时区的 ISO 8601 时间）；界面的时间输入按浏览器本地时区转换后提交。手动安排仅设置下一次检查，之后记录养护仍按上面的 2/24 小时规则生成新安排；没有后台通知。

创建或编辑盆栽时可通过 `multipart/form-data` 的 `cover` 字段上传图片，通过 JSON `cover: null` 恢复插画。封面重新编码为最长边 2000 像素以内的 JPEG，保存于 `backend/media/plant-covers/`，数据库仅保存文件路径。读取使用带 Session 的 `GET /api/plants/{id}/cover/`，每次检查植物权限；更换或删除封面、删除植物后清理旧文件。识别页面的本地预览与封面上传是独立功能。

若需人工验证两个账户，使用独立浏览器配置或普通窗口加隐私窗口，避免共享 Cookie。先建立好友关系，再由主人对某一盆明确授权；代管者应只能看到被授权的盆栽。

## 常见问题

| 问题                            | 处理                                                                       |
| ------------------------------- | -------------------------------------------------------------------------- |
| 根目录安装后前端缺依赖          | 还需执行 `pnpm --dir plant-nursery install --frozen-lockfile`            |
| 移动后 pip/虚拟环境仍引用旧位置 | 保留数据和 `.env`，根据 `requirements-lock.txt` 在新位置重建 `.venv` |
| 缺少 Django / DRF               | 确认使用 `backend/.venv` 的 Python，并安装锁定依赖                       |
| 缺少密钥                        | 按首次配置步骤填写 `.env`；不要公开真实配置                              |
| 403 CSRF                        | 统一使用 `127.0.0.1:5173` 并刷新；写请求需 CSRF Cookie 和请求头          |
| API 502 / 服务不可用            | 确认 Django 在 `127.0.0.1:8000` 运行                                     |
| 数据库缺表                      | 在 backend 执行 `python manage.py migrate`，不要删除数据库               |
| 品种列表为空                    | 在 backend 执行 `python manage.py seed_plants`                           |
| 端口被占用                      | 先停止已有开发服务；Vite 启用 strictPort，不会自动换端口                   |

源码、配置、依赖清单、锁文件、迁移和 `.env.example` 应提交。依赖目录、dist、虚拟环境、缓存、日志、真实环境文件、密钥、SQLite 和用户上传目录均忽略。迁移时保留的本地旧环境 `.venv.migrated-backup/`、旧 npm 锁和历史验收材料 `.qa/` 不上传。
