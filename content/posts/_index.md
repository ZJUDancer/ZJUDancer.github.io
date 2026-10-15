---
# 这个文件只是为了「占位屏蔽」：Toha 主题模块自带 content/posts/_index.md，
# 项目里删掉 content/posts 之后，主题自带的这个栏目会被继承下来并生成 /posts/ 页面。
# 用同路径文件把它盖掉并关闭渲染，/posts/ 就不再生成。
title: Posts
build:
  render: never
  list: never
  publishResources: false
---
