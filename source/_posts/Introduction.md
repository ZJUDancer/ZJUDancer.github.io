---
title: Introduction.
date: 2017-10-23 20:53:03
tags:
  - RoboCup
  - Humanoid
  - ZJUDancer
---

The robots developed by ZJUDancer for RoboCup 2017 are fully autonomous humanoid robots which play dierent parts as a team in the football game. During the past few years, we won the champions of RoboCup China Open 2007, 2009, 2010, 2011, 2012, and 2013 and advanced to quarter-nals in RoboCup 2012 Mexico and RoboCup 2013 Netherlands. In RoboCup 2015, 2016 and 2017, We won the second place.

## Overview of system

The robots developed by ZJUDancer for RoboCup 2017 are fully autonomous humanoid robots which play different parts as a team in the football game.

## Hardware

### Compute Unit

Our robots are equipped with NVIDIA Jetson Tegra X1, a supercomputer with powerful GPU. It features NVIDIA Maxwell architecture, 256 NVIDIA CUDA cores, and 64-bit CPUs. The deep learning algorithm is highly demanding on the GPU. And CUDA acceleration provided by TX1 make it possible on our robots.

### Sensors specification

- Servo: DYNAMIXEL mx-64, mx-28, with joint angle feedback, it helps close-loop control.
- IMU: Analog device ADIS16355. Featured with tri-axis gryoscope, and tri-axis accelerometer. It helps to keep balance of our robot.
- Image sensor: We changed our camera from Logitech C930 to OmniVision OV2710 with 150 degree Fov. It provides wider view angle, and helps improve the efficiency of perception.

## Software

This year we largely refactored our software system. In order to decrease the coupling of different modules, we rewired all modules using publish-subscribe pattern. The network middleware we use is ZMQ, as it supports many different languages, we implement Behavior modules in Lua, and other modules in C++, all connected to each other seamlessly.

In our robots, we have 5 process running simultaneously. The vision process runs at 30Hz, and processing incoming images. The motion process runs at 10Hz and deals with local motion. The localization process and beahvior process runs at the same rate with vision process. Lastly, the network process runs at 5Hz to process network messages.

### Vision

#### Camera Module

we use libjpeg-turbo to decompress the JEPG images into RGB images.

#### Image processing

Last year, we used a ICF(integral channel feature) classifier trained by Adaboost, and detect using sliding window. Since it only detects gray distribution without geometry informations, detecting the ball under complex environment like nearing the goal post is error-prone. Furthermore, it's very sensitive to the lighting condition.

This year, in order to solve the questions above, we applied CNN in object detection with the NVIDIA Jetson TX1. Basically, we use Darknet framework and YOLO to detect the ball, goal post and robots. In order to get higher performance, we are trying to implement a independent inference method on darknet aside from the forward propagation using methods like fp16. Because of the motion of the robot, the images are highly blurred, so we used a Kalman filter to get a stable ball position.

Color segmentation is applied to distract all the white points on the field for the usage of self-localization.

### Navigation

In order to get close to the target more quickly and avoid obstacles, last year we did some experiment on our mobile platform. Later we'll try to implement it on our humanoid robot. The experiment is highly involved with ROS(Robot Operating System) and RhIO library.

Firstly, an developed an improved global path planning algorithm based on generalized voronoi diagram and Hybrid A* algorithm is implemented. Compared with the traditional global path planning algorithm, the method takes into account the minimum turning radius which is geometric constraint of the robots, and introduces the Reeds-Sheep optimal trajectory which skips a large number of open research spaces to improve the algorithm speed. Finally, we use gradient descent optimization to make the final path more smooth and reasonable.

Secondly, a path tracking method based on Nonlinear Model Predictive Control (NMPC) is proposed. The trajectory tracking method based on NMPC takes into account the model information of the robot itself and improves the accuracy of trajectory tracking. The control period of trajecotory planning can be kept within 40ms at all times.

As shown above, it's easy and essential to test and verify the algorithm in mobile robots and we have done a good experiment in mobile robots. Next step, we will verify the algorithm in our biped robots.

### Behavior

Our behaviour model is based on behaviour tree, implemented in Lua. It reads information from the localization module and gamecontroller module, plans movement for every frame. This year we added new ball searching strategy.

### Network

Our behaviour model is based on behaviour tree, implemented in Lua. It reads information from the localization module and gamecontroller module, plans movement for every frame. This year we added new ball searching strategy.
