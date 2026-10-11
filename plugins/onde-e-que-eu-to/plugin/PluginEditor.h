#pragma once

#include <juce_gui_extra/juce_gui_extra.h>
#include "PluginProcessor.h"

class OndeEQueEuToAudioProcessorEditor final : public juce::AudioProcessorEditor, private juce::Timer
{
public:
    explicit OndeEQueEuToAudioProcessorEditor (OndeEQueEuToAudioProcessor&);
    ~OndeEQueEuToAudioProcessorEditor() override = default;
    void resized() override;

private:
    using Resource = juce::WebBrowserComponent::Resource;
    juce::WebBrowserComponent::Options makeBrowserOptions();
    std::optional<Resource> getResource (const juce::String& url) const;
    void timerCallback() override;
    void setParameterFromWeb (const juce::var& payload);
    OndeEQueEuToAudioProcessor& processor;
    juce::WebBrowserComponent browser;
    float lastNotesGain = std::numeric_limits<float>::quiet_NaN();
    float lastMainGain = std::numeric_limits<float>::quiet_NaN();
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (OndeEQueEuToAudioProcessorEditor)
};
