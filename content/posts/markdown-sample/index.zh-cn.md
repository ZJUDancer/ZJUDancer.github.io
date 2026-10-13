---
title: "Markdown 示例"
date: 2020-06-08T08:06:25+06:00
description: Markdown 渲染示例
menu:
  sidebar:
    name: Markdown 示例
    identifier: markdown
    weight: 30
author:
  name: Jessica Jonas
  image: /images/author/zjudancer.png
math: true
---

这是一篇示例文章，用于测试以下内容：

- 一个不同的文章作者。
- 目录。
- Markdown 内容渲染。
- 数学公式渲染。
- 表情符号渲染。

---
# Markdown 语法渲染

## 标题

以下 HTML 中的 `<h1>`—`<h6>` 元素代表六个级别的章节标题。`<h1>` 是最高级别，`<h6>` 是最低级别。

# H1
## H2
### H3
#### H4
##### H5
###### H6

## 段落

Xerum, quo qui aut unt expliquam qui dolut labo. Aque venitatiusda cum, voluptionse latur sitiae dolessi aut parist aut dollo enim qui voluptate ma dolestendit peritin re plis aut quas inctum laceat est volestemque commosa as cus endigna tectur, offic to cor sequas etum rerum idem sintibus eiur? Quianimin porecus evelectur, cum que nis nust voloribus ratem aut omnimi, sitatur? Quiatem. Nam, omnis sum am facea corem alique molestrunt et eos evelece arcillit ut aut eos eos nus, sin conecerem erum fuga. Ri oditatquam, ad quibus unda veliamenimin cusam et facea ipsamus es exerum sitate dolores editium rerore eost, temped molorro ratiae volorro te reribus dolorer sperchicium faceata tiustia prat.

Itatur? Quiatae cullecum rem ent aut odis in re eossequodi nonsequ idebis ne sapicia is sinveli squiatum, core et que aut hariosam ex eat.

## 引用块

引用块元素表示从其他来源引用的内容，可以附带一个引用来源（必须位于 `footer` 或 `cite` 元素内），也可以带有诸如注释和缩写之类的行内改动。

#### 无署名的引用块

> Tiam, ad mint andaepu dandae nostion secatur sequo quae.
> **注意**，你可以在引用块中使用 *Markdown 语法*。

#### 带署名的引用块

> Don't communicate by sharing memory, share memory by communicating.</p>
> — <cite>Rob Pike[^1]</cite>


[^1]: 以上引文摘自 Rob Pike 在 2015 年 11 月 18 日 Gopherfest 上的[演讲](https://www.youtube.com/watch?v=PAAkCSZUG1c)。

## 表格

表格并非核心 Markdown 规范的一部分，但 Hugo 开箱即用地支持它们。

   | 姓名  | 年龄 |
   | ----- | --- |
   | Bob   | 27  |
   | Alice | 23  |

#### 表格内的内联 Markdown

| 内联&nbsp;&nbsp;&nbsp; | Markdown&nbsp;&nbsp;&nbsp; | 在&nbsp;&nbsp;&nbsp;                | 表格  |
| ------------------------ | -------------------------- | ----------------------------------- | ------ |
| *斜体*                | **加粗**                   | ~~删除线~~&nbsp;&nbsp;&nbsp; | `代码` |

## 代码块

#### 使用反引号的代码块

```
html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Example HTML5 Document</title>
</head>
<body>
  <p>Test</p>
</body>
</html>
```
#### 使用四个空格缩进的代码块

    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Example HTML5 Document</title>
    </head>
    <body>
      <p>Test</p>
    </body>
    </html>

#### 使用 Hugo 内置高亮短代码的代码块
{{< highlight html >}}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Example HTML5 Document</title>
</head>
<body>
  <p>Test</p>
</body>
</html>
{{< /highlight >}}

## 列表类型

#### 有序列表

1. 第一项
2. 第二项
3. 第三项

#### 无序列表

* 列表项
* 另一个项
* 还有一个项

#### 嵌套列表

* 水果
  * 苹果
  * 橙子
  * 香蕉
* 乳制品
  * 牛奶
  * 奶酪

## 其他元素 — abbr、sub、sup、kbd、mark

<abbr title="Graphics Interchange Format">GIF</abbr> 是一种位图图像格式。

H<sub>2</sub>O

X<sup>n</sup> + Y<sup>n</sup> = Z<sup>n</sup>

按 <kbd><kbd>CTRL</kbd>+<kbd>ALT</kbd>+<kbd>Delete</kbd></kbd> 来结束会话。

大多数 <mark>蝾螈</mark> 是夜行性的，捕食昆虫、蠕虫和其他小生物。

---

## 数学渲染

{{< math.inline >}}
<p>
行内数学：\(\varphi = \dfrac{1+\sqrt5}{2}= 1.6180339887…\)
</p>
{{</ math.inline >}}

块级数学：
$$
 \varphi = 1+\frac{1} {1+\frac{1} {1+\frac{1} {1+\cdots} } } 
$$

---

## 表情符号渲染

<p><span class="nowrap"><span class="emojify">🙈</span> <code>:see_no_evil:</code></span>  <span class="nowrap"><span class="emojify">🙉</span> <code>:hear_no_evil:</code></span>  <span class="nowrap"><span class="emojify">🙊</span> <code>:speak_no_evil:</code></span></p>
<br>
