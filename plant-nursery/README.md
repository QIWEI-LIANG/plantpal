# Plant Pal 🌿

CSI405 Interactive Systems · CW2。React + Vite 的第一版网页交互原型，使用 JavaScript + JSX，没有后端或外部 API。

## 中文说明

### 正确的项目目录与启动

项目位于工作区的 **内层 `plant-nursery`**，外层 `plantpal` 提供转发到内层项目的启动、检查与构建命令。以下命令在仓库根目录执行。

在 VS Code PowerShell 终端运行：

```powershell
cd plant-nursery
pnpm install --frozen-lockfile
pnpm dev --host 127.0.0.1 --port 5173 --strictPort
```

打开 **http://127.0.0.1:5173/**。已有依赖时可以跳过 `pnpm install --frozen-lockfile`。按 Ctrl+C 停止。使用 `--strictPort` 可以避免端口被占用时自动换到未知端口；如果 5173 已占用，停止原来的 Vite 服务后重试。

检查与生产构建：

```powershell
pnpm lint
pnpm build
pnpm preview --host 127.0.0.1 --port 4173 --strictPort
```

最后一个命令用于预览构建产物，地址为 http://127.0.0.1:4173/ 。沿用 pnpm 和现有依赖，不增加运行时依赖。统一使用 pnpm 12.9.1，并提交 `pnpm-lock.yaml`；已移除重复的 npm 锁文件，避免混用包管理器。需要 Node.js 20.19+、22.13+ 或 24+，建议使用 Node.js 24。

### 目录结构

以下省略自动生成的 `node_modules/` 和 `dist/`：

```text
plant-nursery/
├── docs/
│   ├── preview-desktop.png
│   └── preview-mobile.png
├── public/
│   └── favicon.svg
├── src/
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── MyPlantsPage.jsx
│   │   ├── RemindersPage.jsx
│   │   ├── GuidesPage.jsx
│   │   ├── IdentifyPage.jsx
│   │   ├── FriendsPage.jsx
│   │   ├── ForumPage.jsx
│   │   └── SettingsPage.jsx
│   ├── components/
│   │   ├── AppLayout.jsx
│   │   ├── PageHeading.jsx
│   │   ├── PlantCard.jsx
│   │   ├── PlantArt.jsx
│   │   ├── PlantDetails.jsx
│   │   ├── CareReminder.jsx
│   │   ├── CareHistory.jsx
│   │   ├── SearchField.jsx
│   │   ├── Modal.jsx
│   │   └── Icon.jsx
│   ├── data/
│   │   ├── plantData.js
│   │   ├── communityData.js
│   │   ├── formatters.js
│   │   └── stateStorage.js
│   ├── styles/
│   │   ├── global.css
│   │   └── app.css
│   ├── App.jsx
│   └── main.jsx
├── .prettierrc.json
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── pnpm-lock.yaml
├── vite.config.js
└── README.md
```

### 1. 页面：先看这里

- **HomePage.jsx**：首页问候、植物插画、统计、植物卡片、当天检查及近期历史。**只改首页，从这个文件开始。**
- **MyPlantsPage.jsx**：我的植物搜索和列表；代管模式还显示交接速览。
- **RemindersPage.jsx**：待检查、未来检查时间、集中养护历史。
- **GuidesPage.jsx**：植物指南搜索和分类；点击卡片打开详情。
- **IdentifyPage.jsx**：上传图片的本地预览、选择示例、预设识别结果、确认添加。
- **FriendsPage.jsx**：搜索示例好友、在本机添加好友、查看植物状态与模拟发送提醒。
- **ForumPage.jsx**：示例帖子搜索、发布时间／点赞排序、可取消的本机点赞。
- **SettingsPage.jsx**：本机展示账户资料、模拟联系反馈。
- 页面文字直接写在相应页面中的 `t('中文', 'English')`，两种语言一起修改即可。植物名和养护文字在 `src/data/plantData.js`。

### 2. 组件：页面复用的积木

