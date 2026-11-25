cmake_minimum_required(VERSION 3.20)
project(static-component-js LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

file(GLOB_RECURSE SOURCES CONFIGURE_DEPENDS ${CMAKE_SOURCE_DIR}/src/*.cpp)

add_executable(static-component-js ${SOURCES})

target_include_directories(static-component-js PRIVATE ${CMAKE_SOURCE_DIR}/src)

