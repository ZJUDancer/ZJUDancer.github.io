***

# Vision module


## 一、代码功能框架（包含主要功能）

注：本部分仅对代码功能进行概括，所提到的关键方法将在下一部分进行详细解读
### 核心模块

#### 相机输入

- ZED 相机
- GstCamera（GStreamer驱动）
    - 管道初始化（ `init()` ）
    - 缓冲区回调（ `onBuffer()` ）
    - 图像尺寸获取（ `GetWidth()` ）
- V4L2Camera（备选驱动，**已弃用**，仅作参考）
- 输入源适配（图像文件夹/视频文件）
#### 帧处理与投影

- 图像数据封装（Frame）
- 逆投影映射（IPM）
    - 3D+2D投影（ `project()` ）
    - 2D+3D反投影（ `inverseProject()` ）
- 坐标转换与航向矫正（Projection）
    - 航向偏移计算（ `CalcHeadingOffset()` ）
#### 目标检测

- 基类 IDetector （统一接口）
- 中心圆检测（CircleDetector）
    - 卡尔曼滤波优化（ `Update()` ）
    - 场地坐标输出（ `result_circle()` ）
- 障碍物检测（ObstacleDetector）
    - 二值图生成（ `GetBinary()` ）
    - 障碍物特征提取（ `Process()` ）
- 角点检测（CornerDetector）
    - 交叉点分类（ `classifyIntx()` ）
    - 定位特征生成（ LandMark ）
- 球检测（BallDetector）
- 球门检测（GoalDetector）
- 线段分类（LineClassifier）
    - 航向偏差计算（ `CalYawBias()` ）

#### 定位与导航

- AMCL
    - 粒子集管理（SampleSet）
    - KdTree聚类（ `ClusterNode()` ）
- Tracker（目标跟踪）
    - 相机角度控制（ `Process()` ）

### 控制中枢

#### 多线程调度
- step1：图像捕获与预处理
- step2：检测与定位
#### ROS通信
- 订阅运动、行为信息
- 发布视觉结果、图像
- 服务：AMCL控制等
#### 状态管理
- 位姿计算
- 初始化（ `InitVisionYaw()` ）
### 辅助部分
#### 配置参数
#### 工具类
#### 测试程序

## 二、代码功能解读（包含主要类与关键方法）

注：以下对关键方法的解读不包含对函数所需传参的解读，只列出函数名
### 1、相机输入功能

#### （1）核心抽象接口 ICamera

- 文件：`dancer-vision/include/dvision/icamera.hpp`
- 主要类：ICamera
    - 核心功能：定义相机输入设备的统一类，所有相机实现类均需要继承该类
    - 关键方法
        - `virtual Frame capture() = 0`：用于获取一帧图像
        - `virtual ~ICamera() = default`：虚析构函数，用于正确释放派生类资源。    
    - 主要作用：允许创建不同类型的相机类，只要它们实现了这个接口并提供了捕获图像的功能
#### （2）V4L2相机驱动

- 文件
    - 头文件：`dancer-vision/include/dvision/v4l2_camera.hpp`
    - 实现文件：`dancer-vision/src/camera/source/v4l2_camera.cpp`
- 主要类：V4L2Camera（继承 Icamera）
    - 核心功能
        - 基于V4L2框架实现相机图像捕获
        - 支持相机参数配置
        - 采用内存映射方式高效获取帧数据
    - 关键方法（头文件）
        - public：用于获取相机信息、设置相机控制参数、初始化相机、从相机获取图像等功能
        - private：用于相机内部初始化与资源管理
    - 关键方法（实现文件）
        - `init()`：相机初始化流程
        - `initFmt()`：配置图像格式
        - `setFrameRate()`：配置图像帧率
        - `initMmap()`：内存映射初始化
        - `startIO() , stopIO()`：启动、停止相机数据流（开始、终止图像帧采集）
        - `setControl()`：设置相机参数
        - `deInit()`：释放所有资源，退出程序
#### （3）GStreamer相机驱动

- 文件
    - 头文件（定义类）：`dancer-vision/include/dvision/gst_camera.hpp`
    - 头文件（配置文件）：`dancer-vision/include/dvision/gst_camera_impl.hpp`
    - 实现文件：`dancer-vision/src/camera/source/gst_camera.cpp`