- **AppLayout.jsx**：侧栏、顶部头像与昵称、导航、语言切换、主人／代管者切换；导航名称也在这里修改。
- **PlantCard.jsx / PlantArt.jsx**：可点击植物卡片和本地 SVG 插画。插画不调用图片服务，不用来真实识别。
- **PlantDetails.jsx**：单株资料、主人说明编辑／代管者阅读、单株历史。
- **CareReminder.jsx**：先检查的弹窗、观察选择、检查确认、三种养护决定及必要校验。
- **CareHistory.jsx**：统一的时间线，显示结果、观察、时间和操作者。
- **Modal.jsx**：原生 HTML dialog，支持 Escape、点击背景关闭、键盘焦点限制和关闭后焦点恢复。
- **PageHeading.jsx / SearchField.jsx / Icon.jsx**：统一标题、搜索框、SVG 图标。
- **global.css**：颜色变量、字体、表单、按钮等基础样式。
- **app.css**：各页面布局、卡片、弹窗，以及 1180 / 960 / 760 / 480px 响应式断点。改颜色先看 global.css；改首页布局看 app.css 中 home、hero、stats 相关规则。

### 3. 数据：修改示例内容

- **plantData.js**：6 种室内植物，包含 `id`、中英文名称、学名、插画类型、位置、光照、检查提示、浇水说明及默认交接说明。新增植物请使用唯一 id。
- **communityData.js**：示例好友、好友植物状态、帖子及中英文内容。好友植物通过 plantId 引用 plantData 中的 id。
- **formatters.js**：植物文字选择、时间格式、养护结果和观察结果的双语标签。
- 养护文字仅用于演示，不能自动诊断植物是否健康。示例位置只是展示位置。
- 要改变第一次打开时的植物数量或示例历史，修改 **stateStorage.js** 的 `initialState()`。

### 4. 状态保存：App 是连接这些积木的地方

**App.jsx** 使用 useState 管理共享数据、当前页面、弹窗、语言和角色；把数据与回调通过 props 传给页面。它负责“添加植物”“记录养护”“保存说明”等共同操作，不放完整页面内容。

**stateStorage.js** 从 `localStorage['plant-pal-v1']` 读取共享状态，没有记录时生成示例；损坏的记录会回退到示例。App 中的 useEffect 在共享状态变动后写入 localStorage。

保存：语言、昵称／展示邮箱、我的植物、主人说明、带时间的养护历史、下次检查时间、添加的示例好友、点赞。不保存：当前页面、代管视图、未提交输入、上传图片。

时间按浏览器本地时间显示，数据以 ISO 时间保存。提醒每分钟刷新，在重新打开页面时也重新判断。选择“稍后检查”安排 2 小时后再检查；其他结果安排 24 小时后再检查。**检查时间不代表必须浇水**。检查观察为“仍湿”或“不确定”时，界面会阻止直接记录浇水，建议先暂缓或继续观察。

清除示例操作后重新演示，可在浏览器开发者工具的 Console 中运行：

```js
localStorage.removeItem('plant-pal-v1')
location.reload()
```

更改默认数据后，如果旧本地状态仍然存在，已保存的说明等会优先显示；想看全新默认内容，按上面方法重置即可。如果浏览器禁用站点存储，应用仍能在本次打开时交互，刷新后不保留修改。

### 真实前端交互与模拟边界

真实：导航、搜索、筛选、打开详情、去重添加植物、记录三种养护决定、时间线、说明编辑、角色展示切换、中英切换、好友目录添加、点赞及排序、账户展示资料编辑、本地图片预览、localStorage 保存。

模拟：植物养护数据和初始记录、好友身份和植物状态、好友消息发送、论坛内容、账户身份、联系提交、图片识别。识别结果由用户选择预设植物，**没有 AI 分析、没有置信度、没有真实消息、没有上传或后台通知**。

没有登录授权系统。代管者是本机展示模式，能查看说明和近期记录，也能以 Alex 的名字生成代管养护记录；不能编辑主人说明或添加主人的植物。主人输入的自由文本保留原文，不自动翻译。

### 三项用户测试任务

开发验证：build 和 lint 通过；在 Edge 中验证了指南添加、刷新持久化、三种提醒结果及检查校验、代管交接、好友模拟提醒、论坛排序点赞、图片本地预览、语言与账户编辑、窄屏页面及损坏存储恢复。浏览器自动验证不能替代真人用户测试。

