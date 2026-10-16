# ZJUDancerHomePage


ZJUDancer 战队官网，基于 Hugo 静态站点生成器与 Toha 主题构建。

## 升级说明

本仓库是 ZJUDancer 战队官网的重构版本，在原站点基础上改用 **Hugo + Toha 主题** 的方式重新搭建。

原站点（`new_website` 分支）是手写的纯静态站点：HTML 页面配合 Sass/CSS 与 jQuery 脚本，文档和教程内容由 `doc-config.js`、`markdown-docs.js` 在浏览器端渲染 Markdown。升级后保留原有内容与视觉风格，把构建方式换成静态站点生成器：

- **主题以 Hugo Module 引入**：`go.mod` 中声明 `github.com/hugo-toha/toha/v4`，主题源码不进入本仓库，升级只需执行 `mise run update` 即可跟随主题新版本。
- **内容数据化、天然多语言**：首页各版块（关于我们、组别、论文、项目、经历、奖项等）由 `data/<语言>/sections/*.yaml` 配置驱动，中英文分别放在 `data/zh-cn` 与 `data/en` 下。
- **沿用原站素材与品牌**：logo、队徽、首页背景图、赞助商 logo 等继续使用原站点图片，交由 Hugo Pipes 自动完成 webp 转换与响应式裁剪。
- **改动以覆盖方式实现**：通过 `layouts/partials/` 覆盖主题模板、`assets/styles/override.scss` 覆盖样式，尽量不改主题源码，方便后续跟随主题更新。
- **统一的工具链与部署**：用 mise 管理 hugo-extended / go / node 版本，本地 `mise run server` 预览、`mise run build` 构建；GitHub Pages 负责正式发布（见下文「发布」），Netlify 保留用于预览。

Attributions:

- <a href='https://www.freepik.com/vectors/business'>Business vector created by studiogstock - www.freepik.com</a>

## Requirements

