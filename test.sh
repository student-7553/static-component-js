#!/bin/sh
# set -e

# cmake -S . -B build
cmake --build build
./build/static-component-js "$@"