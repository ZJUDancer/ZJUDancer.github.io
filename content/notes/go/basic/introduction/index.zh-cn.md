---
title: 简介
weight: 10
menu:
  notes:
    name: 简介
    identifier: notes-go-basics-intro
    parent: notes-go-basics
    weight: 10
---
<!-- A Sample Program -->
{{< note title="Hello World" >}}
下面展示一个示例 Go 程序。
  
```go
package main

import "fmt"

func main() {
  message := greetMe("world")
  fmt.Println(message)
}

func greetMe(name string) string {
  return "Hello, " + name + "!"
}
```

按如下方式运行程序：

```bash
$ go run hello.go
```
{{< /note >}}

<!-- Declaring Variables -->

{{< note title="变量" >}}
**普通声明：**
```go
var msg string
msg = "Hello"
```

---

**简写：**
```go
msg := "Hello"
```
{{< /note >}}


<!-- Declaring Constants -->

{{< note title="常量" >}}
```go
const Phi = 1.618
```
{{< /note >}}
