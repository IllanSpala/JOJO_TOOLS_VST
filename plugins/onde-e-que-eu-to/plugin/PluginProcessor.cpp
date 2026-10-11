#include "PluginProcessor.h"
#include "PluginEditor.h"

OndeEQueEuToAudioProcessor::OndeEQueEuToAudioProcessor()
    : AudioProcessor (BusesProperties().withInput ("Input", juce::AudioChannelSet::stereo(), true)
                                      .withOutput ("Output", juce::AudioChannelSet::stereo(), true)),
      parameters (*this, nullptr, "PARAMETERS", createParameterLayout()) {}

juce::AudioProcessorValueTreeState::ParameterLayout OndeEQueEuToAudioProcessor::createParameterLayout()
{
    juce::AudioProcessorValueTreeState::ParameterLayout layout;
    const juce::NormalisableRange<float> range { -12.0f, 12.0f, 0.1f };
    layout.add (std::make_unique<juce::AudioParameterFloat> (notesOutputGainId, "Notes Output", range, 0.0f, "dB"));
    layout.add (std::make_unique<juce::AudioParameterFloat> (mainOutputGainId, "Output", range, 0.0f, "dB"));
    return layout;
}

void OndeEQueEuToAudioProcessor::prepareToPlay (double sampleRate, int)
{
    currentSampleRate.store (sampleRate);
    mainGain.reset (sampleRate, 0.02);
    mainGain.setCurrentAndTargetValue (juce::Decibels::decibelsToGain (parameters.getRawParameterValue (mainOutputGainId)->load()));
}

void OndeEQueEuToAudioProcessor::releaseResources() { stopReferenceNotes(); }

bool OndeEQueEuToAudioProcessor::isBusesLayoutSupported (const BusesLayout& layouts) const
{
    const auto input = layouts.getMainInputChannelSet();
    const auto output = layouts.getMainOutputChannelSet();
    return (input == juce::AudioChannelSet::mono() || input == juce::AudioChannelSet::stereo()) && input == output;
}

void OndeEQueEuToAudioProcessor::triggerNote (int midiNote, float durationSeconds, double delaySeconds)
{
    const auto rate = currentSampleRate.load();
    const NoteCommand command { juce::jlimit (0, 127, midiNote), juce::jmax (0, juce::roundToInt (delaySeconds * rate)), juce::jmax (1, juce::roundToInt (durationSeconds * rate)), noteGeneration.load() };
    int start1, size1, start2, size2;
    commandFifo.prepareToWrite (1, start1, size1, start2, size2);
    if (size1 > 0) commandQueue[static_cast<size_t> (start1)] = command;
    commandFifo.finishedWrite (size1);
}

void OndeEQueEuToAudioProcessor::triggerScale (const juce::Array<juce::var>& midiNotes)
{
    stopReferenceNotes();
    for (int index = 0; index < midiNotes.size(); ++index) triggerNote (static_cast<int> (midiNotes[index]), 0.55f, index * 0.42);
}

void OndeEQueEuToAudioProcessor::stopReferenceNotes() { noteGeneration.fetch_add (1); stopRequested.store (true); }

void OndeEQueEuToAudioProcessor::startVoice (const NoteCommand& command)
{
    auto voice = std::find_if (voices.begin(), voices.end(), [] (const Voice& candidate) { return ! candidate.active; });
    if (voice == voices.end()) voice = voices.begin();
    voice->active = true;
    voice->phase = 0.0;
    voice->increment = juce::MathConstants<double>::twoPi * juce::MidiMessage::getMidiNoteInHertz (command.midi) / currentSampleRate.load();
    voice->age = 0;
    voice->duration = command.durationSamples;
}

void OndeEQueEuToAudioProcessor::processBlock (juce::AudioBuffer<float>& buffer, juce::MidiBuffer&)
{
    juce::ScopedNoDenormals noDenormals;
    const auto channels = buffer.getNumChannels(), samples = buffer.getNumSamples();
    mainGain.setTargetValue (juce::Decibels::decibelsToGain (parameters.getRawParameterValue (mainOutputGainId)->load()));
    for (int sample = 0; sample < samples; ++sample)
    {
        const auto gain = mainGain.getNextValue();
        for (int channel = 0; channel < channels; ++channel) buffer.setSample (channel, sample, buffer.getSample (channel, sample) * gain);
    }
    if (stopRequested.exchange (false))
    {
        for (auto& voice : voices) voice.active = false;
        for (auto& item : scheduled) item.active = false;
    }
    for (;;)
    {
        int start1, size1, start2, size2;
        commandFifo.prepareToRead (1, start1, size1, start2, size2);
        if (size1 == 0) break;
        const auto command = commandQueue[static_cast<size_t> (start1)];
        if (command.generation == noteGeneration.load())
            if (auto slot = std::find_if (scheduled.begin(), scheduled.end(), [] (const Scheduled& item) { return ! item.active; }); slot != scheduled.end()) *slot = { true, command };
        commandFifo.finishedRead (1);
    }
    const auto synthGain = 0.18f * juce::Decibels::decibelsToGain (parameters.getRawParameterValue (notesOutputGainId)->load());
    const auto attack = juce::jmax (1, juce::roundToInt (0.01 * currentSampleRate.load()));
    const auto release = juce::jmax (1, juce::roundToInt (0.08 * currentSampleRate.load()));
    for (int sample = 0; sample < samples; ++sample)
    {
        for (auto& item : scheduled) if (item.active && --item.command.delaySamples <= 0) { startVoice (item.command); item.active = false; }
        float mixed = 0.0f;
        for (auto& voice : voices)
        {
            if (! voice.active) continue;
            const auto envelope = voice.age < attack ? static_cast<float> (voice.age) / attack : voice.age > voice.duration - release ? static_cast<float> (voice.duration - voice.age) / release : 1.0f;
            mixed += static_cast<float> (std::sin (voice.phase)) * juce::jlimit (0.0f, 1.0f, envelope) * synthGain;
            voice.phase += voice.increment;
            if (++voice.age >= voice.duration) voice.active = false;
        }
        for (int channel = 0; channel < channels; ++channel) buffer.addSample (channel, sample, mixed);
    }
}

void OndeEQueEuToAudioProcessor::getStateInformation (juce::MemoryBlock& destination)
{
    if (auto xml = parameters.copyState().createXml()) copyXmlToBinary (*xml, destination);
}

void OndeEQueEuToAudioProcessor::setStateInformation (const void* data, int size)
{
    if (auto xml = getXmlFromBinary (data, size); xml != nullptr)
        if (xml->hasTagName (parameters.state.getType())) parameters.replaceState (juce::ValueTree::fromXml (*xml));
}

juce::AudioProcessorEditor* OndeEQueEuToAudioProcessor::createEditor() { return new OndeEQueEuToAudioProcessorEditor (*this); }
juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter() { return new OndeEQueEuToAudioProcessor(); }
