## 编译lib和core

1. 按照readme下载好robocup_ws，并一键切换分支，下载到机器人的home目录下

2. 打开主目录下.bashrc文件，将最后类似的几行替换成对应代码

```bash
export ROS_MASTER_URI=http://127.0.0.1:11311
export ROS_IP=127.0.0.1

export ROBOT_NAME=pai

export PATH=/usr/local/cuda/bin:$PATH
export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH
export CUDA_HOME=/usr/local/cuda

#export Torch_DIR=/home/nvidia/.local/lib/python3.8/site-packages/torch/share/cmake/Torch
export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig:$PKG_CONFIG_PATH
export PATH=/usr/local/cuda/bin:/usr/src/tensorrt/bin/:$PATH

#export PATH=/home/nvidia/.local/bin:/home/nvidia/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin
#export OTA_HOME="/home/nvidia/workspace/ota-client"
#export PATH=/home/nvidia/.local/bin:/home/nvidia/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin
#export PATH=/home/nvidia/.local/bin:/home/nvidia/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin

export ZJUDANCER_GPU=1
export LD_LIBRARY_PATH=/usr/lib/aarch64-linux-gnu:/usr/local/cuda-11.4/lib64:$LD_LIBRARY_PATH
export ZJUDANCER_ROBOTID=3

source /home/nvidia/robocup_ws/lib/devel/setup.bash
source /home/nvidia/robocup_ws/core/devel/setup.bash
```


其中倒数第三行的ROBOTID，根据实际情况修改，改成当前机器人的编号即可

3. 用vscode，在robocup文件夹下直接打开终端

4. 使用cd命令切换到lib文件夹

5. 运行命令catkin_make

6. 编译成功后，运行命令source devel/setup.bash，设置环境变量

7. cd命令切换到core文件夹

8. 运行命令catkin_make

9. 假如编译失败，可以先在lib文件夹下运行rm -rf build devel,在运行catkin_make，然后回到core文件夹，重复该步骤

10. 如果依旧失败，再查看之前的步骤，有无遗漏
