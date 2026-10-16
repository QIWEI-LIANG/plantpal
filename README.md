# PlantPal 植物养护应用

React + Vite 前端、Django REST Framework 后端的本地全栈项目。业务数据保存在 SQLite；认证使用 Django Session + CSRF，localStorage 只保存界面语言。

仓库根目录：`D:\GitHub\plantpal`。前端：`plant-nursery/`。后端：`backend/`。根目录 pnpm 脚本负责转发启动和检查命令，现有 Git 历史保留。

## 当前功能与限制

- 注册、登录、退出、当前账户及昵称/邮箱编辑。
- 中英文品种搜索和养护指南；每盆植物独立新增、编辑、删除，拥有自己的 UUID、位置、主人说明和历史。
- 首页统计、待检查/逾期/未来安排；观察土壤并确认后记录养护，服务端原子更新历史和下次检查时间。
- 好友申请与处理、逐盆代管授权和撤销；好友关系本身不共享植物。代管者可查看和记录养护，不能编辑、删除或再次授权。
- 站内提醒与已读状态、纯文本论坛帖子、点赞和反馈；中英文界面。
- **植物识别尚未接入**：目前只有本地图片预览和手动选择品种，不上传图片、不调用识别服务，也不生成模拟识别结果。
- 未实现邮件/短信、后台推送、实时聊天或生产部署；SQLite 用于本地开发，尚未进行生产并发压力验证。页面关闭后不会继续发送提醒。

## 技术栈与目录

本次验证环境：Windows PowerShell、Python 3.11.6、Node.js 24.10.0、pnpm 12.9.1。现有锁文件解析为 React/React DOM 19.3.0、Vite 8.3.2；后端直接依赖固定为 Django 5.2.18、Django REST Framework 3.18.3、python-dotenv 1.2.4。数据库使用 Python 内置 SQLite 驱动，无需另外安装数据库服务。

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

| 变量 | 用途 |
| --- | --- |
| `DJANGO_SECRET_KEY` | 必填，首次生成后保持稳定，不提交 Git |
| `DJANGO_DEBUG` | 本地 HTTP 开发使用 `True`；也影响 Cookie Secure 设置 |
| `DJANGO_ALLOWED_HOSTS` | 默认 `127.0.0.1,localhost` |
| `DJANGO_CSRF_TRUSTED_ORIGINS` | 开发端口 5173、预览端口 4173 的 Origin，逗号分隔 |
| `DJANGO_DB_NAME` | 默认 `db.sqlite3`，相对路径从 `backend/` 解析；也支持绝对路径 |

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

本次迁移实际验证：两份 pnpm 锁文件的冻结安装、后端锁定依赖安装、前端 lint/build、Django check、模型与 migration 一致性、本地已应用迁移检查、pip check、23 项后端测试均通过。另在独立临时数据库执行了全部迁移和品种初始化，并通过根目录脚本启动前后端，验证前端 HTML、Vite API 代理、品种列表、CSRF/Session、注册/登录/退出、盆栽创建、养护记录及重新登录后的读取，以及 Admin 登录页。原数据库和 `.env` 内容保持不变。

本次未执行浏览器图形界面的逐页点击、移动端视觉回归或生产部署验证；仓库中旧原型截图不作为这些检查的通过依据。

## 数据与权限说明

`PlantSpecies` 是共享品种，`UserPlant` 是具体盆栽；同品种可以拥有多盆，操作时使用盆栽 UUID。旧 `plant-pal-v1` localStorage 演示数据不会自动导入账户。

养护需要 `observation`、`outcome` 和 `confirmed=true`。只有干土观察可提交已浇水；稍后检查延后 2 小时，其余结果延后 24 小时。时间由服务端记录，界面按浏览器时区显示。代管授权在每次 API 请求中检查，撤销后后续请求立即受限；页面通过轮询和重新聚焦刷新。

若需人工验证两个账户，使用独立浏览器配置或普通窗口加隐私窗口，避免共享 Cookie。先建立好友关系，再由主人对某一盆明确授权；代管者应只能看到被授权的盆栽。

## 常见问题

| 问题 | 处理 |
| --- | --- |
| 根目录安装后前端缺依赖 | 还需执行 `pnpm --dir plant-nursery install --frozen-lockfile` |
| 移动后 pip/虚拟环境仍引用旧位置 | 保留数据和 `.env`，根据 `requirements-lock.txt` 在新位置重建 `.venv` |
| 缺少 Django / DRF | 确认使用 `backend/.venv` 的 Python，并安装锁定依赖 |
| 缺少密钥 | 按首次配置步骤填写 `.env`；不要公开真实配置 |
| 403 CSRF | 统一使用 `127.0.0.1:5173` 并刷新；写请求需 CSRF Cookie 和请求头 |
| API 502 / 服务不可用 | 确认 Django 在 `127.0.0.1:8000` 运行 |
| 数据库缺表 | 在 backend 执行 `python manage.py migrate`，不要删除数据库 |
| 品种列表为空 | 在 backend 执行 `python manage.py seed_plants` |
| 端口被占用 | 先停止已有开发服务；Vite 启用 strictPort，不会自动换端口 |

源码、配置、依赖清单、锁文件、迁移和 `.env.example` 应提交。依赖目录、dist、虚拟环境、缓存、日志、真实环境文件、密钥、SQLite 和用户上传目录均忽略。迁移时保留的本地旧环境 `.venv.migrated-backup/`、旧 npm 锁和历史验收材料 `.qa/` 不上传。
