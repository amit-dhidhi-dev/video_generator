import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Type, 
  Hash, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Scissors,
  Clock,
  FileText,
  Copy,
  Check,
  AlertCircle,
  Zap,
  RefreshCw,
  Maximize2
} from 'lucide-react';

const StoryInput = ({ story, setStory }) => {
  // const [showPreview, setShowPreview] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [paragraphCount, setParagraphCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('write');
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');

  // Calculate stats whenever story changes
  useEffect(() => {
    if (!story) {
      setWordCount(0);
      setParagraphCount(0);
      setCharCount(0);
      setEstimatedTime(0);
      return;
    }

    // Character count
    const chars = story.length;
    setCharCount(chars);

    // Word count (excluding whitespace)
    const words = story.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);

    // Paragraph count (split by double newlines)
    const paragraphs = story.split('\n\n').filter(p => p.trim());
    setParagraphCount(paragraphs.length);

    // Estimated video time (5 seconds per slide + 2 seconds buffer)
    const time = paragraphs.length * 7;
    setEstimatedTime(time);

    // Auto-save simulation
    if (story.length > 0) {
      setAutoSaveStatus('saving...');
      const timer = setTimeout(() => {
        setAutoSaveStatus('saved');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [story]);

  const handleStoryChange = (e) => {
    const text = e.target.value;
    setStory(text);
  };

  const autoFormatText = () => {
    if (!story.trim()) return;

    let formatted = story
      .replace(/([.!?])\s*(?=[a-z])/g, '$1 ') // Add space after sentences
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\n\s*\n/g, '\n\n') // Normalize paragraph breaks
      .trim();
    
    // Capitalize first letter of each sentence
    formatted = formatted.replace(/(^\w|\.\s+\w|!\s+\w|\?\s+\w)/g, match => match.toUpperCase());
    
    // Ensure proper paragraph formatting
    formatted = formatted.split('\n\n')
      .map(para => para.trim())
      .filter(para => para.length > 0)
      .join('\n\n');
    
    setStory(formatted);
  };

  const splitIntoSlides = () => {
    if (!story.trim()) return;

    // Split by sentences for better slide distribution
    const sentences = story.match(/[^.!?]+[.!?]+/g) || [story];
    
    // Group sentences into slides (2-3 sentences per slide)
    const slides = [];
    let currentSlide = [];
    
    sentences.forEach((sentence, index) => {
      currentSlide.push(sentence.trim());
      
      if (currentSlide.length === 2 || index === sentences.length - 1) {
        slides.push(currentSlide.join(' '));
        currentSlide = [];
      }
    });
    
    const formatted = slides.join('\n\n--- SLIDE BREAK ---\n\n');
    setStory(formatted);
  };

  const sampleStories = [
    {
      title: "Inspirational",
      content: "The journey of a thousand miles begins with a single step. Every great achievement starts with a simple decision to begin. Embrace the adventure that lies ahead, for it is in the journey that we discover our true strength."
    },
    {
      title: "Reflective",
      content: "In the quiet moments, we find our true selves. Silence speaks volumes to those who listen. The whispers of your heart hold the answers you've been seeking all along."
    },
    {
      title: "Technology",
      content: "Technology connects us across vast distances, creating bridges where there were once divides. Innovation drives humanity forward, transforming the impossible into reality one breakthrough at a time."
    },
    {
      title: "Nature",
      content: "Beneath the canopy of ancient trees, time moves differently. The forest teaches patience, resilience, and the beauty of growth. Each leaf tells a story of seasons passed and those yet to come."
    }
  ];

  const insertSample = (content) => {
    setStory(prev => prev ? `${prev}\n\n${content}` : content);
  };

  const clearText = () => {
    setStory('');
    setAutoSaveStatus('cleared');
    setTimeout(() => setAutoSaveStatus('saved'), 1500);
  };

  const copyToClipboard = async () => {
    if (!story.trim()) return;
    
    try {
      await navigator.clipboard.writeText(story);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const maximizeTextarea = () => {
    const textarea = document.querySelector('.story-textarea');
    if (textarea) {
      if (textarea.style.height === '400px') {
        textarea.style.height = '200px';
      } else {
        textarea.style.height = '400px';
      }
    }
  };

  const formatTips = [
    "Use double line breaks (Enter twice) to create new slides",
    "Keep slides under 3 sentences for better readability",
    "Use punctuation to help with automatic formatting",
    "Preview slides regularly to check timing",
    "Each slide will show for about 7 seconds in the video"
  ];

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
            <BookOpen className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Story Content</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Auto-save:</span>
              <span className={`text-xs ${autoSaveStatus === 'saved' ? 'text-green-400' : 'text-yellow-400'}`}>
                {autoSaveStatus}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Tab Navigation */}
          <div className="flex bg-gray-800/50 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('write')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'write' 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                : 'text-gray-400 hover:text-white'}`}
            >
              Write
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'preview' 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                : 'text-gray-400 hover:text-white'}`}
            >
              Preview
            </button>
          </div>
          
          <button
            onClick={clearText}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Clear all text"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-gray-800/30 rounded-xl p-3">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Type className="h-3 w-3" />
            Words
          </div>
          <div className="text-xl font-bold text-white">{wordCount.toLocaleString()}</div>
        </div>
        <div className="bg-gray-800/30 rounded-xl p-3">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Hash className="h-3 w-3" />
            Slides
          </div>
          <div className="text-xl font-bold text-white">{paragraphCount}</div>
        </div>
        <div className="bg-gray-800/30 rounded-xl p-3">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <FileText className="h-3 w-3" />
            Characters
          </div>
          <div className="text-xl font-bold text-white">{charCount.toLocaleString()}</div>
        </div>
        <div className="bg-gray-800/30 rounded-xl p-3">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Clock className="h-3 w-3" />
            Est. Time
          </div>
          <div className="text-xl font-bold text-white">
            {estimatedTime > 60 
              ? `${Math.floor(estimatedTime / 60)}:${(estimatedTime % 60).toString().padStart(2, '0')}`
              : `${estimatedTime}s`
            }
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'write' ? (
        <div className="flex-1 flex flex-col">
          <div className="relative flex-1 mb-4">
            <textarea
              value={story}
              onChange={handleStoryChange}
              placeholder={`Write your story here... Each paragraph becomes a slide.

Example structure:
This is your first slide. It will display for about 7 seconds.

This is your second slide with more content. Keep it engaging!

For best results:
• Use double line breaks between slides
• Keep each slide concise
• End sentences with proper punctuation`}
              className="story-textarea w-full h-full min-h-[200px] bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              rows={8}
            />
            
            {/* Textarea Controls */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button
                onClick={maximizeTextarea}
                className="p-1.5 bg-gray-800/80 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                title="Toggle full height"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              <button
                onClick={copyToClipboard}
                className="p-1.5 bg-gray-800/80 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                title={copied ? "Copied!" : "Copy to clipboard"}
              >
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <button
              onClick={autoFormatText}
              className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl text-white font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4" />
              Auto Format Text
            </button>
            <button
              onClick={splitIntoSlides}
              className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Scissors className="h-4 w-4" />
              Split into Slides
            </button>
          </div>
        </div>
      ) : (
        /* Preview Tab */
        <div className="flex-1 mb-4">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 h-full overflow-y-auto">
            {story ? (
              <div className="space-y-4">
                {story.split('\n\n').filter(p => p.trim()).map((paragraph, index) => (
                  <div 
                    key={index} 
                    className="relative bg-gray-800/30 rounded-xl p-4 border border-gray-700/50 hover:border-purple-500/30 transition-colors group"
                  >
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {index + 1}
                    </div>
                    <div className="text-sm text-blue-400 mb-2 font-medium">
                      Slide {index + 1} • ~7 seconds
                    </div>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {paragraph.replace('--- SLIDE BREAK ---', '').trim()}
                    </p>
                    <div className="mt-3 pt-3 border-t border-gray-700/50 text-xs text-gray-500">
                      {paragraph.split(' ').length} words • {paragraph.length} characters
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <AlertCircle className="h-12 w-12 text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No content to preview</h3>
                <p className="text-gray-500 text-sm">Start writing in the Write tab to see your slides here</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Samples & Tips */}
      <div className="mt-4 pt-4 border-t border-gray-800/50">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Quick Samples */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-3">
              <Zap className="h-4 w-4 text-yellow-400" />
              Quick Samples
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {sampleStories.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => insertSample(sample.content)}
                  className="text-left p-3 bg-gray-800/30 rounded-lg hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 transition-all group"
                >
                  <div className="text-sm font-medium text-gray-300 group-hover:text-white mb-1">
                    {sample.title}
                  </div>
                  <div className="text-xs text-gray-500 line-clamp-2">
                    {sample.content}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Formatting Tips */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-3">
              <Sparkles className="h-4 w-4 text-blue-400" />
              Formatting Tips
            </h3>
            <div className="space-y-2">
              {formatTips.map((tip, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-gray-800/20 rounded-lg">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span className="text-xs text-gray-400">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryInput;





