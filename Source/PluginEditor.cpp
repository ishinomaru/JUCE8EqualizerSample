/*
  ==============================================================================

	This file contains the basic framework code for a JUCE plugin editor.

  ==============================================================================
*/

#include "PluginProcessor.h"
#include "PluginEditor.h"

#ifndef USE_LOCAL_HOST
#define USE_LOCAL_HOST 1
#endif

namespace {
	const String localUrlAddress("http://localhost:3000/");
}

//==============================================================================
JUCE8EqualizerExampleAudioProcessorEditor::JUCE8EqualizerExampleAudioProcessorEditor(JUCE8EqualizerExampleAudioProcessor& p)
	: AudioProcessorEditor(&p), audioProcessor(p)
{
	webBrowserComponent.emplace(createWebOptions());
	addAndMakeVisible(webBrowserComponent.value());

#if USE_LOCAL_HOST
	webBrowserComponent->goToURL(localUrlAddress);
#else
	webBrowserComponent->goToURL(juce::WebBrowserComponent::getResourceProviderRoot());
#endif


	setSize(800, 600);
	setResizable(true, false);
}

JUCE8EqualizerExampleAudioProcessorEditor::~JUCE8EqualizerExampleAudioProcessorEditor()
{
}

void JUCE8EqualizerExampleAudioProcessorEditor::paint(juce::Graphics&)
{
}

void JUCE8EqualizerExampleAudioProcessorEditor::resized()
{
	if (webBrowserComponent != nullopt) {
		webBrowserComponent->setBounds(getLocalBounds());
	}
}

WebBrowserComponent::Options JUCE8EqualizerExampleAudioProcessorEditor::createWebOptions()
{
	auto options = juce::WebBrowserComponent::Options{}
#if JUCE_WINDOWS
		.withBackend(juce::WebBrowserComponent::Options::Backend::webview2)
		.withWinWebView2Options(juce::WebBrowserComponent::Options::WinWebView2{}
			.withUserDataFolder(File::getSpecialLocation(File::SpecialLocationType::tempDirectory)))
#endif
		.withNativeIntegrationEnabled()
		.withResourceProvider([this](const juce::String& url) { return getResource(url); }, juce::URL{ localUrlAddress }.getOrigin());
	return options;
}

std::optional<juce::WebBrowserComponent::Resource> JUCE8EqualizerExampleAudioProcessorEditor::getResource(const juce::String& url)
{
	return std::nullopt;
}

static const std::unordered_map<String, const char*> mimeMap =
{
	{ { "htm"   },  "text/html"                },
	{ { "html"  },  "text/html"                },
	{ { "txt"   },  "text/plain"               },
	{ { "jpg"   },  "image/jpeg"               },
	{ { "jpeg"  },  "image/jpeg"               },
	{ { "svg"   },  "image/svg+xml"            },
	{ { "ico"   },  "image/vnd.microsoft.icon" },
	{ { "json"  },  "application/json"         },
	{ { "png"   },  "image/png"                },
	{ { "css"   },  "text/css"                 },
	{ { "map"   },  "application/json"         },
	{ { "js"    },  "text/javascript"          },
	{ { "woff2" },  "font/woff2"               }
};
