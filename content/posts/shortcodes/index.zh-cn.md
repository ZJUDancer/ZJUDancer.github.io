---
title: "短代码示例"
date: 2020-06-08T08:06:25+06:00
description: 短代码示例
menu:
  sidebar:
    name: 短代码示例
    identifier: shortcodes
    weight: 40
hero: boat.jpg
mermaid: true
---

这是一篇示例文章，用于测试以下内容：

- 默认首图。
- 各种短代码。

## 提示框

本主题提供以下提示框。

{{< alert type="success" >}}
这是一个使用 `type="success"` 的示例提示框。
{{< /alert >}}

{{< alert type="danger" >}}
这是一个使用 `type="danger"` 的示例提示框。
{{< /alert >}}

{{< alert type="warning" >}}
这是一个使用 `type="warning"` 的示例提示框。
{{< /alert >}}

{{< alert type="info" >}}
这是一个使用 `type="info"` 的示例提示框。
{{< /alert >}}

{{< alert type="dark" >}}
这是一个使用 `type="dark"` 的示例提示框。
{{< /alert >}}

{{< alert type="primary" >}}
这是一个使用 `type="primary"` 的示例提示框。
{{< /alert >}}

{{< alert type="secondary" >}}
这是一个使用 `type="secondary"` 的示例提示框。
{{< /alert >}}

## 图片

#### 一张不带任何属性的示例图片。

{{< img src="/posts/shortcodes/boat.jpg" title="海上的一艘船" >}}

{{< vs 3 >}}

#### 一张带 `height` 和 `width` 属性的示例图片。

{{< img src="/posts/shortcodes/boat.jpg" height="400" width="600" title="海上的一艘船" >}}

{{< vs 3 >}}

#### 一张居中对齐并带 `height` 和 `width` 属性的图片。

{{< img src="/posts/shortcodes/boat.jpg" height="400" width="600" align="center" title="海上的一艘船" >}}

{{< vs 3 >}}

#### 一张带 `float` 属性的图片。

{{< img src="/posts/shortcodes/boat.jpg" height="200" width="500" float="right" title="海上的一艘船" >}}

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras egestas lectus sed leo ultricies ultricies. Praesent tellus risus, eleifend vel efficitur ac, venenatis sit amet sem. Ut ut egestas erat. Fusce ut leo turpis. Morbi consectetur sed lacus vitae vehicula. Cras gravida turpis id eleifend volutpat. Suspendisse nec ipsum eu erat finibus dictum. Morbi volutpat nulla purus, vel maximus ex molestie id. Nullam posuere est urna, at fringilla eros venenatis quis.

Fusce vulputate dolor augue, ut porta sapien fringilla nec. Vivamus commodo erat felis, a sodales lectus finibus nec. In a pulvinar orci. Maecenas suscipit eget lorem non pretium. Nulla aliquam a augue nec blandit. Curabitur ac urna iaculis, ornare ligula nec, placerat nulla. Maecenas aliquam nisi vitae tempus vulputate.

## 分栏

本主题支持将页面分割为任意数量的栏。

#### 两栏分栏

{{< split 6 6>}}

##### 左栏

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras egestas lectus sed leo ultricies ultricies.

---

##### 右栏

Fusce ut leo turpis. Morbi consectetur sed lacus vitae vehicula. Cras gravida turpis id eleifend volutpat.

{{< /split >}}

#### 三栏分栏

{{< split 4 4 4 >}}

##### 左栏

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras egestas lectus sed leo ultricies ultricies.

---

##### 中栏

Aenean dignissim dictum ex. Donec a nunc vel nibh placerat interdum. 

---

##### 右栏

Fusce ut leo turpis. Morbi consectetur sed lacus vitae vehicula. Cras gravida turpis id eleifend volutpat.

{{< /split >}}

## 垂直间距

在两行之间添加垂直间距。

这是第一行。
{{< vs 4>}}
这是第二行。它与上一行之间应有 `4rem` 的垂直间距。

## 视频

{{< video src="/videos/sample.mp4" >}}

<!-- markdown-link-check-disable-next-line -->
视频来自 [Pexels](https://www.pexels.com) 上的 [Rahul Sharma](https://www.pexels.com/@rahul-sharma-493988)。

## Mermaid

以下是 mermaid 短代码的几个示例。

**图表：**

{{< mermaid align="left" >}}
graph LR;
    A[Hard edge] -->|Link text| B(Round edge)
    B --> C{Decision}
    C -->|One| D[Result one]
    C -->|Two| E[Result two]
{{< /mermaid >}}

**时序图：**

{{< mermaid >}}
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop Healthcheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts <br/>prevail!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!
{{< /mermaid >}}

**甘特图：**

{{< mermaid >}}
gantt
  dateFormat  YYYY-MM-DD
  title Adding GANTT diagram to mermaid
  excludes weekdays 2014-01-10

section A section
  Completed task            :done,    des1, 2014-01-06,2014-01-08
  Active task               :active,  des2, 2014-01-09, 3d
  Future task               :         des3, after des2, 5d
  Future task2               :         des4, after des3, 5d
{{< /mermaid >}}

**类图：**

{{< mermaid >}}
classDiagram
  Class01 <|-- AveryLongClass : Cool
  Class03 *-- Class04
  Class05 o-- Class06
  Class07 .. Class08
  Class09 --> C2 : Where am i?
  Class09 --* C3
  Class09 --|> Class07
  Class07 : equals()
  Class07 : Object[] elementData
  Class01 : size()
  Class01 : int chimp
  Class01 : int gorilla
  Class08 <--> C2: Cool label
{{< /mermaid >}}

**Git 图：**

{{< mermaid >}}
gitGraph
    commit id: "ZERO"
    branch develop
    commit id:"A"
    checkout main
    commit id:"ONE"
    checkout develop
    commit id:"B"
    checkout main
    commit id:"TWO"
    cherry-pick id:"A"
    commit id:"THREE"
    checkout develop
    commit id:"C"
{{< /mermaid >}}

**ER 图：**

{{< mermaid >}}
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses
{{< /mermaid >}}

## Gist

{{< gist hossainemruz 4ad86c9b6378677e14eff12713e75e44 >}}

## 嵌入 PDF

{{< embed-pdf src="/files/resume.pdf" >}}