- 主要类：GstCamera（继承ICamera） & GstCameraImpl
    - 核心功能
        - 基于GStreamer框架实现相机数据捕获
        - 可配置硬件访问与加速、图像源读取路径
        - 根据设备类型适配不同GStreamer源插件
    - 关键方法（定义头文件）
        - `GstCamera()`：初始化相机设备与输出图像分辨率
        - `capture()`：捕获图像，返回Frame对象
    - 关键方法（配置头文件）
        - 核心枚举 `gstCameraSrc`：定义相机输入源类型
        - `Create()`：（制定分辨率）创建相机实例
        - `Open() , Close()`：启动/停止相机数据流传输
        - `~GstCameraImpl()`：释放资源
        - `Capture()`：捕获图像，返回缓冲区指针
        - `ConvertRGBA()`：进行图像格式转换，设置硬件访问
        - `GetWidth()等`：获取图像信息
    - 关键方法（实现文件）
        - `GstCamera()`：初始化相机设备与输出图像分辨率
        - `init()`：解析设备路径，初始化相机
        - `capture()`：获取一帧图像
        - `~GstCamera()`：释放资源
- 依赖关系：GstCamera 类是对GStreamer相机的功能封装，依赖 GstCameraImpl 实现图像捕获，自身作为适配接口
#### ==（4）ZED 相机 . 最重要==（这里面的注释很清晰，就不一一列举）

+ 实现文件1：`dancer-vision/src/camera/source/zed_camera.cpp`
+ 实现文件2：`dancer-vision/src/camera/source/pointcloud_process.cpp`
1. `CreatePointCloud()`函数用于从zed相机中`retrievePointCloud`获得的全部点云数据中获取对应物体bbox范围内的点云。
2. `DownSamplePointCloud()`函数用于降采样，就是将很多点云数据减小，通过体素网格降低点云数量
3. `PointCloudNoiseRemoval()`这个函数用于过滤噪声就是滤去离群点
4. `PlaneFitting()`用于对于点云进行平面拟合
5. `ClusterPointCloud()`用于对点云数据聚类，聚成不同的几类点云
6. `SphereFitting()`用于拟合球面
#### （5）视频文件输入

- 文件
    - 头文件：`dancer-vision/include/dvision/video_file.hpp`
    - 实现文件：`dancer-vision/src/camera/source/video_file.cpp`
- 主要类：VideoFile（继承ICamera）
    - 核心功能
        - 定义并实现视频文件读取
        - 主要用于不依赖真实硬件的条件下的调试和场景测试
        - 通过读取本地视频文件模拟相机输入，提供与真实相机一致的接口
    - 关键方法（头文件）
        - `VideoFile()`：初始化视频文件路径和输出尺寸，调用初始化函数
        - `~VideoFile()`：释放视频捕获资源
    - 关键方法（实现文件）
        - `init()`：初始化函数，检查视频文件打开状态
        - `capture()`：逐帧读取图像，支持循环播放
#### （6）相机参数配置

- 文件
    - 头文件（硬件参数配置）：`dancer-vision/include/dvision/camera_setting.hpp`
    - 头文件（内外参数等算法结构体配置）：`dancer-vision/include/dvision/parameters.hpp`
- 主要结构体：CameraSettings & CameraParameters
    - 核心功能
        - CameraSettings：存储相机设备的硬件参数（分辨率、帧率、曝光、白平衡等），用于初始化相机
        - CameraParameters：存储相机设备的内参矩阵、畸变系数、校正参数等，用于视觉算法
    - 关键特性
        - 区分硬件配置参数（CameraSettings）与算法配置参数（CameraParameters）
        - 与ROS功能集成，支持运行过程中从ROS参数服务器获取数据用于动态调整
### 2、帧处理与投影功能

#### （1）帧处理模块

- 文件
    - 头文件：`dancer-vision/include/dvision/frame.hpp`
    - 实现文件：`dancer-vision/src/camera/misc/frame.cpp`
- 主要类：Frame
    - 核心功能
        - 负责图像帧的接收、格式转换、存储等基本操作
        - 支持从相机设备、本地文件等路径加载图像
        - 提供色彩空间转换能力
    - 关键方法
        - `Frame()`系列构造函数：初始化帧对象
        - `offlineUpdate()`：离线模式更新
        - `cvt()`：颜色空间转换
        - `show()`：显示当前帧
        - `save()`：将当前帧保存到指定路径
#### （2）投影模块

- 文件
    - 头文件：`dancer-vision/include/dvision/projection.hpp`
    - 实现文件：`dancer-vision/src/camera/projection/projection.cpp`
