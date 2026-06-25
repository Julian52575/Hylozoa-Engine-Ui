cmake_minimum_required(VERSION 3.16)
project(engine_host)

set(CMAKE_CXX_STANDARD 17)

# --- ARCH ---
if(CMAKE_SYSTEM_PROCESSOR MATCHES "x86_64|amd64|AMD64")
    set(ARCH x86_64)
elseif(CMAKE_SYSTEM_PROCESSOR MATCHES "aarch64|arm64|ARM64")
    set(ARCH aarch64)
else()
    set(ARCH ${CMAKE_SYSTEM_PROCESSOR})
endif()

# --- OS / ABI ---
if(CMAKE_SYSTEM_NAME STREQUAL "Linux")
    set(OS linux-gnu)
elseif(CMAKE_SYSTEM_NAME STREQUAL "Darwin")
    set(OS apple-darwin)
elseif(CMAKE_SYSTEM_NAME STREQUAL "Windows")
    set(OS pc-windows-msvc)
else()
    set(OS ${CMAKE_SYSTEM_NAME})
endif()


# --- TARGET TRIPLET ---
set(TARGET_TRIPLET ${ARCH}-unknown-${OS})

# --- BINARY NAME ---
set(BINARY_NAME hylozoa-${TARGET_TRIPLET})
add_executable(${BINARY_NAME} host/main.cpp)

target_link_directories(${BINARY_NAME} PRIVATE ${CMAKE_SOURCE_DIR}/lib)
target_link_libraries(${BINARY_NAME} PRIVATE hylozoa_engine)

set_target_properties(${BINARY_NAME} PROPERTIES
    SKIP_BUILD_RPATH FALSE
    BUILD_WITH_INSTALL_RPATH FALSE
    INSTALL_RPATH "$ORIGIN/lib"
)


# target_link_directories(engine_host PRIVATE ${CMAKE_SOURCE_DIR}/lib)

# target_link_libraries(engine_host engine)