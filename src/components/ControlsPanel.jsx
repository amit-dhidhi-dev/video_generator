import React, { useState, useEffect } from 'react';
import {
  Settings,
  Type,
  Palette,
  Timer,
  Contrast,
  Sun,
  Droplets,
  Layers,
  Zap,
  Copy,
  Check,
  Grid,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RefreshCw,
  Save,
  Maximize2,
  Minimize2,
  Binary
} from 'lucide-react';

const ControlsPanel = ({ controls, setControls }) => {
  const [copied, setCopied] = useState(false);
  const [activePreset, setActivePreset] = useState('custom');
  const [isExpanded, setIsExpanded] = useState(false);

  // Default controls agar nahi hain to set karein
  useEffect(() => {
    if (!controls.backgroundColor) {
      setControls(prev => ({
        ...prev,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        opacity: 40,
        padding: 20,
        transition: 'fade'
      }));
    }
  }, [controls, setControls]);

  const handleChange = (key, value) => {
    console.log(`Changing ${key} to:`, value); // Debug log
    setControls(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNumberInput = (key, value) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      const minMax = getMinMax(key);
      const clampedValue = Math.min(Math.max(numValue, minMax.min), minMax.max);
      handleChange(key, clampedValue);
    }
  };

  const getMinMax = (key) => {
    const ranges = {
      blurAmount: { min: 0, max: 50, step: 1 },
      fontSize: { min: 12, max: 72, step: 1 },
      slideDuration: { min: 1, max: 15, step: 0.5 },
      brightness: { min: 0, max: 200, step: 1 },
      contrast: { min: 0, max: 200, step: 1 },
      opacity: { min: 0, max: 100, step: 1 },
      padding: { min: 0, max: 100, step: 5 }
    };
    return ranges[key] || { min: 0, max: 100, step: 1 };
  };

  const presets = [
    {
      id: 'cinematic',
      name: 'Cinematic',
      icon: '🎬',
      settings: {
        textColor: '#ffffff',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        blurAmount: 25,
        fontSize: 42,
        fontFamily: 'Inter',
        brightness: 90,
        contrast: 110,
        textPosition: 'center',
        opacity: 70
      }
    },
    {
      id: 'modern',
      name: 'Modern',
      icon: '✨',
      settings: {
        textColor: '#f8fafc',
        backgroundColor: 'rgba(30, 41, 59, 0.6)',
        blurAmount: 15,
        fontSize: 36,
        fontFamily: 'Segoe UI',
        brightness: 100,
        contrast: 100,
        textPosition: 'center',
        opacity: 60
      }
    },
    {
      id: 'minimal',
      name: 'Minimal',
      icon: '◻️',
      settings: {
        textColor: '#1e293b',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        blurAmount: 5,
        fontSize: 32,
        fontFamily: 'Helvetica',
        brightness: 120,
        contrast: 90,
        textPosition: 'bottom-center',
        opacity: 90
      }
    },
    {
      id: 'dark',
      name: 'Dark Mode',
      icon: '🌙',
      settings: {
        textColor: '#e2e8f0',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        blurAmount: 20,
        fontSize: 38,
        fontFamily: 'SF Pro',
        brightness: 80,
        contrast: 120,
        textPosition: 'center',
        opacity: 80
      }
    }
  ];

  const fontFamilies = [
    { name: 'Inter', category: 'Modern', family: "'Inter', sans-serif" },
    { name: 'SF Pro', category: 'Apple', family: "-apple-system, BlinkMacSystemFont, 'Segoe UI'" },
    { name: 'Segoe UI', category: 'Microsoft', family: "'Segoe UI', Tahoma, Geneva" },
    { name: 'Roboto', category: 'Google', family: "'Roboto', sans-serif" },
    { name: 'Helvetica', category: 'Classic', family: "Helvetica, Arial, sans-serif" },
    { name: 'Georgia', category: 'Serif', family: "Georgia, 'Times New Roman', serif" },
    { name: 'Courier New', category: 'Monospace', family: "'Courier New', monospace" },
    { name: 'Arial', category: 'Web Safe', family: "Arial, sans-serif" }
  ];

  const textPositions = [
    { value: 'top-left', label: 'TL', fullLabel: 'Top Left', icon: <Grid className="h-4 w-4" /> },
    { value: 'top-center', label: 'TC', fullLabel: 'Top Center', icon: <AlignCenter className="h-4 w-4" /> },
    { value: 'top-right', label: 'TR', fullLabel: 'Top Right', icon: <Grid className="h-4 w-4" /> },
    { value: 'center-left', label: 'CL', fullLabel: 'Center Left', icon: <AlignLeft className="h-4 w-4" /> },
    { value: 'center', label: 'C', fullLabel: 'Center', icon: <AlignCenter className="h-4 w-4" /> },
    { value: 'center-right', label: 'CR', fullLabel: 'Center Right', icon: <AlignRight className="h-4 w-4" /> },
    { value: 'bottom-left', label: 'BL', fullLabel: 'Bottom Left', icon: <Grid className="h-4 w-4" /> },
    { value: 'bottom-center', label: 'BC', fullLabel: 'Bottom Center', icon: <AlignCenter className="h-4 w-4" /> },
    { value: 'bottom-right', label: 'BR', fullLabel: 'Bottom Right', icon: <Grid className="h-4 w-4" /> }
  ];

  const applyPreset = (preset) => {
    console.log('Applying preset:', preset.id, preset.settings);
    setControls(prev => ({
      ...prev,
      ...preset.settings
    }));
    setActivePreset(preset.id);
  };

  const copySettings = async () => {
    const settingsString = JSON.stringify(controls, null, 2);
    try {
      await navigator.clipboard.writeText(settingsString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy settings: ', err);
    }
  };

  const resetToDefaults = () => {
    const defaults = {
      blurAmount: 15,
      textColor: '#ffffff',
      fontSize: 36,
      fontFamily: 'Inter',
      slideDuration: 5,
      brightness: 100,
      contrast: 100,
      textPosition: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      opacity: 40,
      padding: 20,
      transition: 'fade'
    };
    console.log('Resetting to defaults:', defaults);
    setControls(defaults);
    setActivePreset('custom');
  };

  const savePreset = () => {
    const presetName = prompt('Enter preset name:');
    if (presetName) {
      // In a real app, save to localStorage or backend
      localStorage.setItem(`preset_${presetName}`, JSON.stringify(controls));
      alert(`Preset "${presetName}" saved!`);
    }
  };

  // Color conversion helpers
  const hexToRgba = (hex, opacity) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  };

  const rgbaToHex = (rgba) => {
    if (rgba.startsWith('#')) return rgba;

    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    return '#ffffff';
  };

  return (
    <div className={`bg-gray-900/50 border border-gray-800 rounded-2xl p-4 sm:p-5 ${isExpanded ? 'lg:col-span-2' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg">
            <Settings className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-white">Visual Controls</h2>
            <p className="text-xs text-gray-400">Real-time customization</p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title={isExpanded ? "Minimize" : "Expand"}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={resetToDefaults}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Reset to defaults"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={copySettings}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title={copied ? "Copied!" : "Copy settings"}
          >
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Quick Presets - Always visible */}
      <div className="mb-4 sm:mb-6">
        <h3 className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-400 mb-2 sm:mb-3">
          <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
          Quick Presets
        </h3>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {presets.map(preset => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border flex items-center gap-1 sm:gap-2 transition-all ${activePreset === preset.id
                ? 'border-amber-500 bg-gradient-to-r from-amber-500/10 to-orange-500/10'
                : 'border-gray-700 bg-gray-800/30 hover:bg-gray-800/50'
                }`}
            >
              <span className="text-sm sm:text-base">{preset.icon}</span>
              <span className={`text-xs sm:text-sm font-medium ${activePreset === preset.id ? 'text-white' : 'text-gray-300'}`}>
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Controls Grid - Responsive layout */}
      <div className={`space-y-4 sm:space-y-6 ${isExpanded ? 'lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0' : ''}`}>

        {/* Background Controls */}
        <div className="space-y-4 sm:space-y-6">
          {/* Background Blur */}
          <div className="bg-gray-800/30 rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-400" />
                <label className="text-xs sm:text-sm font-medium text-gray-300">Background Blur</label>
              </div>
              <span className="text-xs sm:text-sm font-bold text-white px-2 py-1 bg-gray-800 rounded">
                {controls.blurAmount || 15}px
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={controls.blurAmount || 15}
              onChange={(e) => handleChange('blurAmount', parseInt(e.target.value))}
              className="w-full h-1.5 sm:h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-amber-400 [&::-webkit-slider-thumb]:to-orange-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-800"
            />
            <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 mt-1">
              <span>None</span>
              <span>Heavy</span>
            </div>
          </div>

          {/* Text Color */}
          <div className="bg-gray-800/30 rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Palette className="h-4 w-4 text-purple-400" />
              <label className="text-xs sm:text-sm font-medium text-gray-300">Text Color</label>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <input
                type="color"
                value={rgbaToHex(controls.textColor || '#ffffff')}
                onChange={(e) => handleChange('textColor', e.target.value)}
                className="w-8 h-8 sm:w-10 sm:h-10 cursor-pointer rounded-lg border border-gray-700 bg-transparent"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={rgbaToHex(controls.textColor || '#ffffff')}
                  onChange={(e) => handleChange('textColor', e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-xs sm:text-sm"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>
          </div>

          {/* Background Opacity */}
          <div className="bg-gray-800/30 rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <label className="text-xs sm:text-sm font-medium text-gray-300">Text Background Opacity</label>
              <span className="text-xs sm:text-sm font-bold text-white px-2 py-1 bg-gray-800 rounded">
                {controls.opacity || 40}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={controls.opacity || 40}
              onChange={(e) => handleChange('opacity', parseInt(e.target.value))}
              className="w-full h-1.5 sm:h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-amber-400 [&::-webkit-slider-thumb]:to-orange-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-800"
            />
            <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 mt-1">
              <span>Clear</span>
              <span>Solid</span>
            </div>
          </div>
        </div>

        {/* Typography Controls */}
        <div className="space-y-4 sm:space-y-6">
          {/* Font Size */}
          <div className="bg-gray-800/30 rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4 text-green-400" />
                <label className="text-xs sm:text-sm font-medium text-gray-300">Font Size</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="12"
                  max="72"
                  value={controls.fontSize || 36}
                  onChange={(e) => handleNumberInput('fontSize', e.target.value)}
                  className="w-12 sm:w-16 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs sm:text-sm text-center"
                />
                <span className="text-xs text-gray-400">px</span>
              </div>
            </div>
            <input
              type="range"
              min="12"
              max="72"
              value={controls.fontSize || 36}
              onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
              className="w-full h-1.5 sm:h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-amber-400 [&::-webkit-slider-thumb]:to-orange-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-800"
            />
            <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 mt-1">
              <span>Small</span>
              <span>Large</span>
            </div>
          </div>

          {/* Font Family */}
          <div className="bg-gray-800/30 rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Layers className="h-4 w-4 text-pink-400" />
              <label className="text-xs sm:text-sm font-medium text-gray-300">Font Family</label>
            </div>
            <select
              value={controls.fontFamily || 'Inter'}
              onChange={(e) => handleChange('fontFamily', e.target.value)}
              className="w-full px-2 sm:px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500/50"
            >
              {fontFamilies.map(font => (
                <option key={font.name} value={font.name} className="bg-gray-900">
                  {font.name} ({font.category})
                </option>
              ))}
            </select>
          </div>

          {/* Slide Duration */}
          {/* <div className="bg-gray-800/30 rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-red-400" />
                <label className="text-xs sm:text-sm font-medium text-gray-300">Slide Duration</label>
              </div>
              <span className="text-xs sm:text-sm font-bold text-white px-2 py-1 bg-gray-800 rounded">
                {controls.slideDuration || 5}s
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="0.5"
              value={controls.slideDuration || 5}
              onChange={(e) => handleChange('slideDuration', parseFloat(e.target.value))}
              className="w-full h-1.5 sm:h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-amber-400 [&::-webkit-slider-thumb]:to-orange-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-800"
            />
            <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 mt-1">
              <span>1s</span>
              <span>15s</span>
            </div>
          </div> */}

          {/* Word Per Slide  */}
          <div className="bg-gray-800/30 rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-2">
                <Binary className="h-4 w-4 text-red-400" />
                <label className="text-xs sm:text-sm font-medium text-gray-300">Word Per Slide </label>
              </div>
              <span className="text-xs sm:text-sm font-bold text-white px-2 py-1 bg-gray-800 rounded">
                {controls.wordPerSlide || 20} words
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={controls.wordPerSlide || 20}
              onChange={(e) => handleChange('wordPerSlide', parseFloat(e.target.value))}
              className="w-full h-1.5 sm:h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-amber-400 [&::-webkit-slider-thumb]:to-orange-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-800"
            />
            <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>50</span>
            </div>
          </div>

        </div>

        {/* Advanced Controls - Show when expanded */}
        {isExpanded && (
          <>
            {/* Text Position */}
            <div className="bg-gray-800/30 rounded-xl p-3 sm:p-4 lg:col-span-2">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Grid className="h-4 w-4 text-cyan-400" />
                <label className="text-xs sm:text-sm font-medium text-gray-300">Text Position</label>
              </div>
              <div className="grid grid-cols-3 gap-1 sm:gap-2">
                {textPositions.map(position => (
                  <button
                    key={position.value}
                    onClick={() => handleChange('textPosition', position.value)}
                    className={`aspect-square p-1 sm:p-2 rounded-lg border flex flex-col items-center justify-center gap-1 ${controls.textPosition === position.value
                      ? 'border-amber-500 bg-gradient-to-r from-amber-500/10 to-orange-500/10'
                      : 'border-gray-700 bg-gray-800/30 hover:bg-gray-800/50'
                      }`}
                    title={position.fullLabel}
                  >
                    <div className={`${controls.textPosition === position.value ? 'text-amber-400' : 'text-gray-400'}`}>
                      {position.icon}
                    </div>
                    <span className={`text-[10px] sm:text-xs ${controls.textPosition === position.value ? 'text-white' : 'text-gray-400'}`}>
                      {position.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Image Adjustments */}
            <div className="bg-gray-800/30 rounded-xl p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-yellow-400" />
                  <label className="text-xs sm:text-sm font-medium text-gray-300">Brightness</label>
                </div>
                <span className="text-xs sm:text-sm font-bold text-white px-2 py-1 bg-gray-800 rounded">
                  {controls.brightness || 100}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={controls.brightness || 100}
                onChange={(e) => handleChange('brightness', parseInt(e.target.value))}
                className="w-full h-1.5 sm:h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-amber-400 [&::-webkit-slider-thumb]:to-orange-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-800"
              />
              <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>100%</span>
                <span>200%</span>
              </div>
            </div>

            <div className="bg-gray-800/30 rounded-xl p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2">
                  <Contrast className="h-4 w-4 text-blue-400" />
                  <label className="text-xs sm:text-sm font-medium text-gray-300">Contrast</label>
                </div>
                <span className="text-xs sm:text-sm font-bold text-white px-2 py-1 bg-gray-800 rounded">
                  {controls.contrast || 100}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={controls.contrast || 100}
                onChange={(e) => handleChange('contrast', parseInt(e.target.value))}
                className="w-full h-1.5 sm:h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-amber-400 [&::-webkit-slider-thumb]:to-orange-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-800"
              />
              <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>100%</span>
                <span>200%</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Save Preset Button */}
      <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-800/50">
        <button
          onClick={savePreset}
          className="w-full py-2 sm:py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-gray-700 rounded-xl text-white text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all"
        >
          <Save className="h-3 w-3 sm:h-4 sm:w-4" />
          Save Current Settings as Preset
        </button>
      </div>

      {/* Current Settings Preview */}
      <div className="mt-4 p-3 bg-gray-800/30 rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Live Preview Active</span>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-green-400">Connected</span>
          </div>
        </div>
        <div className="text-[10px] text-gray-500 mt-1">
          Changes update immediately in preview panel
        </div>
      </div>
    </div>
  );
};

export default ControlsPanel;





