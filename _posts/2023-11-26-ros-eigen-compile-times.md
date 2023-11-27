---
title: "Make your ROS & Eigen C++ code compile faster with precompiled headers"
date: 2023-11-26
description: Using Clang to profile time spent per file
image: /images/blog/ros-eigen-compile-times/header.png
author_staff_member: Ben Schattinger
cover_img: /images/blog/ros-eigen-compile-times/header.png
cover_img_alt: ROS compile times sped up 3x
---

We all know the feeling: write your code, save it, `catkin_make` (or `catkin build`, or `colcon build`), and... wait. Even if you just change a number, you might be waiting upwards of 8 seconds. While small in comparison to the time it takes to actually write the code, this can [absolutely be distracting](https://steven-lemon182.medium.com/a-guide-to-reducing-development-wait-time-part-1-why-9dcbbfdc1224) when you want to test the change *right* away. With these changes, I can recompile a ROS node that uses Eigen in less than 1.5 seconds. **While I'm using ROS Noetic on Ubuntu 20.04, this is applicable to any codebase using C++**.

## First: a note about compilers

A simple trend about compilers: the newer it is, the faster it is. So when Ubuntu 20.04 comes with GCC 9 from 2019, it's going to be slower than Clang 12, an alternative C++ compiler, released in 2021. While there are newer versions of both GCC and Clang, Clang 12 is the newest compiler available in Ubuntu 20.04 with just a simple `sudo apt install`. As such, I recommend switching—simply `sudo apt install clang-12`. To use it, anytime you'd write `gcc` use `clang-12` instead, and `g++` can be replaced with `clang++-12`. There's no changes needed to your code, as GCC and Clang both implement the C++ standard. To start using it in ROS, you'll need to tell CMake to use Clang with a few environment variables. You'll want to set `CC` to `clang-12`, `CXX` to `clang++-12`, and `LD` to `clang++-12`. To do this temporarily, run in a terminal:

```
export CC=clang-12
export CXX=clang++-12
export LD=clang++-12
```

(note: this will only have effect in *that specific terminal*, and will go away when you close it). Then, and this is an important step, **delete previously compiled files** by deleting the `build` folder in your workspace—there can be [some issues](https://stackoverflow.com/questions/19364969/compilation-fails-with-relocation-r-x86-64-32-against-rodata-str1-8-can-not) when mixing compilers, and CMake won't switch to the new compiler until you rebuild anyways. Now, just build! It should hopefully be faster. [Make sure you set it permanently](https://unix.stackexchange.com/questions/117467/how-to-permanently-set-environmental-variables) so it doesn't switch back in the future.

If you're not on Ubuntu 20.04, you might want to experiment with different compilers! If you're using GCC, try Clang—it might just happen to be faster.

## What's the problem?

In C and C++, writing `#include` will look up that file, and then *copy and paste its contents into the original file*. As such, files that appear small have to look through an incredibly high amount of code. You can find how much code is included like this by running your compiler with with the `-E` flag, like `g++ -E source.cpp` or `g++ -E source.cpp`. As an example, one ROS node with only 250 lines of code expanded into over 200,000 lines with `#include`s processed!

## How precompiled headers help

Instead of re-reading, lexing, and parsing all these lines of headers that never change, you can enable precompiled headers in your compiler. By writing its internal data structures to disk, these steps happen only once! To use precompiled headers, you need to specify which specific headers to preprocess. CMake has an incredibly easy way to do this—the build tool already used by ROS! In your CMakeLists.txt, look for a line that looks like this:

```
add_executable(some_target_name src/some_source_file.cpp)
# --- OR ---
add_library(some_target_name src/some_source_file.cpp)
# --- OR ---
cs_add_executable(some_target_name src/some_source_file.cpp)
```

Anywhere after it, just add these lines to precompile headers, just making sure to update `some_target_name` with the name within add_executable!

```
target_precompile_headers(some_target_name
  PRIVATE
    <ros/ros.h>
    <eigen3/Eigen/Core>
)
```

Note that this may use significant disk space. Expect 300MB with GCC 9 (the default on Ubuntu 20.04), and around 60MB with Clang 12.

### Building multiple nodes in a package?

Save some time by sharing precompiled headers! Instead of writing

```
add_executable(node_1 src/node_1.cpp)
add_executable(node_2 src/node_2.cpp)

# BAD WAY

target_precompile_headers(node_1
  PRIVATE
    <ros/ros.h>
    <eigen3/Eigen/Core>
)
target_precompile_headers(node_2
  PRIVATE
    <ros/ros.h>
    <eigen3/Eigen/Core>
)
```

you can reuse the precompiled header:

```
add_executable(node_1 src/node_1.cpp)
add_executable(node_2 src/node_2.cpp)

# GOOD WAY

target_precompile_headers(node_1
  PRIVATE
    <ros/ros.h>
    <eigen3/Eigen/Core>
)
target_precompile_headers(node_2 REUSE_FROM node_1)
```

This will reduce the work needed to precompile headers (since it only needs to happen once) in addition to disk space. Unfortunately, **reusing headers may not work** if you want to include more headers in only one target—some compilers support this, but CMake doesn't. This will also not work if one target is an executable and one is a library.

## But how do I know what headers to precompile?

Thankfully, the Clang compiler has a built-in tool to show you what headers take the most time to compile! After making sure you've [switched to Clang](#first-a-note-about-compilers), add this to the CMakeLists.txt for the package you'd like to inspect:

```
add_compile_options(-ftime-trace)
```

*If you're using the compiler directly, you can use `clang++ -ftime-trace` instead*

When you recompile, you'll notice a bunch of json files in your build folder—find them with `find build -name "*.cpp.json"` when you're currently in your ROS workspace directory. Head on over to [ui.perfetto.dev](https://ui.perfetto.dev/) and <kbd>Open Trace File</kbd> on the left panel, selecting that JSON file. You'll be presented with a graph showing all the time spent compiling this file:

![Compiler trace](/images/blog/ros-eigen-compile-times/PerfettoUI.png)

Take a look at those turquise blocks labeled "Source"—that's all time spent reading source files! We can see that a whole **3 seconds** is spent on header files. Click on them to see what file is taking a while:

![Compiler trace of ros.h](/images/blog/ros-eigen-compile-times/PerfettoUIROS.png)

That's 1.4 seconds on `ros/ros.h`! There's no need for that. So, after adding that, Eigen, and a few other headers used in this file [as a precompiled header](#how-precompiled-headers-help), we can check out the graph again:

![Compiler trace with precompiled](/images/blog/ros-eigen-compile-times/PerfettoUIafter.png)

Look how much less time is spent on Sources! Note that the graph always takes up the full screen width, so the sections that now appear bigger just take up the same amount of time as before.