- 主要类：Projection
    - 核心功能
        - 实现图像坐标与真实世界坐标的相互投影
        - 结合相机内外参完成畸变校正、透视变换
        - 完成机器人航向角校正
    - 关键方法（头文件）
        - `init()`：加载相机内外参，初始化投影参数
        - `updateExtrinsic()`：根据输入的p/y角更新IPM外参矩阵
        - `getOnImageCoordinate()`：真实坐标转图像坐标
        - `getOnRealCoordinate()`：图像坐标转真实坐标
        - `RotateTowardHeading()`：坐标旋转校正，抵消机器人航向角偏差
        - `CalcHeadingOffset()`：计算航向偏移，校正IMU数据
    - 关键方法（实现文件）
        - `Projection()`：默认构造函数
        - `init()`：初始化内部成员（相机内外参数等）
        - `~Projection()`：默认析构函数
        - `updateExtrinsic()`：更新相机外参
        - `getOnImageCoordinate()`：真实坐标转化为图像坐标
        - `getOnRealCoordinate()`：图像坐标转化为真实坐标
        - `RotateTowardHeading()`：航向角旋转调整
        - `CalcHeadingOffset()`：根据检测得到的信息计算航向偏移
        - `UpdateHeadingOffset()`：修正偏航角
        - `SetHeadingOffsetBias()`：设置航向偏移偏差
### 3、目标检测

#### （1）核心抽象接口 IDetector

- 头文件：`dancer-vision/include/dvision/idetector.hpp`
- 核心功能：定义检测器的核心行为，便于后续进行灵活扩展，为所有具体的检测器提供了统一的接口规范
- 纯虚函数`Init()`：用于返回检测器初始化是否成功
#### （2）中心圆检测

- 文件
    - 头文件：`dancer-vision/include/dvision/circle_detector.hpp`
    - 实现文件：`dancer-vision/src/detector/circle_detector.cpp`
- 主要类：CircleDetector（继承IDetector）
    - 核心功能
        - 通过卡尔曼滤波进行中心圆检测
        - 输出场地坐标
    - 关键方法（头文件）
        - `CircleDetector()`：构造函数，初始化CircleDetector对象
        - `Init() override`：重写自IDetector类，用于初始化CircleDetector，返回初始化是否成功
        - `Detect()`：从X形交叉点检测圆心
        - `Process()`：助理中心圆检测逻辑，返回是否检测到中心圆
        - `Update()`：通过卡尔曼滤波器更新圆位置的预测
        - `result_circle()`：获取场地中心圆坐标
    - 关键方法（实现文件）
        - `CircleDetector()`：初始化CircleDetector对象
        - `Init()`：初始化卡尔曼滤波器，设置最大丢失帧数
        - `Detect()`：进行圆检测并更新坐标，检测到圆则计入地标
        - `Process()`：从候选交点对中筛选并计算圆形中心
        - `Update()`：使用卡尔曼滤波器更新圆形坐标
#### （3）障碍物检测

+ ==文件（新）==：`dancer-vision/src/detector/zed_obstacle_detector.cpp`
	大部分函数功能都可以参考“文件（老）”部分的函数介绍，下面介绍两个新函数以及一个功能有所更新的函数
	+ `EstimateByColor()` ：使用反投影的方式获得障碍物的信息
	+ `EstimateByDepth()`：使用深度的方式获得障碍物的信息
	+ `Detect()`：对 EstimateByDepth 再包装一下，然后将结果写入 `dmsgs` 的 `vision_info` 中的 `obstacle_field` 中

- 文件（老）
    - 头文件：`dancer-vision/include/dvision/obstacle_detector.hpp`
    - 实现文件：`dancer-vision/src/detector/obstacle_detector.cpp`
- 主要类：ObstacleObject & ObstacleDetector（继承IDetector）
    - ObstacleObject 核心功能
        - 表示障碍物对象
        - 对障碍物对象状态等信息进行提取，更新结果
    - ObstacleDetector 核心功能
        - 处理图像获得障碍物检测结果
        - 对外提供访问检测结果的接口
    - ObstacleObject 关键方法
        - `position()`：返回障碍物位置  
        - `confidence()`：返回边界限制置信度    
        - `id()`：返回障碍物ID
        - `DecayConfidence()`：随时间衰减置信度
        - `Update()`：更新障碍物位置与置信度并返回更新是否成功
    - ObstacleDetector 关键方法
        - `Init()`：初始化检测器
        - `Detect()`：核心检测方法，完成障碍物检测并存储结果
        - `obstacle_objects()`：返回所有障碍物对象的集合
        - `Update()`：更新障碍物位置和置信度
        - `Process()`：处理障碍物检测结果
#### （4）角点检测

