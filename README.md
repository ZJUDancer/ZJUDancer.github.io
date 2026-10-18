# ZJUDancer 官网

ZJUDancer 战队官网，使用 Hugo 与 Toha 主题构建，提供中英文版本。

线上站点：<https://zjudancer.github.io/>

## 本地运行

项目使用 [mise](https://mise.jdx.dev/) 管理工具版本。

```bash
mise install
mise run server
```

本地预览：<http://localhost:1313/>

构建静态站点：

```bash
mise run build
```

## 内容维护

| 内容 | 位置 |
| --- | --- |
| 首页、队伍、赞助商等数据 | `data/zh-cn/`、`data/en/` |
| 文档 | `content/docs/` |
| 队伍与赞助商页面 | `content/team/`、`content/sponsors/` |
| 图片等素材 | `assets/images/` |
| 模板与样式 | `layouts/`、`assets/styles/` |

中文和英文内容分别在 `data/zh-cn/` 与 `data/en/`，修改时请保持同步。文档使用 page bundle，正文写在对应目录的 `index.md`，图片和 PDF 放在同一目录。

`public/` 是构建产物，请勿手动修改。

## 部署

部署由 GitHub Actions 完成。当前组织站点由 `faster_website` 分支发布到 <https://zjudancer.github.io/>，具体配置见 `.github/workflows/`。
