# PlantPal 前端

React 19 + Vite 8，使用 JavaScript / JSX，保留中英文和响应式界面。实际位置为 `D:\GitHub\plantpal\plant-nursery`。完整 Windows 安装和后端配置见[根目录 README](../README.md)。

## 安装与启动（PowerShell）

先按根目录说明配置并启动 Django，再启动前端：

```powershell
# 仓库根目录
Set-Location 'D:\GitHub\plantpal'
pnpm install --frozen-lockfile
pnpm --dir plant-nursery install --frozen-lockfile
pnpm dev
```

也可以在前端目录直接运行：

```powershell
Set-Location 'D:\GitHub\plantpal'
Set-Location .\plant-nursery
pnpm install --frozen-lockfile
pnpm dev
```

打开 http://127.0.0.1:5173/。Vite 将 `/api` 代理到 http://127.0.0.1:8000，前后端必须同时运行。无需前端 `.env`，不要混用 npm 锁文件。Node.js 与 pnpm 要求见 `package.json`。

关闭时按 `Ctrl+C`。下次在仓库根目录执行 `pnpm dev:backend` 和 `pnpm dev`，分别占用两个终端，无需重新安装。

## 检查和构建（仓库根目录或前端目录）

```powershell
pnpm lint
pnpm build
pnpm preview
```

预览访问 http://127.0.0.1:4173/，也需要 Django。lint/build 通过；2026-10-23 使用 Chrome 验证了注册确认密码、首页入口跳转、上传封面、修改时间、删除确认、提醒历史，以及桌面和手机尺寸下弹窗滚动时关闭按钮仍可见。临时浏览器验证工具及截图保存在忽略的 `.qa/` 中；项目尚未配置独立的前端测试脚本或完整页面回归。

## 源码入口

| 位置                               | 职责                                                       |
| ---------------------------------- | ---------------------------------------------------------- |
| `src/pages/HomePage.jsx`         | 首页；修改首页从这里开始                                   |
| `src/pages/`                     | 我的植物、指南、提醒、好友、论坛、设置、认证与站内提醒     |
| `src/components/`                | 布局、植物卡片、表单、详情、养护确认、逐盆授权、历史和分页 |
| `src/services/api.js`            | fetch、Session Cookie、CSRF、超时与错误                    |
| `src/hooks/`                     | 会话、异步请求、提交及植物数据                             |
| `src/data/`                      | 格式化与语言偏好；不再使用旧演示业务数据                   |
| `src/styles/`                    | global.css、app.css 和 fullstack.css                       |
| `src/App.jsx` / `src/main.jsx` | 页面、视图、弹窗状态及入口                                 |
| `vite.config.js`                 | 开发/预览端口与同源 `/api` 代理                          |

文案使用 `t('中文', 'English')`；格式沿用 `.prettierrc.json` 的无分号、单引号和尾随逗号。业务数据以 Django/SQLite 为准；localStorage 只保存 `plantpal-language`，旧 `plant-pal-v1` 数据不会自动导入账户。

根据 `improve.md`，首页识别入口整张卡片可点击；所有弹窗的标题和关闭按钮固定在顶部，内容独立滚动。植物详情右侧提供红色删除按钮与二次确认，下方可编辑下次检查时间（点击“保存植物资料”生效）；移除了个人盆栽详情中的光照和浇水提示框，指南页仍保留品种知识。

新增/编辑盆栽时可上传或更换 JPG/PNG/WebP 封面（最大 5 MB），也可恢复默认插画。`api.js` 自动区分 JSON 和 FormData；封面通过同源 `/api` 请求取得，并同步显示在首页、植物列表、详情和提醒中。注册增加确认密码，前后端都校验一致性。未来检查安排按时间排序，安排时间与养护结果用不同颜色、较醒目的文字显示。

品种数据位于 `../backend/plants/seed_data.json`。`PlantSpecies` 是品种，`UserPlant` 是具体盆栽；同品种的不同盆栽使用各自 UUID、历史与授权。已有指南应在 Django Admin 编辑，种子命令不会覆盖。

**植物识别尚未接入**：`IdentifyPage.jsx` 仅在本地预览 JPG/PNG/WebP，提供手动选品种入口，不上传或分析图片。站内提醒不是邮件、短信或后台推送。`docs/preview-*.png` 为原型时期截图，不代表当前全栈功能验证。