- 文件
    - 头文件：`dancer-vision/include/dvision/corner_detector.hpp`
    - 实现文件：`dancer-vision/src/detector/corner_detector.cpp`
- 主要类：CornerDetector（继承IDetector）
    - 核心功能：结合线段检测、YOLO检测等算法实现角点检测、分类和可视化，从图像中提取角点特征并映射到实际场地坐标
    - 关键方法
        - `CornerDetector()`：构造函数，初始化角点检测器实例
        - `~CornerDetector()`：析构函数，释放资源
        - `Init()`：初始化检测器
        - `Detect()`：从检测结果提取角点并存取信息，生成可视化
        - `Process()`：返回是否成功检测到角点
        - `yoloDetect()`：利用YOLO检测结果提取角点特征并结合投影变换处理场地特征
        - `classifyIntx()`：对角点进行权重计算与分类
#### （5）球检测

- 文件
    - 头文件：`dancer-vision/include/dvision/ball_detector.hpp`
    - 实现文件：`dancer-vision/src/detector/ball_detector.cpp`
- 主要类：BallDetector（继承IDetector）
    - 核心功能：从图像中检测球的位置并进行相关验证和处理，最终输出球的坐标
    - 关键方法
        - `BallDetector()`：构造函数，初始化球类检测器实例
        - `Init()`：初始化
        - `Detect()`：核心检测入口方法，接受图像信息，完成检测流程并生成可视化结果
        - `Process()`：处理检测逻辑，协调检测流程
        - `FindBallCenter()`：查找球中心位置
        - `CheckBallInField()`：检查球的场地坐标是否在场地边界内
        - `CheckBallDist()`：距离校验，过滤超出最大可见距离的球
        - `CheckBallRadius()`：检测球的实际半径是否在合理范围
#### （6）球门检测

- 文件
    - 头文件：`dancer-vision/include/dvision/goal_detector.hpp`
    - 实现文件：`dancer-vision/src/detector/goal_detector.cpp`
- 主要类：GoalDetector（继承IDetector）
    - 核心功能：从目标检测得到的边界框中处理并确定球门在场地平面中的位置，通过卡尔曼滤波进行修正以提高稳定性
    - 关键方法
        - `GoalDetector()`：构造函数，初始化球门探测器
        - `Init()`：初始化，完成卡尔曼滤波器创建与边界矩形设置
        - `Detect()`：检测流程入口，处理球门候选框，更新检测结果并记录
        - `Process()`：将球门柱边界框转换为场地坐标并初步筛选
        - `Update()`：使用卡尔曼滤波器更新球门位置并判断是否检测到有效球门
        - `CheckGoalWidthAngle()`：校验候选球门宽度和角度，筛选最可能的球门中心位置
#### （7）线段分类（暂时无用）

- 文件
    - 头文件：`dancer-vision/include/dvision/line_classifier.hpp`
    - 实现文件：`dancer-vision/src/detector/line_classifier.cpp`
- 主要类：LineClassifier
    - 核心功能：对线段进行分类并基于分类结果计算yaw角偏差，实现对机器人航向的校正，优化机器人航向估计
    - 关键方法
        - `LineClassifier()`：构造函数
        - `Init()`：初始化
        - `Process()`：处理输入的线段，分类，计算yaw角漂移
        - `CalYawBias()`：计算yaw角修正偏差的平均值
#### YOLO v8 重要推理函数：`inference()`

+ 位置：`dancer-vision/src/detector/impl.cpp`
+ 应用：`inference()` 函数已经嵌入在 `object_detector.cpp` 的 `Process()` 函数中，`Process()` 函数的作用是使用 YOLO v8 框出识别物体的函数，这个函数识别之后会将所有识别到的物体的 bbox 传入视觉当中的共享信息
### 4、定位与导航

#### AMCL

