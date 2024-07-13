/*
  ==============================================================================

    This file contains the basic framework code for a JUCE plugin editor.

  ==============================================================================
*/

#pragma once

#include <JuceHeader.h>
#include "PluginProcessor.h"

//==============================================================================
/**
*/
class JUCE8EqualizerExampleAudioProcessorEditor  : public juce::AudioProcessorEditor
{
public:
    JUCE8EqualizerExampleAudioProcessorEditor (JUCE8EqualizerExampleAudioProcessor&);
    ~JUCE8EqualizerExampleAudioProcessorEditor() override;

    //==============================================================================
    void paint (juce::Graphics&) override;
    void resized() override;

private:
    WebBrowserComponent::Options createWebOptions();
    std::optional<juce::WebBrowserComponent::Resource> getResource(const juce::String& url);

    JUCE8EqualizerExampleAudioProcessor& audioProcessor;
    std::optional<WebBrowserComponent> webBrowserComponent;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (JUCE8EqualizerExampleAudioProcessorEditor)
};
