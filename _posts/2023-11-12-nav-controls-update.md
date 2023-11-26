---
title: "Steering Towards Success: AI-Navigation/Controls Subteam's Progress on Autonomous Navigation"
date: 2023-11-12
description: Optimizing Navigation Pathways, Adapting Control Code, and Enhancing Autonomous Operation
# categories:
#   - technical
image: /images/blog/2023-11-12-nav-controls-update.webp
author_staff_member: Georgia Zender
cover_img: /images/blog/2023-11-12-nav-controls-update.webp
cover_img_alt: Navigation members looking at a screen showcasing a simulation of the team's boat
---

My name is Georgia Zender and I am a fourth year computer science student at the University of Michigan. I am one of the co-leads of the AI-Navigation/Controls subteam, which is responsible for programming autonomous navigation and interfacing with the hardware. So far this semester, the AI-Navigation/Controls subteam has been working on optimizing last year’s code in order to perform better in our simulated environment.

On the navigation side, we recently made changes to our costmap so our path planner can map a more ideal path. We first altered how we were weighing the area around obstacles so that the planner would not map a path too close to a buoy. At last year’s competition, our vessel would get too close to buoys at times. To prevent this, we increased the cost of the area around obstacles in the costmap to decrease the likelihood of the planner creating a path that travels near obstacles. Second, we increased the cost of the area behind the vessel so that we don’t end up planning a path where the vessel has to make large turns. Drastically changing directions in our path is unideal because our vessel is not able to make sharp turns efficiently.

Our subteam has now transitioned to working on making alterations to our controls code. We have made modifications to the intended velocity of the vessel in order to account for the vessel’s dynamics. Over the past two weeks, we have written code to calculate the change of angle of the vessel’s path and if this angle is within some threshold of 0, the velocity of the vessel will be greater. Otherwise, the vessel will go slower to better navigate turns in the path. We also implemented code so the vessel will slow down as it reaches its goal to decrease the likelihood of overshooting.

Finally, I got the opportunity to learn from Ben Shattinger, our AI lead, and write code to interface with the boat’s microcontroller. Whenever we receive a ROS message from the thrusters, we send a byte packet to the microcontroller to set PWM outputs. In the process of writing this code, I learned how to use packed structs in C++ in order to write and send byte packets according to an API provided by the Electrical team.

Looking forward, our subteam will be focusing more on controls code optimizations. We want to continue considering the change of angle of the path when determining the vessel’s velocity. We also want to implement code to reverse into the dock for the docking challenge, instead of entering the dock head-on. And finally, in the coming weeks, we expect to test our code on the vessel in the water, instead of the simulated environment. Overall, our subteam has made great progress this semester and we are on-track to achieve all of our goals before competition in February. 