- 代码框架(`amcl.cpp`)：
	- 初始化：`AMCL::Init()`
		- 主要功能：用于初始化 AMCL 算法的各种参数，包括粒子数目、地图、传感器模型等。在这里会创建粒子集并为每个粒子生成随机初始位置和姿态。
	- 过程: `AMCL::Process()`
		- 主要功能：处理每一帧的输入数据，更新粒子的位置 `Update()`，计算粒子的权重，并根据传感器的反馈调整粒子的估计值。同时，会更新机器人的位姿，并将结果发送给 `visionInfo`，供后续的定位和决策使用。
	- **更新（重要）**：`AMCL::Update()`
		- 主要功能：主要分为两个步骤：首先是通过控制输入来更新粒子的位置（通过运动模型 `SampleMotionModel`），然后通过测量模型 `MeasurementModel` 来更新粒子的权重。它还会在一定周期后进行重采样，以减小粒子权重的不均衡问题。
			- `SampleMotionModel`
				- 主要功能：根据机器人控制输入（即 `dx` 和 `dy`，表示机器人的位移量），并结合高斯噪声模拟机器人的运动，从而更新每个粒子的位姿（位置和朝向）。
				- 输入变量：机器人速度信息 `Control &u`
				- 函数具体逻辑：
					- 1. 提取控制输入（表示机器人在 x，y 方向的位移量）
						- `double dx=u.dx`
						- `double dy=u.dy`
					- 2. 定义边界
						- `double w=`
						- `double h=`
						- 确保机器人运动时不会超出设定的区域
					- 3. 取得机器人位移
						- `for (auto &particle : this->particles()) ` 
						- 先提取每个粒子的位姿 `p`。控制输入的 `dx` 和 `dy` 加上高斯噪声来表示机器人的位移
					- 4. 更新粒子位置
						- 根据粒子当前朝向 `heading` 更新粒子的新位置
						- `heading` 取机器人的航向角 (yaw角)
						- 如果是仿真环境 `simulation`，根据粒子朝向计算位移
						- 否则，简单地在 x 和 y 方向上增加 `ddx` 和 `ddy`
					- 5. 设置朝向
						- `p.setHeading(yaw_);
						- 更新粒子的朝向为当前的 `yaw_`，即机器人的朝向角度。
					- 6.限制粒子位置在边界内
						- `p.setX(std::min(p.x(), w));`
						- 为了确保粒子的位置不会超出预定的边界，使用 `std::min` 和 `std::max` 来限制粒子的新位置在 `[-w, w]` 和 `[-h, h]` 范围内。如果粒子的 x 或 y 超出了这个范围，就会被限制在边界内。
			- `MeasurementModel`
				- **主要功能（定位中的核心部分）**：根据传感器测量数据来更新每个粒子的权重。具体来说，粒子的权重是根据每个粒子的位置和传感器测量值（场地特征点、目标中心等）的匹配度计算的。
				- 函数具体逻辑：
					- 1.初始化变量
						- 粒子集指定当前使用、设置总权重为 0、定义 `max_dist_error` 限制最大允许距离误差
					- 2.处理场地特征点
						- `if (z.field_points.size() > 1 ||`
						- 如果传感器测量数据中包含多个场地特征点，或者只有一个场地特征点并且是交叉点（T_INTXN）或罚球点（PENALTY_MARK），则对这些特征点进行处理。
						- 对于每个场地特征点，计算粒子与特征点的距离（`dist`），并用高斯分布（`normal_pdf`）计算粒子的权重
							- `dancer_geometry::GetDistance(field_pt.pred)` 计算特征点与粒子位置的距离。
							- 然后，将每个参考点（`field_pt.ref`）与粒子在全局坐标系下的位置进行比较，找到最小的距离误差。`dist_error = min(dist_error, dancer_geometry::GetDistance(pt_global, ref));`
							- 如果误差在设定的最大误差范围内，则根据误差计算粒子的权重，并更新粒子的概率（`pz`）：
					- 3. 处理中心点
					- 4. 处理目标中心（3 和 4 的逻辑都与 2 相同）
					- 5. 更新粒子权重
						- 对每个粒子的权重进行更新（通过概率加权的方式）。然后累加所有粒子的权重以计算总权重。
					- 6. 权重归一化
					- 7.慢速和快速权重更新
						- 通过慢速和快速更新的方式，分别更新 `w_slow_` 和 `w_fast_`，以便根据粒子权重的平均值来调整系统的性能和精度
					- 8. 如果没有有效的权重
						- 如果没有有效的权重（即 `total_weight` 为 0），则将所有粒子的权重设为均匀分布。
	- 重采样：`AMCL::Resample()`
		- 主要功能：在 AMCL 中，重采样是一个关键的过程。它的目的是根据粒子的权重进行选择，抛弃那些不合适的粒子，保留那些与实际位置更加接近的粒子。重采样的条件是在某些情况下，比如粒子一致性不高或传感器数据提供了明显的新信息时。
		- 函数具体逻辑：
			- 使用 `set_b.samples` 中的样本进行随机重排，并计算每个样本的累计权重。
			- 如果传感器数据（例如目标或中心点）表明位置发生变化，基于目标或中心点进行某些粒子的重新采样，将它们集中到可能的区域。
			- 对于高权重的粒子，生成新的粒子在原位置附近重新分布。
			- 最后，进行基于高权重粒子的重采样。