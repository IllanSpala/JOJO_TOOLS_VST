#pragma once

#include <array>
#include <atomic>
#include <juce_audio_processors/juce_audio_processors.h>

class SeEncontreAudioProcessor final : public juce::AudioProcessor
{
public:
    SeEncontreAudioProcessor();
    ~SeEncontreAudioProcessor() override = default;
    void prepareToPlay (double, int) override;
    void releaseResources() override;
    bool isBusesLayoutSupported (const BusesLayout&) const override;
    void processBlock (juce::AudioBuffer<float>&, juce::MidiBuffer&) override;
    juce::AudioProcessorEditor* createEditor() override;
    bool hasEditor() const override { return true; }
    const juce::String getName() const override { return "SeEncontre"; }
    bool acceptsMidi() const override { return false; }
    bool producesMidi() const override { return false; }
    bool isMidiEffect() const override { return false; }
    double getTailLengthSeconds() const override { return 2.0; }
    int getNumPrograms() override { return 1; }
    int getCurrentProgram() override { return 0; }
    void setCurrentProgram (int) override {}
    const juce::String getProgramName (int) override { return {}; }
    void changeProgramName (int, const juce::String&) override {}
    void getStateInformation (juce::MemoryBlock&) override;
    void setStateInformation (const void*, int) override;
    void triggerNote (int midiNote, float durationSeconds = 0.8f, double delaySeconds = 0.0);
    void triggerScale (const juce::Array<juce::var>& midiNotes);
    void stopReferenceNotes();

    juce::AudioProcessorValueTreeState parameters;
    static constexpr auto notesOutputGainId = "notesOutputGain";
    static constexpr auto mainOutputGainId = "mainOutputGain";

private:
    struct NoteCommand { int midi = 60; int delaySamples = 0; int durationSamples = 1; unsigned generation = 0; };
    struct Voice { bool active = false; double phase = 0.0, increment = 0.0; int age = 0, duration = 1; };
    struct Scheduled { bool active = false; NoteCommand command; };
    static juce::AudioProcessorValueTreeState::ParameterLayout createParameterLayout();
    void startVoice (const NoteCommand&);
    static constexpr int queueSize = 128;
    juce::AbstractFifo commandFifo { queueSize };
    std::array<NoteCommand, queueSize> commandQueue {};
    std::array<Scheduled, queueSize> scheduled {};
    std::array<Voice, 16> voices {};
    std::atomic<bool> stopRequested { false };
    std::atomic<unsigned> noteGeneration { 0 };
    std::atomic<double> currentSampleRate { 44100.0 };
    juce::LinearSmoothedValue<float> mainGain;
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (SeEncontreAudioProcessor)
};
