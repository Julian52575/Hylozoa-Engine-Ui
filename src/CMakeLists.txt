cmake_minimum_required(VERSION 3.14)
project(Hylozoa-Ui)
include(FetchContent)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Colors output
if(NOT WIN32)
  string(ASCII 27 Esc)
  set(ColourReset "${Esc}[m")
  set(Yellow      "${Esc}[33m")
endif()

## Hylozoa Engine github tag
## Can be a branch, a commit or a release
message(STATUS "${Yellow}[SRC] Fetching Hylozoa_Engine at tag '$ENV{HYLOZOA_ENGINE_GIT_TAG}'${ColourReset}")
FetchContent_Declare(
  hylozoa_engine
  GIT_REPOSITORY git@github.com:Julian52575/Hylozoa-Engine-Engine.git
  GIT_TAG $ENV{HYLOZOA_ENGINE_GIT_TAG}
)
FetchContent_MakeAvailable(hylozoa_engine)

## Shared library
file(GLOB_RECURSE SRC_FILES
  main.cpp
  Dummy/Dummy.cpp
)  # Cmake won't complain if a file cannot be found. Be careful
message(STATUS "${Yellow}Compiling files:\n${SRC_FILES}${ColourReset}")
# Add public include directories for the library
add_executable(hylozoa_ui
    ${SRC_FILES}
)
target_include_directories(hylozoa_ui PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}
    hylozoa_engine
)
target_link_libraries(hylozoa_ui
    hylozoa_engine
)
