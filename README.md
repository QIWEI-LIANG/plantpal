# Plant Pal 🌿

CSI405 Interactive Systems · CW2 植物养护交互原型，使用 React、Vite 和 JavaScript。支持中英文界面，数据保存在浏览器 localStorage 中；没有后端或外部 API。

## 本地运行

需要 Node.js 20.19+、22.13+ 或 24+，以及 pnpm 12.9.1。建议使用 Node.js 24。

在克隆后的仓库根目录运行：

```powershell
pnpm --dir plant-nursery install --frozen-lockfile
pnpm dev
```

按终端显示的地址打开应用。检查及构建：

```powershell
pnpm lint
pnpm build
pnpm preview
```

根目录的脚本会转发到 `plant-nursery`。构建产物位于 `plant-nursery/dist/`。

## 项目结构

- `plant-nursery/src/`：页面、组件、示例数据和样式。
- `plant-nursery/public/`：静态资源。
- `plant-nursery/docs/`：界面截图，保留在仓库中。
- [项目详细说明](plant-nursery/README.md)：交互逻辑、数据持久化和用户测试任务。

统一使用 pnpm，提交 `pnpm-lock.yaml`，安装时使用 `--frozen-lockfile`。`.gitignore` 排除依赖、构建产物、缓存、日志与本地环境变量；源码、配置、锁文件和文档需要提交。

## 首次上传 GitHub

在 GitHub 创建空仓库后，在当前目录执行以下命令，将占位地址替换为自己的仓库地址：

```powershell
git init -b main
git add .
git status --short
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

如果只将 `plant-nursery` 作为仓库根目录，请在该目录执行这些 Git 命令，并直接运行 `pnpm install --frozen-lockfile`、`pnpm dev` 等应用命令。
