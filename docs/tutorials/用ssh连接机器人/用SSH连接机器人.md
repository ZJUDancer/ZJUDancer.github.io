## 用SSH连接机器人

1. 本地选择 ZJUDancer26_loT 网络，密码：zjudancer

2. vscode 先安装 ssh 插件：remote-ssh

<img src="docs/tutorials/用ssh连接机器人/43c16ccc2ecf4f6ace60eb0e326e267d.png" alt="用SSH连接机器人" />

3. 安装完后点击左侧侧边栏的远程资源管理器，光标挪到 ssh 上，点击右侧显示的 `+`

4. 输入：`ssh nvidia@192.168.50.23x`（x 为机器人编号），按 `Enter`

<img src="docs/tutorials/用ssh连接机器人/51fd8e996b9ad0a5560807cf5e646da7.png" alt="用SSH连接机器人" />

5. 选择第一个选项，一般是 `xxx/home/config`

6. 此时左侧列表里已经能出现机器人 IP 地址了，`192.168.50.23x`

7. 鼠标挪到 IP 地址那一行，右侧会出现“当前窗口连接”或“新窗口连接”，都可以使用

8. 输入密码：`nvidia`，按 `Enter`

<img src="docs/tutorials/用ssh连接机器人/c6f636bd547fbb121492b8a75f943292.png" alt="用SSH连接机器人" />

9. 此时一般已经连上机器人了。假如显示连接失败，可能有以下原因：

   - 实验室网络问题，容易断连
   - 机器人网卡驱动有问题，可以左右拨机器人背后的小操纵杆，调到 IP 地址的界面（在电池界面附近，是一个有正方形方框的界面），观察是否显示 `192.168.50.23x`（记得插网卡）

10. 然后点击左侧侧边栏或顶栏的“文件” → “打开文件夹”，选择 `robocup_ws`（需要 git clone 到 home 目录下），打开

11. 如果想退出远程连接状态，点击左下角的蓝色小方框，然后选择“关闭远程连接”即可
