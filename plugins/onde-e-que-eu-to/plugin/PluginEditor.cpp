#include "PluginEditor.h"
#include "BinaryData.h"

namespace
{
juce::String mimeFor (const juce::String& path)
{
    if (path.endsWithIgnoreCase (".html")) return "text/html";
    if (path.endsWithIgnoreCase (".css")) return "text/css";
    if (path.endsWithIgnoreCase (".js")) return "text/javascript";
    if (path.endsWithIgnoreCase (".svg")) return "image/svg+xml";
    if (path.endsWithIgnoreCase (".woff2")) return "font/woff2";
    if (path.endsWithIgnoreCase (".woff")) return "font/woff";
    return "application/octet-stream";
}
}

OndeEQueEuToAudioProcessorEditor::OndeEQueEuToAudioProcessorEditor (OndeEQueEuToAudioProcessor& owner)
    : AudioProcessorEditor (owner), processor (owner), browser (makeBrowserOptions())
{
    addAndMakeVisible (browser);
    setResizable (true, true);
    setResizeLimits (1000, 640, 1920, 1080);
    setSize (1600, 900);
#if JOJO_USE_VITE_DEV_SERVER
    browser.goToURL ("http://localhost:5173");
#else
    browser.goToURL (juce::WebBrowserComponent::getResourceProviderRoot());
#endif
    startTimerHz (20);
}

juce::WebBrowserComponent::Options OndeEQueEuToAudioProcessorEditor::makeBrowserOptions()
{
    auto options = juce::WebBrowserComponent::Options{}
        .withNativeIntegrationEnabled()
        .withInitialisationData (OndeEQueEuToAudioProcessor::notesOutputGainId, processor.parameters.getRawParameterValue (OndeEQueEuToAudioProcessor::notesOutputGainId)->load())
        .withInitialisationData (OndeEQueEuToAudioProcessor::mainOutputGainId, processor.parameters.getRawParameterValue (OndeEQueEuToAudioProcessor::mainOutputGainId)->load())
        .withEventListener ("setParameter", [this] (const juce::var& payload) { setParameterFromWeb (payload); })
        .withEventListener ("playNote", [this] (const juce::var& payload)
        {
            if (auto* object = payload.getDynamicObject()) processor.triggerNote (static_cast<int> (object->getProperty ("midi")), static_cast<float> (object->getProperty ("duration")));
        })
        .withEventListener ("playScale", [this] (const juce::var& payload)
        {
            if (auto* object = payload.getDynamicObject()) if (auto* notes = object->getProperty ("midis").getArray()) processor.triggerScale (*notes);
        })
        .withEventListener ("stopNotes", [this] (const juce::var&) { processor.stopReferenceNotes(); })
        .withEventListener ("openExternalUrl", [] (const juce::var& payload)
        {
            if (auto* object = payload.getDynamicObject()) juce::URL (object->getProperty ("url").toString()).launchInDefaultBrowser();
        });
#if ! JOJO_USE_VITE_DEV_SERVER
    options = options.withResourceProvider ([this] (const juce::String& url) { return getResource (url); });
#endif
    return options;
}

void OndeEQueEuToAudioProcessorEditor::setParameterFromWeb (const juce::var& payload)
{
    auto* object = payload.getDynamicObject();
    if (object == nullptr) return;
    auto* parameter = processor.parameters.getParameter (object->getProperty ("id").toString());
    if (parameter == nullptr) return;
    const auto value = static_cast<float> (object->getProperty ("value"));
    parameter->beginChangeGesture();
    parameter->setValueNotifyingHost (parameter->convertTo0to1 (value));
    parameter->endChangeGesture();
}

std::optional<OndeEQueEuToAudioProcessorEditor::Resource> OndeEQueEuToAudioProcessorEditor::getResource (const juce::String& requestedUrl) const
{
    auto path = requestedUrl.upToFirstOccurrenceOf ("?", false, false);
    if (path.isEmpty() || path == "/") path = "index.html";
    path = path.trimCharactersAtStart ("/");
    const auto filename = juce::File (path).getFileName();
    for (int index = 0; index < BinaryData::namedResourceListSize; ++index)
        if (filename == BinaryData::originalFilenames[index])
        {
            int size = 0;
            if (const auto* data = BinaryData::getNamedResource (BinaryData::namedResourceList[index], size))
            {
                const auto* begin = reinterpret_cast<const std::byte*> (data);
                return Resource { std::vector<std::byte> (begin, begin + size), mimeFor (filename) };
            }
        }
    return std::nullopt;
}

void OndeEQueEuToAudioProcessorEditor::timerCallback()
{
    const auto notes = processor.parameters.getRawParameterValue (OndeEQueEuToAudioProcessor::notesOutputGainId)->load();
    const auto output = processor.parameters.getRawParameterValue (OndeEQueEuToAudioProcessor::mainOutputGainId)->load();
    const auto emit = [this] (const char* id, float value)
    {
        auto* object = new juce::DynamicObject();
        object->setProperty ("id", id);
        object->setProperty ("value", value);
        browser.emitEventIfBrowserIsVisible ("parameterChanged", juce::var (object));
    };
    if (notes != lastNotesGain) { lastNotesGain = notes; emit (OndeEQueEuToAudioProcessor::notesOutputGainId, notes); }
    if (output != lastMainGain) { lastMainGain = output; emit (OndeEQueEuToAudioProcessor::mainOutputGainId, output); }
}

void OndeEQueEuToAudioProcessorEditor::resized() { browser.setBounds (getLocalBounds()); }