We use [jdx/mise](https://github.com/jdx/mise) to manage dependencies. Mise takes care of installing `hugo`, `go`, `nodes` and other tools to appropriate versions. Please, install it following the instruction from [here](https://mise.jdx.dev/getting-started.html).

## Running Locally

- Install dependencies

```
mise install
```

- Run hugo server

```
mise run server
```

预览地址是 **http://localhost:1313/website/** —— 因为 `hugo.yaml` 的 `baseURL` 带着 GitHub
Pages 项目站点的子路径，本地也会按同样的路径提供服务（这样能在本地就发现子路径相关的问题，
根路径 `http://localhost:1313/` 会 404）。只想按根路径看的话，用：

```
mise run server-root
```

## 发布（GitHub Pages）

发布走 **GitHub Pages 的项目站点**，也就是把本仓库单独发布到
`https://<owner>.github.io/<repo>/`。

之所以不直接用 `ZJUDancer.github.io` 那个仓库：一个仓库只能有一套 Pages 配置，而它的
Pages 已经被现有官网占用，动它就会影响现有站点。**另开一个仓库**做项目站点，两边互不相干——
本仓库的 Pages 设置、分支、部署产物都只属于本仓库自己。

### 一次性配置

1. 新建一个仓库（例如 `website`），把这份代码推上去，主分支设为 `main`；
2. 仓库 Settings → Pages → Build and deployment → Source 选 **GitHub Actions**；
3. 之后推送到 `main`，`.github/workflows/deploy-pages.yml` 会自动构建并发布。

站点地址由工作流里的 `actions/configure-pages` 依据仓库本身推算，所以**仓库改名或以后绑定
自定义域名都不用改配置**。工作流里还有一道保险：万一这份代码被推回 `ZJUDancer.github.io`
仓库，部署任务会直接跳过，绝不会去动组织站点。

### baseURL 与部署地址的关系

`hugo.yaml` 里的 `baseURL` 只是**兜底值**，实际发布时都会被覆盖：

| 场景 | baseURL 来源 |
| --- | --- |
| GitHub Pages | 工作流用 `-b` 传入仓库自己的 Pages 地址 |
| Netlify | `netlify.toml` 用 `-b $URL` / `$DEPLOY_PRIME_URL` 传入 |
| 本地 `hugo server` | Hugo 自动用 localhost，无需关心 |
| 本地 `mise run build` | 用 `hugo.yaml` 里的值 |

所以换了仓库名之后，把 `hugo.yaml` 的 `baseURL` 顺手改成真实地址即可，
它只影响本地直接构建出来的产物。

## Updating theme

- To update theme to latest release, run:

```
mise run update
```

- To update theme to latest commit from `main` brnach, run:

```
mise run update-to-main
```

主题更新也可以交给 `.github/workflows/theme-update.yml`：每周一自动检查一次新版本，
构建通过后开一个 PR，由人决定是否合并。

## 需要人工确认的地方

- `data/{zh-cn,en}/sections/about.yaml` 里四个社交平台（Bilibili / 小红书 / YouTube / X）
  的 `url` 目前是 `#` 占位，等主页地址定下来后替换即可。
- `hugo.yaml` 里的 Google Analytics 站点 ID（`G-H4LBG7NDFZ`）需要确认是不是我们自己的属性。
- `data/en/site.yaml` 的 `description` 目前仍是主题示例文案。
- 页面上的项目、论文、队伍历史目前仍是示例内容，作为后续改写的参照，暂不删除。

## 关于生成的文件

下面这些文件由工具生成，不要手改：

| 文件 | 生成方式 |
| --- | --- |
| `package.json`、`package-lock.json` | `hugo mod npm pack` + `npm install`（依赖声明来自主题，项目名来自 `package.hugo.json`） |
| `packages/hugoautogen/` | `hugo mod npm pack`（已加入 `.gitignore`） |
| `.hugo_build.lock` | Hugo 构建时的锁文件（已加入 `.gitignore`） |
| `assets/jsconfig.json` | 本地跑 `hugo server` 时生成，内容是本机缓存路径（已加入 `.gitignore`） |

改了主题版本后，`mise run install` 会一并重新生成它们。

## 覆盖的主题模板

改动尽量走「覆盖」而不是改主题源码，方便跟随主题更新。目前覆盖或自定义了这些：

- `layouts/partials/navigators/lang-selector.html`：**语言切换**。主题自带的实现把语言前缀
  直接拼在当前页面的 `RelPermalink` 前面，baseURL 带子路径时（GitHub Pages 项目站点就是
  这种情况）会算错，例如中文首页会被算成 `/zh-cn/website`，点过去 404。这里改成按 baseURL
  里的子路径重新拼接，根部署与子路径部署都正确。**主题升级后请顺手确认上游是否已修好，
  修好之后这个覆盖就可以删掉。**
- `layouts/partials/sections/home.html`：首页，含按 `params.backgrounds` 自动轮播的
  背景（图片数量不敏感、纯 CSS、无额外 JS；相邻两张交叉淡化，透明度之和恒为 1，
  切换过程中不会闪白。节奏由模板里的 `$slideSeconds` / `$fadeSeconds` 控制）。
- `layouts/partials/sections/accomplishments.html`、`layouts/partials/misc/{badge,medal}.html`：
  获奖记录表格与奖牌图标、赞助商卡片。
- `assets/styles/override.scss`：上述部分的样式，外加小红书图标的矢量定义。

## 关掉的内容类功能

`hugo.yaml` 的 `params.features` 里，`math`（KaTeX 公式）、`flowchart`（mermaid）、
`syntaxHighlight`（highlight.js）、`videoPlayer`（plyr）、`embedpdf`、`copyCodeButton`
都是关闭的。原因是：本站目前没有博文/笔记内容，这些库只会白白增加访客的下载量——
六项全开时 JS 是 6.1 MB（gzip 1.8 MB），全关后 1.8 MB（gzip 0.6 MB），而页面表现完全一致。

将来要写带公式、代码块、流程图、PDF 或视频的页面时，把对应开关改回 `true` 即可
（KaTeX 字体由主题自己挂载到 `/fonts`，不需要额外配置）。
