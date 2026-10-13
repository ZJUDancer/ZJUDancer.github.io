---
title: 基本类型
weight: 20
menu:
  notes:
    name: 基本类型
    identifier: notes-go-basics-types
    parent: notes-go-basics
    weight: 20
---
<!-- String Type -->
{{< note title="字符串" >}}
```go
str := "Hello"
```

多行字符串
```go
str := `Multiline
string`
```
{{< /note >}}

<!-- Number Types -->
{{< note title="数字" >}}
常见类型

```go
num := 3          // int
num := 3.         // float64
num := 3 + 4i     // complex128
num := byte('a')  // byte (alias for uint8)
```

其他类型

```go
var u uint = 7        // uint (unsigned)
var p float32 = 22.7  // 32-bit float
```

{{< /note >}}

<!----------- Arrays  ------>

{{< note title="数组" >}}

```go
// var numbers [5]int
numbers := [...]int{0, 0, 0, 0, 0}
```

{{< /note >}}

<!-- Pointers -->

{{< note size="medium" title="指针" >}}

```go
func main () {
  b := *getPointer()
  fmt.Println("Value is", b)
```

```go
func getPointer () (myPointer *int) {
  a := 234
  return &a
```

```go
a := new(int)
*a = 234
```

指针指向变量的内存地址。Go 具有完整的垃圾回收机制。

{{< /note >}}

<!-- Type Conversion -->

{{< note title="类型转换" >}}

```go
i := 2
f := float64(i)
u := uint(i)
```

{{< /note >}}

<!-- Slice -->

{{< note title="切片" >}}

```go
slice := []int{2, 3, 4}
```

```go
slice := []byte("Hello")
```

{{< /note >}}
