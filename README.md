# 无题 / Untitled — Portfolio，第二阶段

保留第一阶段的单张摄影雾气 Hero，向下滚动进入白色 Works。原生 HTML / CSS / JavaScript，无依赖、无 Three.js / WebGL / CMS。

## 日常使用

**从 [作品集使用说明.md](./作品集使用说明.md) 开始。**其中逐项说明换 Hero、新增 / 删除项目、图片、视频、封面、九种布局、分类和 About。

- 双击 `start-preview.cmd`，再打开 http://127.0.0.1:4173/ 。
- 或在项目目录运行 `node server.cjs`。
- 双击 `check-project.cmd` 检查数据与资源，或执行 `node tools/check.cjs`。
- 不需要 `npm install`。有 npm 的环境也可运行 `npm run dev`。

文件也能通过双击 `index.html` 查看；视频测试建议使用本地服务器。修改数据和样式后刷新网页，修改服务器后重启。

## 文件职责

| 文件 | 用途 |
|---|---|
| `data/site.js` | Hero、姓名、分类、About 配置 |
| `data/projects.js` | 项目与媒体数据 |
| `data/project-template.txt` | 新项目复制模板 |
| `index.html` | 原有 Hero + Works |
| `project.html?id=project-01` | 独立项目地址，所有项目共用一个页面模板 |
| `about.html` | About 独立页 |
| `styles.css` | 第一阶段原始视觉样式，未修改 |
| `script.js` | 第一阶段雾气鼠标交互，增加滚动与离屏暂停适配 |
| `portfolio.css` | 第二阶段编辑式排版与响应式布局 |
| `portfolio.js` | 数据渲染、分类、媒体调度、Lightbox |
| `server.cjs` | 本地静态服务器，支持 MP4 / WebM 字节范围与流式读取 |
| `tools/check.cjs` | 无依赖语法、数据字段、分类和资源路径检查 |
| `tests/server.test.cjs` | 页面、视频 Range / HEAD / MIME、边界路径检查 |
| `ASSET-CREDITS.md` | 示例素材来源与授权 |

## 媒体结构

```text
assets/
  images/
    hero/hero.jpg
    projects/project-01/...
    projects/project-02/...
    projects/project-03/...
    projects/project-04/...
  videos/project-02/preview.mp4
  videos/project-02/main.webm
data/
  site.js
  projects.js
```

分类与媒体类型独立。每个媒体块可使用 full / landscape / portrait / pair / triple / small / asymmetric / text-media / video。项目数量与媒体组数量没有固定上限。

## 性能与交互

Hero 继续共用单张照片的三层呈现。蒙版使用 CSS mask；鼠标通过 requestAnimationFrame 按时间缓动，离屏停止。首页无轮播。

内容图片 lazy loading，可提供单独 fullSrc 高清图。视频进入视口附近才赋予 src 并读取 metadata，只有可见的自动循环视频播放；离屏或隐藏页面暂停。详情保留原生控件，自动播放被阻止时回退为手动播放。系统减少动态效果或节省流量时不自动播放。

Lightbox 使用原生 dialog，支持前后图、左右键、Esc、关闭按钮、点击空白关闭及触摸滑动；关闭后恢复焦点。Works 分类按钮支持键盘，当前分类保存在 URL，详情返回 Works 可恢复分类。

## 验证

```text
node tools/check.cjs
node --test tests/server.test.cjs
```

本地历史备份与预览文件不上传 GitHub。


## GitHub Pages 发布

仓库：https://github.com/zigzaaaag/zigzaaag-portfolio

网站：https://zigzaaaag.github.io/zigzaaag-portfolio/

在仓库 Settings → Pages 中，Source 选择 Deploy from a branch，分支选择 main，目录选择 /(root)，然后 Save。根目录的 .nojekyll 用于直接发布静态文件，无需构建。

### 修改后更新

在本地作品集目录打开终端：

```powershell
node tools/check.cjs
node --test tests/server.test.cjs
git status --short
git add .
git diff --cached --stat
git commit -m "Update portfolio"
git push origin main
```

首次推送若提示登录，请使用自己的 GitHub 账号完成认证。推送后 GitHub Pages 自动重新发布，可在仓库 Actions 查看结果。

.gitignore 默认只收录网站源码、素材和维护所需文件；本地备份、预览截图、无关项目、缓存、环境变量和常见密钥文件不上传。新增根目录文件时需检查 .gitignore 是否应允许。修改图片或视频请放在 assets 中，并更新 data 内的路径。页面和素材使用相对路径，适配 /zigzaaag-portfolio/ 子目录。
