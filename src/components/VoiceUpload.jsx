import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Volume2, 
  Upload, 
  Play, 
  Pause, 
  Trash2, 
  Timer,
  AlertCircle,
  Waves,
  CheckCircle,
  XCircle,
  Music,
  FileAudio,
  Headphones,
  RotateCcw,
  SkipBack,
  SkipForward,
  VolumeX,
  Volume1,
  Volume,
  Settings,
  Sliders,
  Zap,
  Scissors,
  Merge,
  Download,
  Copy,
  Clock,
  FastForward,
  Rewind,
  Gauge,
  Filter,
  Crop,
  Edit3,
  Save,
  Share2,
  History
} from 'lucide-react';

const VoiceUpload = ({ voice, setVoice }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [showRecordingTips, setShowRecordingTips] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState('idle');
  const [audioUrl, setAudioUrl] = useState(null);
  
  // Audio Control States
  const [audioControls, setAudioControls] = useState({
    volume: 80,
    speed: 1.0,
    fadeIn: 0,
    fadeOut: 0,
    trimStart: 0,
    trimEnd: 0,
    equalizer: {
      bass: 50,
      mid: 50,
      treble: 50
    },
    effects: {
      echo: false,
      reverb: false,
      normalize: true,
      noiseReduction: true,
      compressor: false
    }
  });
  
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [isTrimming, setIsTrimming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioHistory, setAudioHistory] = useState([]);
  const [currentEffect, setCurrentEffect] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);

  // Audio speed options
  const speedPresets = [
    { value: 0.5, label: '0.5x', desc: 'Very Slow' },
    { value: 0.75, label: '0.75x', desc: 'Slow' },
    { value: 1.0, label: '1.0x', desc: 'Normal' },
    { value: 1.25, label: '1.25x', desc: 'Fast' },
    { value: 1.5, label: '1.5x', desc: 'Faster' },
    { value: 2.0, label: '2.0x', desc: 'Very Fast' }
  ];

  // Audio effect presets
  const effectPresets = [
    { id: 'radio', name: 'Radio', icon: '📻', speed: 1.0, bass: 60, treble: 70 },
    { id: 'podcast', name: 'Podcast', icon: '🎙️', speed: 1.1, bass: 55, treble: 65 },
    { id: 'slow_motion', name: 'Slow Mo', icon: '🐌', speed: 0.75, bass: 50, treble: 50 },
    { id: 'fast_talk', name: 'Fast Talk', icon: '⚡', speed: 1.5, bass: 45, treble: 60 },
    { id: 'deep_voice', name: 'Deep Voice', icon: '🎵', speed: 0.9, bass: 80, treble: 40 }
  ];

  // Initialize when voice changes
  useEffect(() => {
    if (voice) {
      const url = URL.createObjectURL(voice);
      setAudioUrl(url);
      
      const audio = new Audio(url);
      audio.onloadedmetadata = () => {
        const duration = audio.duration;
        setAudioDuration(duration);
        setAudioControls(prev => ({
          ...prev,
          trimEnd: duration
        }));
      };
      
      // Save original to history
      setAudioHistory([{
        id: Date.now(),
        type: 'original',
        timestamp: new Date().toLocaleTimeString(),
        controls: { ...audioControls }
      }]);
      
      setHasChanges(false);
    } else {
      setAudioUrl(null);
      setAudioDuration(0);
      setAudioCurrentTime(0);
      setAudioProgress(0);
      setAudioHistory([]);
      setHasChanges(false);
    }
    
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [voice]);

  // Apply audio controls when they change
  useEffect(() => {
    if (audioRef.current) {
      // Apply volume
      audioRef.current.volume = audioControls.volume / 100;
      
      // Apply playback speed
      audioRef.current.playbackRate = audioControls.speed;
    }
  }, [audioControls.volume, audioControls.speed]);

  // Handle audio time updates
  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration || audioDuration;
      setAudioCurrentTime(currentTime);
      setAudioProgress(duration > 0 ? (currentTime / duration) * 100 : 0);
      
      // Apply fade effects if playing
      if (isPlaying) {
        applyFadeEffects(currentTime, duration);
      }
    }
  };

  // Apply fade in/out effects
  const applyFadeEffects = (currentTime, duration) => {
    if (!audioRef.current) return;
    
    let volume = audioControls.volume / 100;
    
    // Apply fade in
    if (audioControls.fadeIn > 0 && currentTime < audioControls.fadeIn) {
      volume = (currentTime / audioControls.fadeIn) * volume;
    }
    
    // Apply fade out
    if (audioControls.fadeOut > 0 && currentTime > duration - audioControls.fadeOut) {
      const timeLeft = duration - currentTime;
      volume = (timeLeft / audioControls.fadeOut) * volume;
    }
    
    audioRef.current.volume = Math.min(Math.max(volume, 0), 1);
  };

  // Handle file upload
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      setVoice(file);
      setRecordingStatus('uploaded');
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      }
      
      setTimeout(() => setRecordingStatus('idle'), 2000);
    } else {
      alert('Please select a valid audio file (MP3, WAV, etc.)');
    }
  };

  // Recording functionality
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support audio recording');
        return;
      }

      setRecordingStatus('preparing');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], `recording_${Date.now()}.webm`, { 
          type: 'audio/webm'
        });
        
        setVoice(file);
        setRecordingStatus('saved');
        
        stream.getTracks().forEach(track => track.stop());
        
        setTimeout(() => setRecordingStatus('idle'), 2000);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingStatus('recording');
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setRecordingStatus('error');
      setTimeout(() => setRecordingStatus('idle'), 2000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // Audio playback controls
  const togglePlayPause = () => {
    if (!voice || !audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error('Error playing audio:', err);
        setIsPlaying(false);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setAudioCurrentTime(0);
    setAudioProgress(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const seekAudio = (e) => {
    if (!audioRef.current || !voice) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percentage = clickPosition / rect.width;
    const duration = audioRef.current.duration || audioDuration;
    
    if (duration > 0) {
      const newTime = percentage * duration;
      audioRef.current.currentTime = newTime;
      setAudioCurrentTime(newTime);
      setAudioProgress(percentage * 100);
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioDuration,
        audioRef.current.currentTime + 5
      );
    }
  };

  // Audio editing functions
  const applySpeedChange = (speed) => {
    setAudioControls(prev => ({
      ...prev,
      speed: speed
    }));
    
    addToHistory('speed_change', { speed: speed });
    setCurrentEffect(`Speed changed to ${speed}x`);
    setHasChanges(true);
    setTimeout(() => setCurrentEffect(''), 2000);
  };

  const applyEffectPreset = (preset) => {
    setAudioControls(prev => ({
      ...prev,
      speed: preset.speed,
      equalizer: {
        bass: preset.bass || 50,
        mid: 50,
        treble: preset.treble || 50
      }
    }));
    
    addToHistory('effect_preset', { 
      speed: preset.speed,
      bass: preset.bass,
      treble: preset.treble,
      presetName: preset.name
    });
    
    setCurrentEffect(`${preset.name} effect applied`);
    setHasChanges(true);
    setTimeout(() => setCurrentEffect(''), 2000);
  };

  const applyTrim = () => {
    if (audioRef.current && audioDuration > 0) {
      const start = audioControls.trimStart;
      const end = audioControls.trimEnd;
      
      if (start >= 0 && end <= audioDuration && start < end) {
        audioRef.current.currentTime = start;
        
        addToHistory('trim', { 
          trimStart: start,
          trimEnd: end,
          duration: end - start
        });
        
        setCurrentEffect(`Audio trimmed (${formatTime(start)} - ${formatTime(end)})`);
        setHasChanges(true);
        setTimeout(() => setCurrentEffect(''), 2000);
      }
    }
  };

  const resetTrim = () => {
    setAudioControls(prev => ({
      ...prev,
      trimStart: 0,
      trimEnd: audioDuration
    }));
  };

  const normalizeAudio = () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      setAudioControls(prev => ({
        ...prev,
        volume: 95,
        effects: {
          ...prev.effects,
          normalize: true
        }
      }));
      
      addToHistory('normalize', { volume: 95 });
      setIsProcessing(false);
      setCurrentEffect('Audio normalized');
      setHasChanges(true);
      setTimeout(() => setCurrentEffect(''), 2000);
    }, 1000);
  };

  const reduceNoise = () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      setAudioControls(prev => ({
        ...prev,
        effects: {
          ...prev.effects,
          noiseReduction: true
        }
      }));
      
      addToHistory('noise_reduction', {});
      setIsProcessing(false);
      setCurrentEffect('Background noise reduced');
      setHasChanges(true);
      setTimeout(() => setCurrentEffect(''), 2000);
    }, 1500);
  };

  const addToHistory = (type, data) => {
    const historyItem = {
      id: Date.now(),
      type: type,
      timestamp: new Date().toLocaleTimeString(),
      data: data,
      controls: { ...audioControls }
    };
    
    setAudioHistory(prev => [...prev, historyItem]);
  };

  const undoLastChange = () => {
    if (audioHistory.length > 1) {
      const lastItem = audioHistory[audioHistory.length - 2];
      setAudioControls(lastItem.controls);
      setAudioHistory(prev => prev.slice(0, -1));
      setCurrentEffect('Last change undone');
      setHasChanges(audioHistory.length > 2);
      setTimeout(() => setCurrentEffect(''), 2000);
    }
  };

  const saveEditedAudio = () => {
    if (!voice || isProcessing) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      // In a real app, you would process the audio here
      // For demonstration, we'll just update the file name
      const editedFile = new File([voice], `edited_${voice.name}`, {
        type: voice.type,
        lastModified: Date.now()
      });
      
      setVoice(editedFile);
      setIsProcessing(false);
      setCurrentEffect('Edited version saved!');
      setHasChanges(false);
      setTimeout(() => setCurrentEffect(''), 3000);
    }, 2000);
  };

  const removeAudio = () => {
    setVoice(null);
    setIsPlaying(false);
    setAudioCurrentTime(0);
    setAudioProgress(0);
    setAudioControls({
      volume: 80,
      speed: 1.0,
      fadeIn: 0,
      fadeOut: 0,
      trimStart: 0,
      trimEnd: 0,
      equalizer: { bass: 50, mid: 50, treble: 50 },
      effects: { echo: false, reverb: false, normalize: true, noiseReduction: true, compressor: false }
    });
    setAudioHistory([]);
    setHasChanges(false);
    setShowAdvancedControls(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFileSize = (sizeInBytes) => {
    if (!sizeInBytes) return '0 KB';
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg">
            <Headphones className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Audio Editor</h2>
            <p className="text-xs text-gray-400">Record, edit, and enhance audio</p>
          </div>
        </div>
        
        {voice && (
          <div className="flex items-center gap-2">
            {hasChanges && (
              <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded">
                Unsaved changes
              </span>
            )}
            <button
              onClick={undoLastChange}
              disabled={audioHistory.length <= 1}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo last change"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={removeAudio}
              className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Status Indicators */}
      {recordingStatus !== 'idle' && (
        <div className={`mb-4 p-3 rounded-xl ${
          recordingStatus === 'recording' ? 'bg-red-500/10 border border-red-500/20' : 
          recordingStatus === 'saved' ? 'bg-green-500/10 border border-green-500/20' :
          recordingStatus === 'uploaded' ? 'bg-blue-500/10 border border-blue-500/20' :
          'bg-yellow-500/10 border border-yellow-500/20'
        }`}>
          <div className="flex items-center gap-2">
            {recordingStatus === 'recording' && <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>}
            {recordingStatus === 'saved' && <CheckCircle className="h-4 w-4 text-green-400" />}
            {recordingStatus === 'error' && <XCircle className="h-4 w-4 text-red-400" />}
            <span className={`text-sm font-medium ${
              recordingStatus === 'recording' ? 'text-red-400' : 
              recordingStatus === 'saved' ? 'text-green-400' :
              recordingStatus === 'uploaded' ? 'text-blue-400' : 'text-yellow-400'
            }`}>
              {recordingStatus === 'recording' && `Recording... ${formatTime(recordingTime)}`}
              {recordingStatus === 'saved' && 'Audio saved successfully!'}
              {recordingStatus === 'uploaded' && 'Audio uploaded successfully!'}
              {recordingStatus === 'preparing' && 'Preparing microphone...'}
              {recordingStatus === 'error' && 'Recording failed'}
            </span>
          </div>
        </div>
      )}

      {currentEffect && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-blue-400">{currentEffect}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      {voice ? (
        <div className="space-y-6">
          {/* Audio Player */}
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <Music className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white truncate">{voice.name}</p>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                    <span>{formatTime(audioDuration)}</span>
                    <span>•</span>
                    <span>{getFileSize(voice.size)}</span>
                    <span>•</span>
                    <span>Speed: {audioControls.speed}x</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Volume className="h-3 w-3" />
                      {audioControls.volume}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlayPause}
                  className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-full text-white transition-all hover:scale-105"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div 
                className="relative h-1.5 bg-gray-700 rounded-full mb-2 cursor-pointer" 
                onClick={seekAudio}
              >
                <div 
                  className="absolute h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                  style={{ width: `${audioProgress}%` }}
                />
                <div 
                  className="absolute h-3 w-3 bg-white rounded-full -translate-y-1/2 top-1/2 shadow-lg transition-all"
                  style={{ left: `${audioProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>{formatTime(audioCurrentTime)}</span>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={skipBackward} 
                    className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                    disabled={!voice}
                  >
                    <SkipBack className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={togglePlayPause} 
                    className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                    disabled={!voice}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  <button 
                    onClick={skipForward} 
                    className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                    disabled={!voice}
                  >
                    <SkipForward className="h-4 w-4" />
                  </button>
                </div>
                <span>{formatTime(audioDuration)}</span>
              </div>
            </div>

            <audio
              ref={audioRef}
              src={audioUrl}
              onTimeUpdate={handleAudioTimeUpdate}
              onEnded={handleAudioEnded}
              className="hidden"
            />
          </div>

          {/* Quick Edit Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Speed Control */}
            <div className="bg-gray-800/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <FastForward className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-medium text-white">Playback Speed</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Current: {audioControls.speed}x</span>
                  <span className="text-xs text-gray-500 px-2 py-1 bg-gray-800 rounded">
                    {audioControls.speed === 1.0 ? 'Normal' : 
                     audioControls.speed < 1.0 ? 'Slower' : 'Faster'}
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-2">
                  {speedPresets.map(preset => (
                    <button
                      key={preset.value}
                      onClick={() => applySpeedChange(preset.value)}
                      className={`py-2 rounded-lg text-xs sm:text-sm transition-all ${
                        audioControls.speed === preset.value
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                      title={preset.desc}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={audioControls.speed}
                  onChange={(e) => applySpeedChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-purple-500 [&::-webkit-slider-thumb]:to-pink-500"
                />
              </div>
            </div>

            {/* Volume & Effects */}
            <div className="bg-gray-800/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sliders className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-medium text-white">Volume & Effects</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Volume</span>
                    <span className="text-sm font-bold text-white">{audioControls.volume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={audioControls.volume}
                    onChange={(e) => setAudioControls(prev => ({
                      ...prev,
                      volume: parseInt(e.target.value)
                    }))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-blue-500 [&::-webkit-slider-thumb]:to-cyan-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={normalizeAudio}
                    disabled={isProcessing || audioControls.effects.normalize}
                    className={`py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-all ${
                      audioControls.effects.normalize
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Filter className="h-3 w-3" />
                    Normalize
                  </button>
                  <button
                    onClick={reduceNoise}
                    disabled={isProcessing || audioControls.effects.noiseReduction}
                    className={`py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-all ${
                      audioControls.effects.noiseReduction
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Waves className="h-3 w-3" />
                    Reduce Noise
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Effect Presets */}
          <div className="bg-gray-800/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-yellow-400" />
              <h3 className="text-sm font-medium text-white">Quick Effect Presets</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {effectPresets.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => applyEffectPreset(preset)}
                  className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors group"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xl">{preset.icon}</span>
                    <span className="text-xs text-gray-300 group-hover:text-white">{preset.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Controls Toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => setShowAdvancedControls(!showAdvancedControls)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
            >
              <Settings className="h-4 w-4" />
              {showAdvancedControls ? 'Hide Advanced Controls' : 'Show Advanced Controls'}
            </button>
            
            <button
              onClick={saveEditedAudio}
              disabled={isProcessing || !hasChanges}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Edited Version
                </>
              )}
            </button>
          </div>

          {/* Advanced Controls */}
          {showAdvancedControls && (
            <div className="space-y-4">
              {/* Trim Audio */}
              <div className="bg-gray-800/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Crop className="h-4 w-4 text-red-400" />
                  <h3 className="text-sm font-medium text-white">Trim Audio</h3>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">
                        Start: {formatTime(audioControls.trimStart)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max={audioDuration}
                        step="0.1"
                        value={audioControls.trimStart}
                        onChange={(e) => setAudioControls(prev => ({
                          ...prev,
                          trimStart: parseFloat(e.target.value)
                        }))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-red-500 [&::-webkit-slider-thumb]:to-pink-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">
                        End: {formatTime(audioControls.trimEnd)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max={audioDuration}
                        step="0.1"
                        value={audioControls.trimEnd}
                        onChange={(e) => setAudioControls(prev => ({
                          ...prev,
                          trimEnd: parseFloat(e.target.value)
                        }))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-red-500 [&::-webkit-slider-thumb]:to-pink-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-300">
                      Selected duration: {formatTime(audioControls.trimEnd - audioControls.trimStart)}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={resetTrim}
                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300 transition-colors"
                      >
                        Reset
                      </button>
                      <button
                        onClick={applyTrim}
                        className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded text-sm text-white transition-colors"
                      >
                        Apply Trim
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Equalizer */}
              <div className="bg-gray-800/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sliders className="h-4 w-4 text-green-400" />
                  <h3 className="text-sm font-medium text-white">Equalizer</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {Object.entries(audioControls.equalizer).map(([band, value]) => (
                    <div key={band}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400 capitalize">{band}</span>
                        <span className="text-sm font-bold text-white">{value}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={value}
                        onChange={(e) => setAudioControls(prev => ({
                          ...prev,
                          equalizer: {
                            ...prev.equalizer,
                            [band]: parseInt(e.target.value)
                          }
                        }))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-green-500 [&::-webkit-slider-thumb]:to-emerald-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Fade Effects */}
              <div className="bg-gray-800/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Waves className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-medium text-white">Fade Effects</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">
                      Fade In: {audioControls.fadeIn.toFixed(1)}s
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.5"
                      value={audioControls.fadeIn}
                      onChange={(e) => setAudioControls(prev => ({
                        ...prev,
                        fadeIn: parseFloat(e.target.value)
                      }))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-cyan-500 [&::-webkit-slider-thumb]:to-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">
                      Fade Out: {audioControls.fadeOut.toFixed(1)}s
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.5"
                      value={audioControls.fadeOut}
                      onChange={(e) => setAudioControls(prev => ({
                        ...prev,
                        fadeOut: parseFloat(e.target.value)
                      }))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-cyan-500 [&::-webkit-slider-thumb]:to-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Upload/Record Interface */
        <div className="border-2 border-dashed border-gray-700 rounded-2xl p-6 hover:border-green-500/30 transition-colors">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full">
              <Waves className="h-10 w-10 text-gray-400" />
            </div>
            
            <div className="text-center">
              <p className="text-lg font-semibold text-white mb-2">Add Audio</p>
              <p className="text-gray-400 text-sm max-w-md">
                Upload audio file or record using microphone. Edit speed, volume, and apply effects.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2 p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl transition-colors">
                  <Upload className="h-6 w-6 text-blue-400" />
                  <span className="text-sm font-medium text-white">Upload Audio</span>
                  <span className="text-xs text-gray-400">MP3, WAV, WEBM</span>
                </div>
              </label>
              
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                  isRecording
                    ? 'bg-red-500/10 border border-red-500/20 hover:bg-red-500/20'
                    : 'bg-green-500/10 border border-green-700 hover:bg-green-500/20'
                }`}
              >
                <div className={`p-2 rounded-full ${isRecording ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                  <Mic className={`h-6 w-6 ${isRecording ? 'text-red-400' : 'text-green-400'}`} />
                </div>
                <span className={`text-sm font-medium ${isRecording ? 'text-red-400' : 'text-green-400'}`}>
                  {isRecording ? 'Stop Recording' : 'Record'}
                </span>
                {isRecording && (
                  <span className="text-xs text-red-300 font-mono">
                    {formatTime(recordingTime)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tips & History */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-800/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-medium text-white">Editing Tips</h3>
          </div>
          <ul className="text-xs text-gray-400 space-y-2">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1"></div>
              <span>Use 0.75x-0.9x speed for dramatic/emotional narration</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1"></div>
              <span>1.25x-1.5x speed works well for tutorials and explanations</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1"></div>
              <span>Add 2-3 second fade in/out for smooth transitions</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1"></div>
              <span>Normalize audio to ensure consistent volume levels</span>
            </li>
          </ul>
        </div>

        {voice && audioHistory.length > 0 && (
          <div className="bg-gray-800/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-medium text-white">Edit History</h3>
              </div>
              <span className="text-xs text-gray-400">{audioHistory.length} changes</span>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {[...audioHistory].slice(-3).reverse().map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      item.type === 'original' ? 'bg-green-500' :
                      item.type === 'speed_change' ? 'bg-purple-500' :
                      'bg-blue-500'
                    }`}></div>
                    <span className="text-xs text-gray-300">
                      {item.type === 'original' ? 'Original audio' :
                       item.type === 'speed_change' ? `Speed: ${item.controls.speed}x` :
                       'Audio edited'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{item.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceUpload;