界面截图：[桌面首页](docs/preview-desktop.png) · [窄屏首页](docs/preview-mobile.png)。

1. 请植物新手搜索“白掌”，阅读浇水说明并加入我的植物，刷新后找到它；观察是否知道从哪里查看指南及添加是否成功。
2. 给养多种植物的用户／花店人员一株“土壤仍湿”的植物，请处理提醒并找到记录；再让用户将另一株“不确定”的植物设为稍后检查。观察是否误把提醒理解为必须浇水、能否理解两个不同结果及下一次检查时间。
3. 请主人给龟背竹保存一句代管说明，然后请临时代管者切换视图，找出植物位置、主人说明、上一次养护的时间与操作者。观察交接信息是否足够集中。

## English guide

### Run

The actual React + Vite project is the **inner plant-nursery directory**, with forwarding scripts available in the outer repository directory. Run the commands below from the repository root. Requires Node.js 20.19+, 22.13+ or 24+ and pnpm 12.9.1.

```powershell
cd plant-nursery
pnpm install --frozen-lockfile
pnpm dev --host 127.0.0.1 --port 5173 --strictPort
```

Visit http://127.0.0.1:5173/ . Skip install if dependencies are present. Use Ctrl+C to stop. Check with `pnpm lint` and `pnpm build`. Preview a build using `pnpm preview --host 127.0.0.1 --port 4173 --strictPort`.

### Pages → components → data → saved state

See the directory tree above for every source file.

- **pages/**: HomePage is the overview and the place to start for homepage-only changes. MyPlantsPage shows the collection and handover overview. RemindersPage shows due checks, scheduled checks and shared history. GuidesPage searches care guides. IdentifyPage handles local image preview and preset results. FriendsPage demonstrates friend discovery and reminders. ForumPage searches, sorts and likes sample posts. SettingsPage edits the local display profile and demonstrates a contact form.
- **components/**: AppLayout handles navigation, profile, language and role switching. PlantCard and PlantArt render plants using local SVG artwork. PlantDetails contains care information, owner instructions and history. CareReminder validates observations and records the three decisions. CareHistory displays timestamps, observations and people. Modal wraps native dialog with keyboard support. PageHeading, SearchField and Icon are shared UI building blocks.
- **data/**: Edit plants, names and bilingual care information in plantData.js. Edit friends and posts in communityData.js. formatters.js contains localized outcome labels and date formatting. stateStorage.js contains initial data and persistence.
- **App.jsx** connects pages with useState, useEffect and props. It owns shared state, navigation and actions. stateStorage.js loads and saves the `plant-pal-v1` localStorage key. Language, display profile, plants, notes, history, check times, friends and likes persist. Images, unsaved input, page selection and caretaker mode do not.
- **styles/**: global.css contains tokens, typography, forms and buttons. app.css contains page layouts and responsive rules. Existing formatting uses single quotes, no semicolons and trailing commas, captured by .prettierrc.json.
- **Page wording** lives in each page or component as `t('中文', 'English')`. Data wording uses `{ zh, en }`. Update both versions together. Free-text owner instructions stay in the original language.

### Demonstration boundaries

Search, adding plants, care decisions, owner notes, caretaker reading, likes, sorting, language switching and local persistence are real frontend interactions. Identification, friend identities/statuses/messages, accounts, initial care history, posts and contact submission are simulated. Images stay in browser memory; no server, upload, external API, authentication, real messages or background notifications are used.

Checks repeat after 24 hours, or after 2 hours when postponed. These are demonstration check intervals, not watering schedules. Due checks update each minute. A damp or uncertain observation cannot be directly recorded as watered. All decisions record time, observation and actor. Alex’s caretaker view shares the owner’s data, can record care, and cannot edit owner notes or add plants. Clearing the localStorage key and reloading restores examples; saved overrides otherwise take precedence over changed defaults.

### User-test tasks

1. A beginner finds the peace lily guide, understands its care note, adds it and finds it after refreshing.
2. An enthusiast or florist handles a damp-soil reminder with “Not needed”, then postpones an uncertain check; find both timestamped entries and the next check times.
3. An owner writes a handover note; a temporary sitter switches views and finds location, instructions, the latest care action, its timestamp and actor.
