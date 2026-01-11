import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  Download, 
  Loader, 
  CheckCircle, 
  AlertCircle,
  Clock,
  FileVideo,
  Sparkles,
  Zap,
  AlertTriangle,
  Cpu,
  Shield,
  HardDrive
} from 'lucide-react';

const VideoGenerator = ({ slides, voice, controls, image, story }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle');
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [debugLog, setDebugLog] = useState([]);
  
  const isProcessorReady = true; // MediaRecorder is always ready

  const addDebugLog = (message) => {
    console.log(message);
    setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  // Generate slide images
  const generateSlidesAsImages = async () => {
    const slideImages = [];
    addDebugLog(`${slides.length} slide images बना रहे हैं...`);
    
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      
      try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        
        const loadPromise = new Promise((resolve) => {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          setTimeout(() => resolve(false), 5000);
        });
        
        img.src = slide.image;
        const loaded = await loadPromise;
        
        if (loaded && img.complete && img.naturalWidth !== 0) {
          ctx.save();
          ctx.filter = `blur(${Math.min(controls.blurAmount || 0, 10)}px) brightness(${controls.brightness || 100}%) contrast(${controls.contrast || 100}%)`;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          ctx.restore();
        } else {
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          gradient.addColorStop(0, '#4F46E5');
          gradient.addColorStop(1, '#7C3AED');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.fillStyle = controls.backgroundColor || 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = controls.textColor || '#ffffff';
        const fontSize = Math.min(controls.fontSize || 36, 42);
        ctx.font = `bold ${fontSize}px ${controls.fontFamily || 'Arial, sans-serif'}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        let x = canvas.width / 2;
        let y = canvas.height / 2;
        
        const pos = controls.textPosition || 'center';
        if (pos.includes('top')) y = canvas.height * 0.3;
        if (pos.includes('bottom')) y = canvas.height * 0.7;
        if (pos.includes('left')) {
          x = canvas.width * 0.1;
          ctx.textAlign = 'left';
        }
        if (pos.includes('right')) {
          x = canvas.width * 0.9;
          ctx.textAlign = 'right';
        }
        
        const maxWidth = canvas.width * 0.8;
        const lineHeight = fontSize * 1.4;
        const words = slide.text.split(' ');
        let line = '';
        const lines = [];
        
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > maxWidth && n > 0) {
            lines.push(line.trim());
            line = words[n] + ' ';
          } else {
            line = testLine;
          }
        }
        if (line.trim()) lines.push(line.trim());
        
        const totalHeight = lines.length * lineHeight;
        let startY = y - (totalHeight / 2) + (lineHeight / 2);
        
        lines.forEach((textLine, idx) => {
          ctx.fillText(textLine, x, startY + (idx * lineHeight));
        });
        
        const blob = await new Promise(resolve => {
          canvas.toBlob(resolve, 'image/png', 0.95);
        });
        
        slideImages.push(blob);
        setProgress(Math.round(((i + 1) / slides.length) * 30));
        
      } catch (error) {
        addDebugLog(`Slide ${i} में error: ${error.message}`);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#1F2937';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#9CA3AF';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Slide ${i + 1}`, canvas.width / 2, canvas.height / 2);
        
        const blob = await new Promise(resolve => {
          canvas.toBlob(resolve, 'image/png');
        });
        
        slideImages.push(blob);
      }
    }
    
    addDebugLog(`${slideImages.length} slides तैयार हैं`);
    return slideImages;
  };

  // Generate video using MediaRecorder
  const generateVideo = async () => {
    if (slides.length === 0) {
      alert('Please add some content first.');
      return;
    }

    addDebugLog('Video generation शुरू...');
    setIsLoading(true);
    setStatus('preparing');
    setProgress(0);
    setLoadError('');
    setDebugLog([]);
    
    try {
      setStatus('generating_slides');
      const slideImages = await generateSlidesAsImages();
      
      setStatus('creating_video');
      addDebugLog('Video encoding शुरू...');
      
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      
      const fps = 30;
      const duration = controls.slideDuration || 3;
      
      // Check supported mimeTypes
      const mimeTypes = [
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4',
      ];
      
      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          addDebugLog(`Using codec: ${mimeType}`);
          break;
        }
      }
      
      if (!selectedMimeType) {
        throw new Error('आपका browser video recording support नहीं करता');
      }
      
      // Create canvas stream
      const canvasStream = canvas.captureStream(fps);
      
      // If audio/voice is provided, merge it with video stream
      let finalStream = canvasStream;
      if (voice) {
        try {
          addDebugLog('Audio file detect हुई, merge कर रहे हैं...');
          
          // Create audio element
          const audioElement = new Audio();
          const audioUrl = URL.createObjectURL(voice);
          audioElement.src = audioUrl;
          audioElement.crossOrigin = 'anonymous';
          
          // Create audio context
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const audioSource = audioContext.createMediaElementSource(audioElement);
          const audioDestination = audioContext.createMediaStreamDestination();
          audioSource.connect(audioDestination);
          audioSource.connect(audioContext.destination);
          
          // Merge audio and video streams
          const videoTrack = canvasStream.getVideoTracks()[0];
          const audioTrack = audioDestination.stream.getAudioTracks()[0];
          
          finalStream = new MediaStream([videoTrack, audioTrack]);
          
          // Play audio
          audioElement.play();
          
          addDebugLog('Audio successfully merged!');
        } catch (audioError) {
          addDebugLog(`Audio merge error: ${audioError.message}`);
          console.warn('Audio merge failed, continuing without audio:', audioError);
        }
      }
      
      const mediaRecorder = new MediaRecorder(finalStream, {
        mimeType: selectedMimeType,
        videoBitsPerSecond: 2500000
      });
      
      const chunks = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
          addDebugLog(`Data chunk: ${e.data.size} bytes`);
        }
      };
      
      mediaRecorder.onstop = async () => {
        addDebugLog('Recording बंद हुई');
        
        if (chunks.length === 0) {
          setLoadError('Video data नहीं मिला');
          setIsLoading(false);
          setStatus('error');
          return;
        }
        
        const blob = new Blob(chunks, { type: selectedMimeType });
        addDebugLog(`Video blob: ${blob.size} bytes`);
        
        const url = URL.createObjectURL(blob);
        
        setVideoUrl(url);
        setGeneratedVideo(blob);
        
        const format = selectedMimeType.includes('mp4') ? 'MP4' : 'WebM';
        
        setVideoInfo({
          duration: (slides.length * duration).toFixed(1),
          size: (blob.size / 1024 / 1024).toFixed(2),
          resolution: '1280x720',
          format: format,
          codec: 'H.264/AAC'
        });
        
        setStatus('completed');
        setProgress(100);
        setIsLoading(false);
        
        addDebugLog('Video तैयार है!');
        // start downloading 
        downloadVideo();
      };
      
      mediaRecorder.onerror = (e) => {
        addDebugLog(`Error: ${e.error}`);
        setLoadError('Recording में error');
        setIsLoading(false);
        setStatus('error');
      };
      
      addDebugLog('Recording शुरू...');
      mediaRecorder.start(1000);
      
      // Pre-load images
      const imageElements = await Promise.all(
        slideImages.map(blob => {
          return new Promise((resolve) => {
            const img = new window.Image();
            const url = URL.createObjectURL(blob);
            img.onload = () => resolve({ img, url });
            img.onerror = () => resolve(null);
            img.src = url;
          });
        })
      );
      
      addDebugLog(`${imageElements.length} images loaded`);
      
      // Draw frames
      let currentSlide = 0;
      let frameCount = 0;
      const framesPerSlide = duration * fps;
      
      const drawFrame = () => {
        if (currentSlide >= slides.length) {
          addDebugLog('सभी slides complete, stopping...');
          setTimeout(() => {
            mediaRecorder.stop();
            imageElements.forEach(elem => {
              if (elem && elem.url) URL.revokeObjectURL(elem.url);
            });
          }, 500);
          return;
        }
        
        const imgData = imageElements[currentSlide];
        if (imgData && imgData.img) {
          ctx.drawImage(imgData.img, 0, 0, canvas.width, canvas.height);
        } else {
          ctx.fillStyle = '#1F2937';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 32px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`Slide ${currentSlide + 1}`, canvas.width / 2, canvas.height / 2);
        }
        
        frameCount++;
        
        if (frameCount >= framesPerSlide) {
          currentSlide++;
          frameCount = 0;
          addDebugLog(`Slide ${currentSlide} done`);
        }
        
        const overallProgress = 30 + ((currentSlide / slides.length) * 65);
        setProgress(Math.min(95, Math.round(overallProgress)));
        
        if (currentSlide < slides.length) {
          setTimeout(() => requestAnimationFrame(drawFrame), 1000 / fps);
        } else {
          setTimeout(() => {
            mediaRecorder.stop();
            imageElements.forEach(elem => {
              if (elem && elem.url) URL.revokeObjectURL(elem.url);
            });
          }, 500);
        }
      };
      
      setTimeout(() => {
        addDebugLog('Drawing शुरू...');
        drawFrame();
      }, 100);
      
    } catch (error) {
      addDebugLog(`Error: ${error.message}`);
      console.error('Video generation error:', error);
      setStatus('error');
      setLoadError(error.message);
      setIsLoading(false);
      alert(`Generation failed: ${error.message}`);
    }
  };

  const downloadVideo = () => {
    if (generatedVideo && videoUrl) {
      const link = document.createElement('a');
      link.href = videoUrl;
      const extension = videoInfo?.format === 'MP4' ? 'mp4' : 'webm';
      link.download = `video-${new Date().toISOString().slice(0, 10)}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStatusMessage = () => {
    const messages = {
      preparing: 'Preparing video generation...',
      generating_slides: 'Creating slide images...',
      creating_video: 'Encoding video...',
      completed: 'Video ready!',
      error: 'Error occurred'
    };
    return messages[status] || 'Ready';
  };

  const isReadyToGenerate = slides.length > 0;
  const totalDuration = slides.length * (controls.slideDuration || 3);

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg">
            <Video className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Video Generator</h2>
            <p className="text-xs text-gray-400">Create final video</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
          <Cpu className="h-3 w-3" />
          Ready
        </div>
      </div>

      {/* Processor Status */}
      <div className="mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-blue-400" />
          <span className="text-sm text-blue-400">
            Browser MediaRecorder API - No External Dependencies!
          </span>
        </div>
      </div>

      {/* Requirements */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {image ? (
              <CheckCircle className="h-4 w-4 text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-400" />
            )}
            <span className={image ? 'text-gray-300' : 'text-gray-500'}>
              Background Image
            </span>
          </div>
          {image && <span className="text-green-400 text-xs">✓</span>}
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {story ? (
              <CheckCircle className="h-4 w-4 text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-400" />
            )}
            <span className={story ? 'text-gray-300' : 'text-gray-500'}>
              Story Content
            </span>
          </div>
          {story && (
            <span className="text-green-400 text-xs">
              {slides.length} slide{slides.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-gray-300">Video Processor</span>
          </div>
          <span className="text-green-400 text-xs">✓ Ready</span>
        </div>
      </div>

      {/* Video Summary */}
      {slides.length > 0 && (
        <div className="mb-4 p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium flex items-center gap-2 text-white">
              <Sparkles className="h-4 w-4 text-blue-400" />
              Video Summary
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="h-4 w-4" />
              {totalDuration}s
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center p-2 bg-gray-800/30 rounded-lg">
              <div className="text-xl font-bold text-white">{slides.length}</div>
              <div className="text-xs text-gray-400">Slides</div>
            </div>
            <div className="text-center p-2 bg-gray-800/30 rounded-lg">
              <div className="text-xl font-bold text-white">{controls.slideDuration || 3}s</div>
              <div className="text-xs text-gray-400">Per Slide</div>
            </div>
            <div className="text-center p-2 bg-gray-800/30 rounded-lg">
              <div className="text-xl font-bold text-white">{voice ? 'Yes' : 'No'}</div>
              <div className="text-xs text-gray-400">Audio</div>
            </div>
            <div className="text-center p-2 bg-gray-800/30 rounded-lg">
              <div className="text-xl font-bold text-white">720p</div>
              <div className="text-xs text-gray-400">HD</div>
            </div>
          </div>
        </div>
      )}

      {/* Progress */}
      {isLoading && (
        <div className="mb-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">{getStatusMessage()}</span>
            <span className="text-blue-400">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {debugLog.length > 0 && (
            <div className="mt-3 p-3 bg-gray-800/50 rounded-lg max-h-24 overflow-y-auto">
              <div className="text-xs text-gray-400 space-y-1">
                {debugLog.slice(-3).map((log, idx) => (
                  <div key={idx}>{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {loadError && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <div className="flex items-center gap-2 text-sm text-red-400">
            <AlertTriangle className="h-4 w-4" />
            <span>{loadError}</span>
          </div>
        </div>
      )}

      {/* Generated Video */}
      {generatedVideo && (
        <div className="mb-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium flex items-center gap-2 text-white">
              <FileVideo className="h-4 w-4 text-green-400" />
              Your Video
            </h3>
            {videoInfo && (
              <div className="text-xs text-gray-400">
                {videoInfo.duration}s • {videoInfo.size}MB
              </div>
            )}
          </div>
          
          <div className="relative rounded-lg overflow-hidden bg-black border border-gray-700">
            <video
              src={videoUrl}
              controls
              className="w-full h-48 object-contain"
              poster={slides[0]?.image}
            />
          </div>
          
          {videoInfo && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-gray-800/30 rounded-lg">
                <div className="text-gray-400">Resolution</div>
                <div className="font-medium text-white">{videoInfo.resolution}</div>
              </div>
              <div className="p-3 bg-gray-800/30 rounded-lg">
                <div className="text-gray-400">Format</div>
                <div className="font-medium text-white">{videoInfo.format}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={generateVideo}
          disabled={!isReadyToGenerate || isLoading}
          className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl font-medium transition-all ${
            isReadyToGenerate && !isLoading
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Zap className="h-5 w-5" />
              Generate Video
            </>
          )}
        </button>
        
        {generatedVideo && (
          <button
            onClick={downloadVideo}
            className="w-full flex items-center justify-center gap-3 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl text-white font-medium transition-all"
          >
            <Download className="h-5 w-5" />
            Download Video ({videoInfo?.size}MB)
          </button>
        )}
      </div>

      {/* Security Info */}
      <div className="mt-4 p-4 bg-gray-800/30 rounded-xl">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-300">100% Secure Processing</p>
            <ul className="text-xs text-gray-400 space-y-1">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1"></div>
                <span>All processing happens in your browser</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1"></div>
                <span>No data is sent to any server</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1"></div>
                <span>Native browser API - instant and fast</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-4 p-3 bg-gray-800/20 rounded-lg">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-gray-400">
            <HardDrive className="h-3 w-3" />
            <span>Local Processing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-green-400">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoGenerator;