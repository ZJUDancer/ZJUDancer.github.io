# ZJUDancerHomePage

[![Netlify Status](https://api.netlify.com/api/v1/badges/b1b93b02-f278-440b-ae1b-304e9f4c4ab5/deploy-status)](https://app.netlify.com/sites/toha/deploys) [![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fhugo-toha%2Fhugo-toha.github.io%2Fbadge%3Fref%3Dmain&style=flat)](https://actions-badge.atrox.dev/hugo-toha/hugo-toha.github.io/goto?ref=main) ![Repository Size](https://img.shields.io/github/repo-size/hugo-themes/toha-example-site) ![Contributor](https://img.shields.io/github/contributors/hugo-themes/toha-example-site) ![Last Commit](https://img.shields.io/github/last-commit/hugo-themes/toha-example-site) ![License](https://img.shields.io/github/license/hugo-themes/toha-example-site) ![Open Issues](https://img.shields.io/github/issues/hugo-themes/toha-example-site?color=important) ![Open Pull Requests](https://img.shields.io/github/issues-pr/hugo-themes/toha-example-site?color=yellowgreen) ![Security Headers](https://img.shields.io/security-headers?url=https%3A%2F%2Fhugo-themes.github.io/toha-example-site%2F) [![This project is using Percy.io for visual regression testing.](https://percy.io/static/images/percy-badge.svg)](https://percy.io/b7cb60ab/hugo-themes.github.io/toha-example-site)

ZJUDancer 战队官网，基于 Hugo 静态站点生成器与 Toha 主题构建。

## 升级说明

本仓库是 ZJUDancer 战队官网的重构版本，在原站点基础上改用 **Hugo + Toha 主题** 的方式重新搭建。

原站点（`new_website` 分支）是手写的纯静态站点：HTML 页面配合 Sass/CSS 与 jQuery 脚本，文档和教程内容由 `doc-config.js`、`markdown-docs.js` 在浏览器端渲染 Markdown。升级后保留原有内容与视觉风格，把构建方式换成静态站点生成器：

- **主题以 Hugo Module 引入**：`go.mod` 中声明 `github.com/hugo-toha/toha/v4`，主题源码不进入本仓库，升级只需执行 `mise run update` 即可跟随主题新版本。
- **内容数据化、天然多语言**：首页各版块（关于我们、组别、论文、项目、经历、奖项等）由 `data/<语言>/sections/*.yaml` 配置驱动，中英文分别放在 `data/zh-cn` 与 `data/en` 下。
- **沿用原站素材与品牌**：logo、队徽、首页背景图、赞助商 logo 等继续使用原站点图片，交由 Hugo Pipes 自动完成 webp 转换与响应式裁剪。
- **改动以覆盖方式实现**：通过 `layouts/partials/` 覆盖主题模板、`assets/styles/override.scss` 覆盖样式，尽量不改主题源码，方便后续跟随主题更新。
- **统一的工具链与部署**：用 mise 管理 hugo-extended / go / node 版本，本地 `mise run server` 预览、`mise run build` 构建；部署沿用 Netlify（`netlify.toml`）与 GitHub Actions 工作流。

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

## Updating theme

- To update theme to latest release, run:

```
mise run update
```

- To update theme to latest commit from `main` brnach, run:

```
mise run update-to-main
```
