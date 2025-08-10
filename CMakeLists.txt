cmake_minimum_required(VERSION 3.14)
project(Hylozoa-Ui-Tests)

option(BUILD_TESTS "Build the tests" OFF)
# Colors output
if(NOT WIN32)
  string(ASCII 27 Esc)
  set(ColourReset "${Esc}[m")
  set(Yellow      "${Esc}[33m")
endif()

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Enable testing only if requested
if (NOT BUILD_TESTS)
  add_subdirectory(src)
  message(STATUS "Excluding tests from the build")
else()
  add_subdirectory(tests)
endif()