set(JOJO_PLUGIN_TARGET OndeEQueEuTo)
set(JOJO_FRONTEND_DIR "${CMAKE_CURRENT_SOURCE_DIR}/frontend")
set(JOJO_FRONTEND_DIST "${JOJO_FRONTEND_DIR}/dist")
option(JOJO_USE_VITE_DEV_SERVER "Load http://localhost:5173 instead of embedded assets" OFF)

find_program(NPM_EXECUTABLE npm REQUIRED)
execute_process(COMMAND "${NPM_EXECUTABLE}" run build WORKING_DIRECTORY "${JOJO_FRONTEND_DIR}" RESULT_VARIABLE JOJO_FRONTEND_RESULT COMMAND_ECHO STDOUT)
if(NOT JOJO_FRONTEND_RESULT EQUAL 0)
  message(FATAL_ERROR "Frontend production build failed")
endif()
file(GLOB_RECURSE JOJO_FRONTEND_ASSETS CONFIGURE_DEPENDS "${JOJO_FRONTEND_DIST}/*")
if(NOT JOJO_FRONTEND_ASSETS)
  message(FATAL_ERROR "No frontend assets were produced in ${JOJO_FRONTEND_DIST}")
endif()

juce_add_plugin(${JOJO_PLUGIN_TARGET}
  COMPANY_NAME "JOJO-TOOLS"
  BUNDLE_ID "com.jojotools.onde-e-que-eu-to"
  PLUGIN_MANUFACTURER_CODE Jotl
  PLUGIN_CODE Oeqt
  VERSION 0.1.0
  FORMATS VST3 Standalone
  PRODUCT_NAME "OndeEQueEuTo"
  PLUGIN_NAME "Onde é que eu tô?"
  DESCRIPTION "Ferramenta educacional de escalas e braço de instrumentos"
  IS_SYNTH FALSE
  NEEDS_MIDI_INPUT FALSE
  NEEDS_MIDI_OUTPUT FALSE
  IS_MIDI_EFFECT FALSE
  NEEDS_WEB_BROWSER TRUE
  EDITOR_WANTS_KEYBOARD_FOCUS TRUE
  COPY_PLUGIN_AFTER_BUILD FALSE
  VST3_CATEGORIES Fx)

juce_add_binary_data(OndeEQueEuToFrontend SOURCES ${JOJO_FRONTEND_ASSETS})
target_sources(${JOJO_PLUGIN_TARGET} PRIVATE plugin/PluginProcessor.h plugin/PluginProcessor.cpp plugin/PluginEditor.h plugin/PluginEditor.cpp)
target_compile_definitions(${JOJO_PLUGIN_TARGET} PUBLIC JUCE_WEB_BROWSER=1 JUCE_USE_CURL=0 JUCE_VST3_CAN_REPLACE_VST2=0 JOJO_USE_VITE_DEV_SERVER=$<BOOL:${JOJO_USE_VITE_DEV_SERVER}>)
target_link_libraries(${JOJO_PLUGIN_TARGET} PRIVATE OndeEQueEuToFrontend juce::juce_audio_utils juce::juce_gui_extra PUBLIC juce::juce_recommended_config_flags juce::juce_recommended_lto_flags juce::juce_recommended_warning_flags)
