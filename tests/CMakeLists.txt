cmake_minimum_required(VERSION 3.14)
project(Hylozoa-Ui-Tests)

# GoogleTest requires at least C++14
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# GoogleTest
include(FetchContent)
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/03597a01ee50ed33e9dfd640b249b4be3799d395.zip
)
FetchContent_MakeAvailable(googletest)
enable_testing()
  
## Hylozoa Engine github tag
## Can be a branch, a commit or a release
message(STATUS "${Yellow}[TESTS] Fetching Hylozoa_Engine at tag '$ENV{HYLOZOA_ENGINE_GIT_TAG}'${ColourReset}")
FetchContent_Declare(
  hylozoa_engine
  GIT_REPOSITORY git@github.com:Julian52575/Hylozoa-Engine-Engine.git
  GIT_TAG $ENV{HYLOZOA_ENGINE_GIT_TAG}
)
FetchContent_MakeAvailable(hylozoa_engine)

## Ui files
file(GLOB_RECURSE SRC_FILES ${CMAKE_CURRENT_SOURCE_DIR}/../src/*.cpp)
list(REMOVE_ITEM SRC_FILES ${CMAKE_CURRENT_SOURCE_DIR}/../src/main.cpp) #removing main
## Tests
file(GLOB_RECURSE TESTS_FILES
  src/helloWorld_test.cpp
  src/Dummy/dummy_test.cpp
) # Tip: CMake won't complain if a file cannot be found. Make sure the path is correct
add_executable(testSuiteUi
    ${SRC_FILES}
    ${TESTS_FILES}
)
message(STATUS "${Yellow}Compiling files:\n${SRC_FILES}\n${TESTS_FILES}${ColourReset}")
target_link_libraries(testSuiteUi
    GTest::gtest_main
    hylozoa_engine
)
target_include_directories(testSuiteUi PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}
    hylozoa_engine
    ${CMAKE_CURRENT_SOURCE_DIR}/../src
)

include(GoogleTest)
gtest_discover_tests(testSuiteUi)