cmake_minimum_required(VERSION 3.22)
project(JOJO_TOOLS_VST_SUITE VERSION 0.1.0 LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)
set_property(GLOBAL PROPERTY USE_FOLDERS YES)

include(FetchContent)
set(JOJO_JUCE_TAG "8.0.6" CACHE STRING "Pinned JUCE release")
set(JUCE_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)
set(JUCE_BUILD_EXTRAS OFF CACHE BOOL "" FORCE)
FetchContent_Declare(juce
  GIT_REPOSITORY https://github.com/juce-framework/JUCE.git
  GIT_TAG ${JOJO_JUCE_TAG}
  GIT_SHALLOW TRUE)
FetchContent_MakeAvailable(juce)

add_subdirectory(plugins/onde-e-que-eu-to)
