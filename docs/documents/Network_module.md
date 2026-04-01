# Network Module

## 1. 模块概述

`dnetwork` 是整个机器人系统（ZJUDancer）的网络通信中枢。
* **对内（ROS 节点）：** 它是各个本地算法模块（视觉 Vision、动作 Motion、行为 Behavior）的信息聚合器和分发器。
* **对外（UDP 网络）：** 它是机器人与外界（队友机器人、裁判盒、外部监控端）进行物理数据包交换的唯一接口。

该模块高度依赖底层的两个基础库：
* **`dprocess`：** 提供多线程和定时循环调度的能力。
* **`dtransmit`：** 提供对底层 UDP Socket 的高度封装（异步接收、回调绑定、组播/单播发送）。

---

## 2. 目录结构与核心入口

`dnetwork` 的核心文件包含头文件与源文件两部分，核心依赖标准 RoboCup 的协议头文件：

```text
dnetwork/
├── include/dnetwork/
│   ├── RoboCup/RoboCupGameControlData.h  # 国际 RoboCup 官方定义的裁判盒数据结构
│   ├── gamecontroller.hpp                # 裁判盒通信类头文件
│   └── team.hpp                          # 队内通信类头文件
└── src/
    ├── gamecontroller.cpp
    ├── main.cpp                          # ROS 节点入口
    └── team.cpp
```

### 2.1 模块启动 (`main.cpp`)
作为独立的 ROS 节点，程序入口非常简洁。初始化 ROS 后，实例化 `Team` 和 `GameController`。由于它们均继承自 `dprocess::DProcess`，调用 `spin()` 后会分别在独立的子线程中启动网络监听和定时发送的循环，最后主线程通过 `join()` 阻塞等待。

---

## 3. Team 类：队内通信机制详解

`Team` 类的主要职责是实现多台机器人之间的状态同步（队友在哪、是否看到球、当前处于什么战术角色），并将本机的状态暴露给外部监控。其运行频率设定为 `NETWORK_FREQ = 30Hz`。

### 3.1 接收数据（从队友到本机）
在构造函数中，通过 `dtransmit` 的 `addRawRecv` 绑定了对广播地址 `dconstant::network::TeamInfoBroadcastAddress` 的监听。
**处理逻辑（回调函数）：**
* **尺寸校验：** 检查收到的数据包大小是否严格等于 `dmsgs::TeamInfo` 结构体的大小。
* **阵营过滤：** 解析数据包，判断 `team_number` 是否与本机所属队伍相符（过滤掉场上敌方机器人的干扰包）。
* **ROS 转发：** 符合条件的队友消息，会被打上当前时间戳 `recv_timestamp`，并通过 `/dnetwork_n/TeamInfo` 发布到本地 ROS 总线供 Behavior 等决策模块使用。

### 3.2 收集本机状态（ROS 订阅）
`Team` 类在本地订阅了三个核心话题，利用回调函数（带有 `std::mutex` 线程锁保证数据安全）更新内部的 `info_` 结构体：
* **MotionInfo：** 获取机器人是否处于稳定状态 (`unstable_`)。如果摔倒，则标记为失去比赛能力 (`incapacitated = true`)。
* **BehaviorInfo：** 获取机器人的当前角色（前锋/后卫等）、战术状态、目标点。**特别注意：** 这里对 `voronoi` (维诺图) 数据做了截断处理，限制最大长度为 6 (`MAX_VORONOI_SIZE`)，防止数组越界。
* **VisionInfo：** 获取机器人当前视野信息（是否看到球/球门、球的全局/相对坐标）。
* **GCInfo：** 从本地获取经过 `GameController` 模块解析好的裁判盒状态（是否被罚下）。

### 3.3 发送数据与动态频率控制 (`tick()` 函数)
这是 `Team` 类的核心亮点。由于网络带宽有限，程序实现了**动态发包频率控制 (Dynamic Frequency Control)**：
* **高频 (15Hz / 0.067s)：** 如果本机是**持球机器人** (`BALL_HANDLING`)，需要将球的位置极速同步给队友。
* **中高频 (10Hz ~ 2.5Hz)：** 如果本机**看到了球**，根据球距离机器人的远近决定发包频率。距离越近（<1m），发包越快（10Hz）；距离远（>3m），发包降为 2.5Hz。
* **低频 (1Hz / 1.0s)：** 如果没有看到球，且不持球，处于“盲人”状态，仅维持 1Hz 的心跳包。

