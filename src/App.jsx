import React, { useState, useEffect } from 'react';
import ImageUpload from './components/ImageUpload';
import StoryInput from './components/StoryInput';
import VoiceUpload from './components/VoiceUpload';
import ControlsPanel from './components/ControlsPanel';
import PreviewPanel from './components/PreviewPanel';
import VideoGenerator from './components/VideoGenerator';
import { Video, Palette, Sliders, Upload, Download, Settings, Eye, Sparkles, Menu, X } from 'lucide-react';
import AudioTimeCalculator from './components/AudioTime';
import WordTimingAnalyzer from './components/AudioTime';


function App() {
  const [image, setImage] = useState(null);
  const [story, setStory] = useState('');
  const [voice, setVoice] = useState(null);
  const [slides, setSlides] = useState([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [controls, setControls] = useState({
    blurAmount: 15,
    textColor: '#ffffff',
    fontSize: 36,
    fontFamily: 'Inter',
    slideDuration: 5,
    brightness: 100,
    contrast: 100,
    textPosition: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    transition: 'fade'
  });

  // Generate preview slides when inputs change
  useEffect(() => {
    if (image && story) {
      generatePreviewSlides();     
    }
  }, [image, story, controls]);

  const generatePreviewSlides = () => {
    const paragraphs = story.split('\n\n').filter(p => p.trim());
    const newSlides = paragraphs.map((paragraph, index) => ({
      id: index,
      text: paragraph,
      image: image,
      duration: controls.slideDuration
    }));
    setSlides(newSlides);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">    
    {/* <WordTimingAnalyzer /> */}
      {/* Header - Fixed width with proper container */}
      <header className="sticky top-0 z-50 border-b border-gray-800/50 bg-gray-900/95 backdrop-blur-xl">
        <div className="w-full px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Video className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  VideoGen Pro
                </h1>
                <p className="hidden sm:block text-xs text-gray-400">Create stunning videos</p>
              </div>
            </div>

            {/* Desktop Navigation - Compact */}
            <nav className="hidden md:flex items-center gap-1">
              {[
                { id: 'upload', label: 'Upload', icon: Upload },
                { id: 'customize', label: 'Customize', icon: Palette },
                { id: 'preview', label: 'Preview', icon: Eye },
                { id: 'generate', label: 'Generate', icon: Sparkles }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white text-sm font-medium">
                <Download className="h-4 w-4" />
                Export
              </button>
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-3 pb-2">
              <div className="grid grid-cols-4 gap-1">
                {[
                  { id: 'upload', label: 'Upload', icon: Upload },
                  { id: 'customize', label: 'Customize', icon: Palette },
                  { id: 'preview', label: 'Preview', icon: Eye },
                  { id: 'generate', label: 'Generate', icon: Sparkles }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg ${activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white'
                        : 'bg-gray-800 text-gray-400'
                      }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="text-xs">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content - Full width with proper spacing */}
      <main className="w-full px-3 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 max-w-[1920px] mx-auto">
          {/* Left Column - Takes 2/3 on desktop */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Input Cards Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {/* Image Upload Card */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg">
                    <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-white">Background Image</h2>
                </div>
                <ImageUpload image={image} setImage={setImage} />
              </div>

              {/* Story Input Card */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 sm:p-2 bg-purple-500/10 rounded-lg">
                    <Palette className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-white">Story Content</h2>
                </div>
                <StoryInput story={story} setStory={setStory} />
              </div>

              {/* Voice Upload Card - Full width on mobile, 2 cols on desktop */}
              <div className="xl:col-span-2 bg-gray-900/50 border border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 sm:p-2 bg-pink-500/10 rounded-lg">
                    <Sliders className="h-4 w-4 sm:h-5 sm:w-5 text-pink-400" />
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-white">Voiceover</h2>
                </div>
                <VoiceUpload voice={voice} setVoice={setVoice} />
              </div>
            </div>

            {/* Preview Panel - Full width */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 sm:p-2 bg-green-500/10 rounded-lg">
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-white">Live Preview</h2>
                </div>
                <div className="text-xs sm:text-sm text-gray-400">
                  {slides.length} slide{slides.length !== 1 ? 's' : ''} • Auto-refresh
                </div>
              </div>
              <PreviewPanel
                slides={slides}
                controls={controls}
                image={image}
                story={story}
              />
            </div>
          </div>

          {/* Right Column - Takes 1/3 on desktop, full width on mobile */}
          <div className="space-y-4 sm:space-y-6">
            {/* Controls Panel */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 sm:p-2 bg-amber-500/10 rounded-lg">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-white">Controls</h2>
              </div>
              <ControlsPanel controls={controls} setControls={setControls} />
            </div>

            {/* Video Generator - Compact design */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-900/90 to-gray-900 border border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-white">Generate Video</h2>
              </div>
              <VideoGenerator
                slides={slides}
                voice={voice}
                controls={controls}
                image={image}
                story={story}
              />
              
              {/* Quick Actions - Compact */}
              <div className="mt-4 pt-4 border-t border-gray-800/50">
                <h3 className="text-xs sm:text-sm font-medium text-gray-400 mb-2">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-2 sm:p-2.5 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-xs sm:text-sm text-gray-300 transition-colors">
                    Save Preset
                  </button>
                  <button className="p-2 sm:p-2.5 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-xs sm:text-sm text-gray-300 transition-colors">
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Stats Footer - Compact */}
      <footer className="mt-8 border-t border-gray-800/30 bg-gray-900/50">
        <div className="w-full px-3 sm:px-4 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: "100%", label: "Client-side", color: "blue", icon: "🔒" },
              { value: "No Limits", label: "Free", color: "purple", icon: "⚡" },
              { value: "4K Ready", label: "Quality", color: "green", icon: "🎬" },
              { value: "Secure", label: "Data Local", color: "pink", icon: "🛡️" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-800/50 mb-2">
                  <span className="text-base sm:text-lg">{stat.icon}</span>
                </div>
                <div className={`text-lg sm:text-xl font-bold text-${stat.color}-400 mb-1`}>
                  {stat.value}
                </div>
                <div className="text-gray-400 text-xs sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-800/30 text-center">
            <p className="text-gray-500 text-xs sm:text-sm">
              Made with ❤️ • All processing in browser
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Action Button for Mobile */}
      <button className="fixed bottom-4 right-4 md:hidden z-40 p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-xl">
        <Download className="h-5 w-5" />
      </button>
    </div>
  );
}

export default App;

