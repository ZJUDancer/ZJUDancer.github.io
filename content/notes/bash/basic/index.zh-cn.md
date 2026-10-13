---
title: Bash 变量
weight: 210
menu:
  notes:
    name: 变量
    identifier: notes-bash-variables
    parent: notes-bash
    weight: 10
---

<!-- Variable -->
{{< note title="变量" >}}

```bash
NAME="John"
echo $NAME
echo "$NAME"
echo "${NAME}
```

{{< /note >}}

<!-- Condition -->
{{< note title="条件" >}}

```bash
if [[ -z "$string" ]]; then
  echo "String is empty"
elif [[ -n "$string" ]]; then
  echo "String is not empty"
fi
```

{{< /note >}}
