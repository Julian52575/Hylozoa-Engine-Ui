set export := true
set dotenv-load := true

help:
    just --list

build:
    mkdir build || true && cmake . build/
    make
    mv src/hylozoa_ui .

run:
    if [[ ! -x hylozoa.exe ]]; then just build ; else echo "executable already present, skipping build..."; fi
    ./hylozoa_ui

test:
    mkdir build || true && cmake . build -DBUILD_TESTS=ON
    make
    ./tests/testSuiteUi

clean:
    just clean-cmake
    rm -rf hylozoa_ui

clean-cmake:
    rm -rf bin/ build/ CMakeCache.txt CMakeFiles/ cmake_install.cmake \
        CTestTestfile.cmake _deps/ lib/ testSuite *.cmake Makefile
    rm -rf tests/bin/ tests/build/ tests/CMakeCache.txt tests/CMakeFiles/ tests/cmake_install.cmake \
        tests/CTestTestfile.cmake tests/_deps/ tests/lib/ tests/testSuite tests/*.cmake tests/Makefile
    rm -rf src/bin/ src/build/ src/CMakeCache.txt src/CMakeFiles/ src/cmake_install.cmake \
        src/CTestTestfile.cmake src/_deps/ src/lib/ src/testSuite src/*.cmake src/Makefile

clean-nix:
    rm -rf .direnv
    nix-collect-garbage -d
    echo "Env has been cleaned. Run direnv reload to re-download everything."