**发送通道：**
* **局域网广播 (Broadcast)：** 通过 `transmitter_->sendRaw` 将 `info_` 广播给所有队友。发送前提是 `behaviorReady_` 必须为 true（确保有最新决策数据）。
* **UDP 单播监控 (Unicast Monitor)：** 通过原生的 Socket 编程（`socket()`, `sendto()`），以固定的 1.0s 周期，将 `info_` 单播发送到配置文件中指定的 `UnicastTargetAddress` 和 `UnicastTargetPort`，主要用于场外监控。

---

## 4. GameController 类：裁判盒通信机制详解

`GameController` 负责与比赛官方的裁判盒系统（GameController Server）对接。运行频率较低，为 `FREQ = 2Hz`。

### 4.1 接收数据（从裁判盒到本机）
在构造函数中，通过 `dtransmit` 的 `addRawRecvFiltered` 绑定监听端口 3838（`GAMECONTROLLER_DATA_PORT`）。过滤条件更严格，仅处理大小为 `sizeof(RoboCupGameControlData)` 的包，并在拿到锁后调用 `ParseData()`。

**`IsValidData()` 数据有效性严格校验：**
* **Header 校验：** 前 4 个字节必须是 `"RGme"`。
* **比赛归属校验：** 检查数据包中包含的两个队伍的 `teamNumber`，其中必须有一个是本机的队伍编号。
* 如果一切通过，更新 `last_valid_packet_timestamp_`。

### 4.2 数据解析与转换 (`tick()` 函数)
裁判盒发来的原始数据 (`RoboCupGameControlData`) 结构非常庞大。`tick()` 函数将其剥离并转化为内部紧凑的 `dmsgs::GCInfo`：
* **连接状态监控：** 通过判断当前时间与 `last_valid_packet_timestamp_` 的差值。如果超过 3 秒没有收到合法数据包，判定为断开连接 (`connected_ = false`)。
* **阵营判定：** 根据 `teamNumber_` 自动区分解析包里的 `ourTeam`（己方）和 `enemyTeam`（敌方）。
* **复杂比赛状态拆解：**
    * 将 `gameData.state` 拆解为针对当前阶段的 `setPlayReady` (允许走位) 和 `setPlayFreeze` (必须静止)。
    * 判断具体的定位球类型（任意球、点球、角球、球门球、界外球），并精确区分是己方的球权还是敌方的球权 (`ourDirectFreeKick`, `enemyDirectFreeKick` 等)。
* **惩罚状态提取：** 读取 `ourTeam->players[playerNumber_ - 1].penalty`，判断本机当前是否处于判罚/罚下状态 (`penalised_`)。
* 最后，将整理好的 `info_` 通过 `/dnetwork_n/GCInfo` 发布给本地 ROS 其他节点。

### 4.3 发送数据返回裁判盒 (`tick()` 函数尾部)
按照 RoboCup 规则，机器人需要向裁判盒报告自己的状态（存活心跳、机器人位置、球的相对位置）。
目前代码构建了 `RoboCupGameControlReturnData ret_` 结构体：
* **发送目标：** 向配置参数 `gameControllerAddress_` 的 3939 端口 (`GAMECONTROLLER_RETURN_PORT`) 回传数据。
* **底层实现：** 注意，这里因为裁判盒要求单播，代码没有使用 `transmitter_->sendRaw`，转而直接使用了底层的 Linux Socket API 创建 UDP Socket 发送 (`socket`, `inet_pton`, `sendto`, `close`)。

---

## 5. 模块数据流向图总结

以下两个闭环可以帮助理解 `dnetwork`：

**A. 队友协作闭环 (端口 57335):**
```text
[本地Vision/Behavior/Motion] --(ROS)--> [Team::tick] --(UDP 广播 57335)--> 局域网
局域网 --(UDP 广播 57335)--> [Team::addRawRecv] --(ROS)--> [本地决策系统]
```

**B. 裁判盒调度闭环 (收 3838，发 3939):**
```text
裁判盒 --(UDP 广播 3838)--> [GC::addRawRecvFiltered] --> [GC::ParseData] --(ROS)--> [本地系统]
[GC::tick生成回传数据 ret_] --(UDP 单播 3939)--> 裁判盒 
```