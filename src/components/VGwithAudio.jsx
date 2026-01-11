// import React, { useState, useEffect, useRef } from 'react';
// import { 
//   Video, 
//   Download, 
//   Loader, 
//   CheckCircle, 
//   AlertCircle,
//   Clock,
//   FileVideo,
//   Sparkles,
//   Zap,
//   AlertTriangle,
//   Cpu,
//   Shield,
//   HardDrive
// } from 'lucide-react';

// const VideoGenerator = ({ slides, voice, controls, image, story }) => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [status, setStatus] = useState('idle');
//   const [generatedVideo, setGeneratedVideo] = useState(null);
//   const [videoUrl, setVideoUrl] = useState('');
//   const [videoInfo, setVideoInfo] = useState(null);
//   const [loadError, setLoadError] = useState('');
//   const [debugLog, setDebugLog] = useState([]);
  
//   const isProcessorReady = true; // MediaRecorder is always ready

//   const addDebugLog = (message) => {
//     console.log(message);
//     setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
//   };

//   useEffect(() => {
//     return () => {
//       if (videoUrl) {
//         URL.revokeObjectURL(videoUrl);
//       }
//     };
//   }, [videoUrl]);

//   // Generate slide images
//   const generateSlidesAsImages = async () => {
//     const slideImages = [];
//     addDebugLog(`${slides.length} slide images बना रहे हैं...`);
    
//     const canvas = document.createElement('canvas');
//     canvas.width = 1280;
//     canvas.height = 720;
//     const ctx = canvas.getContext('2d');
    
//     for (let i = 0; i < slides.length; i++) {
//       const slide = slides[i];
      
//       try {
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
        
//         const img = new window.Image();
//         img.crossOrigin = 'anonymous';
        
//         const loadPromise = new Promise((resolve) => {
//           img.onload = () => resolve(true);
//           img.onerror = () => resolve(false);
//           setTimeout(() => resolve(false), 5000);
//         });
        
//         img.src = slide.image;
//         const loaded = await loadPromise;
        
//         if (loaded && img.complete && img.naturalWidth !== 0) {
//           ctx.save();
//           ctx.filter = `blur(${Math.min(controls.blurAmount || 0, 10)}px) brightness(${controls.brightness || 100}%) contrast(${controls.contrast || 100}%)`;
//           ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//           ctx.restore();
//         } else {
//           const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
//           gradient.addColorStop(0, '#4F46E5');
//           gradient.addColorStop(1, '#7C3AED');
//           ctx.fillStyle = gradient;
//           ctx.fillRect(0, 0, canvas.width, canvas.height);
//         }
        
//         ctx.fillStyle = controls.backgroundColor || 'rgba(0, 0, 0, 0.4)';
//         ctx.fillRect(0, 0, canvas.width, canvas.height);
        
//         ctx.fillStyle = controls.textColor || '#ffffff';
//         const fontSize = Math.min(controls.fontSize || 36, 42);
//         ctx.font = `bold ${fontSize}px ${controls.fontFamily || 'Arial, sans-serif'}`;
//         ctx.textAlign = 'center';
//         ctx.textBaseline = 'middle';
//         ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
//         ctx.shadowBlur = 10;
//         ctx.shadowOffsetX = 2;
//         ctx.shadowOffsetY = 2;
        
//         let x = canvas.width / 2;
//         let y = canvas.height / 2;
        
//         const pos = controls.textPosition || 'center';
//         if (pos.includes('top')) y = canvas.height * 0.3;
//         if (pos.includes('bottom')) y = canvas.height * 0.7;
//         if (pos.includes('left')) {
//           x = canvas.width * 0.1;
//           ctx.textAlign = 'left';
//         }
//         if (pos.includes('right')) {
//           x = canvas.width * 0.9;
//           ctx.textAlign = 'right';
//         }
        
//         const maxWidth = canvas.width * 0.8;
//         const lineHeight = fontSize * 1.4;
//         const words = slide.text.split(' ');
//         let line = '';
//         const lines = [];
        
//         for (let n = 0; n < words.length; n++) {
//           const testLine = line + words[n] + ' ';
//           const metrics = ctx.measureText(testLine);
          
//           if (metrics.width > maxWidth && n > 0) {
//             lines.push(line.trim());
//             line = words[n] + ' ';
//           } else {
//             line = testLine;
//           }
//         }
//         if (line.trim()) lines.push(line.trim());
        
//         const totalHeight = lines.length * lineHeight;
//         let startY = y - (totalHeight / 2) + (lineHeight / 2);
        
//         lines.forEach((textLine, idx) => {
//           ctx.fillText(textLine, x, startY + (idx * lineHeight));
//         });
        
//         const blob = await new Promise(resolve => {
//           canvas.toBlob(resolve, 'image/png', 0.95);
//         });
        
//         slideImages.push(blob);
//         setProgress(Math.round(((i + 1) / slides.length) * 30));
        
//       } catch (error) {
//         addDebugLog(`Slide ${i} में error: ${error.message}`);
        
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         ctx.fillStyle = '#1F2937';
//         ctx.fillRect(0, 0, canvas.width, canvas.height);
//         ctx.fillStyle = '#9CA3AF';
//         ctx.font = 'bold 32px Arial';
//         ctx.textAlign = 'center';
//         ctx.fillText(`Slide ${i + 1}`, canvas.width / 2, canvas.height / 2);
        
//         const blob = await new Promise(resolve => {
//           canvas.toBlob(resolve, 'image/png');
//         });
        
//         slideImages.push(blob);
//       }
//     }
    
//     addDebugLog(`${slideImages.length} slides तैयार हैं`);
//     return slideImages;
//   };

//   // Generate video using MediaRecorder
//   const generateVideo = async () => {
//     if (slides.length === 0) {
//       alert('Please add some content first.');
//       return;
//     }

//     addDebugLog('Video generation शुरू...');
//     setIsLoading(true);
//     setStatus('preparing');
//     setProgress(0);
//     setLoadError('');
//     setDebugLog([]);
    
//     try {
//       setStatus('generating_slides');
//       const slideImages = await generateSlidesAsImages();
      
//       setStatus('creating_video');
//       addDebugLog('Video encoding शुरू...');
      
//       const canvas = document.createElement('canvas');
//       canvas.width = 1280;
//       canvas.height = 720;
//       const ctx = canvas.getContext('2d');
      
//       const fps = 30;
//       const duration = controls.slideDuration || 3;
      
//       // Check supported mimeTypes
//       const mimeTypes = [
//         'video/webm;codecs=vp8',
//         'video/webm',
//         'video/mp4',
//       ];
      
//       let selectedMimeType = '';
//       for (const mimeType of mimeTypes) {
//         if (MediaRecorder.isTypeSupported(mimeType)) {
//           selectedMimeType = mimeType;
//           addDebugLog(`Using codec: ${mimeType}`);
//           break;
//         }
//       }
      
//       if (!selectedMimeType) {
//         throw new Error('आपका browser video recording support नहीं करता');
//       }
      
//       // Create canvas stream
//       const canvasStream = canvas.captureStream(fps);
      
//       // If audio/voice is provided, merge it with video stream
//       let finalStream = canvasStream;
//       if (voice) {
//         try {
//           addDebugLog('Audio file detect हुई, merge कर रहे हैं...');
          
//           // Create audio element
//           const audioElement = new Audio();
//           const audioUrl = URL.createObjectURL(voice);
//           audioElement.src = audioUrl;
//           audioElement.crossOrigin = 'anonymous';
          
//           // Create audio context
//           const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//           const audioSource = audioContext.createMediaElementSource(audioElement);
//           const audioDestination = audioContext.createMediaStreamDestination();
//           audioSource.connect(audioDestination);
//           audioSource.connect(audioContext.destination);
          
//           // Merge audio and video streams
//           const videoTrack = canvasStream.getVideoTracks()[0];
//           const audioTrack = audioDestination.stream.getAudioTracks()[0];
          
//           finalStream = new MediaStream([videoTrack, audioTrack]);
          
//           // Play audio
//           audioElement.play();
          
//           addDebugLog('Audio successfully merged!');
//         } catch (audioError) {
//           addDebugLog(`Audio merge error: ${audioError.message}`);
//           console.warn('Audio merge failed, continuing without audio:', audioError);
//         }
//       }
      
//       const mediaRecorder = new MediaRecorder(finalStream, {
//         mimeType: selectedMimeType,
//         videoBitsPerSecond: 2500000
//       });
      
//       const chunks = [];
      
//       mediaRecorder.ondataavailable = (e) => {
//         if (e.data.size > 0) {
//           chunks.push(e.data);
//           addDebugLog(`Data chunk: ${e.data.size} bytes`);
//         }
//       };
      
//       mediaRecorder.onstop = async () => {
//         addDebugLog('Recording बंद हुई');
        
//         if (chunks.length === 0) {
//           setLoadError('Video data नहीं मिला');
//           setIsLoading(false);
//           setStatus('error');
//           return;
//         }
        
//         const blob = new Blob(chunks, { type: selectedMimeType });
//         addDebugLog(`Video blob: ${blob.size} bytes`);
        
//         const url = URL.createObjectURL(blob);
        
//         setVideoUrl(url);
//         setGeneratedVideo(blob);
        
//         const format = selectedMimeType.includes('mp4') ? 'MP4' : 'WebM';
        
//         setVideoInfo({
//           duration: (slides.length * duration).toFixed(1),
//           size: (blob.size / 1024 / 1024).toFixed(2),
//           resolution: '1280x720',
//           format: format,
//           codec: 'H.264/AAC'
//         });
        
//         setStatus('completed');
//         setProgress(100);
//         setIsLoading(false);
        
//         addDebugLog('Video तैयार है!');
//         // start downloading 
//         downloadVideo();
//       };
      
//       mediaRecorder.onerror = (e) => {
//         addDebugLog(`Error: ${e.error}`);
//         setLoadError('Recording में error');
//         setIsLoading(false);
//         setStatus('error');
//       };
      
//       addDebugLog('Recording शुरू...');
//       mediaRecorder.start(1000);
      
//       // Pre-load images
//       const imageElements = await Promise.all(
//         slideImages.map(blob => {
//           return new Promise((resolve) => {
//             const img = new window.Image();
//             const url = URL.createObjectURL(blob);
//             img.onload = () => resolve({ img, url });
//             img.onerror = () => resolve(null);
//             img.src = url;
//           });
//         })
//       );
      
//       addDebugLog(`${imageElements.length} images loaded`);
      
//       // Draw frames
//       let currentSlide = 0;
//       let frameCount = 0;
//       const framesPerSlide = duration * fps;
      
//       const drawFrame = () => {
//         if (currentSlide >= slides.length) {
//           addDebugLog('सभी slides complete, stopping...');
//           setTimeout(() => {
//             mediaRecorder.stop();
//             imageElements.forEach(elem => {
//               if (elem && elem.url) URL.revokeObjectURL(elem.url);
//             });
//           }, 500);
//           return;
//         }
        
//         const imgData = imageElements[currentSlide];
//         if (imgData && imgData.img) {
//           ctx.drawImage(imgData.img, 0, 0, canvas.width, canvas.height);
//         } else {
//           ctx.fillStyle = '#1F2937';
//           ctx.fillRect(0, 0, canvas.width, canvas.height);
//           ctx.fillStyle = '#ffffff';
//           ctx.font = 'bold 32px Arial';
//           ctx.textAlign = 'center';
//           ctx.fillText(`Slide ${currentSlide + 1}`, canvas.width / 2, canvas.height / 2);
//         }
        
//         frameCount++;
        
//         if (frameCount >= framesPerSlide) {
//           currentSlide++;
//           frameCount = 0;
//           addDebugLog(`Slide ${currentSlide} done`);
//         }
        
//         const overallProgress = 30 + ((currentSlide / slides.length) * 65);
//         setProgress(Math.min(95, Math.round(overallProgress)));
        
//         if (currentSlide < slides.length) {
//           setTimeout(() => requestAnimationFrame(drawFrame), 1000 / fps);
//         } else {
//           setTimeout(() => {
//             mediaRecorder.stop();
//             imageElements.forEach(elem => {
//               if (elem && elem.url) URL.revokeObjectURL(elem.url);
//             });
//           }, 500);
//         }
//       };
      
//       setTimeout(() => {
//         addDebugLog('Drawing शुरू...');
//         drawFrame();
//       }, 100);
      
//     } catch (error) {
//       addDebugLog(`Error: ${error.message}`);
//       console.error('Video generation error:', error);
//       setStatus('error');
//       setLoadError(error.message);
//       setIsLoading(false);
//       alert(`Generation failed: ${error.message}`);
//     }
//   };

//   const downloadVideo = () => {
//     if (generatedVideo && videoUrl) {
//       const link = document.createElement('a');
//       link.href = videoUrl;
//       const extension = videoInfo?.format === 'MP4' ? 'mp4' : 'webm';
//       link.download = `video-${new Date().toISOString().slice(0, 10)}.${extension}`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     }
//   };

//   const getStatusMessage = () => {
//     const messages = {
//       preparing: 'Preparing video generation...',
//       generating_slides: 'Creating slide images...',
//       creating_video: 'Encoding video...',
//       completed: 'Video ready!',
//       error: 'Error occurred'
//     };
//     return messages[status] || 'Ready';
//   };

//   const isReadyToGenerate = slides.length > 0;
//   const totalDuration = slides.length * (controls.slideDuration || 3);

//   return (
//     <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 sm:p-5">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center gap-3">
//           <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg">
//             <Video className="h-5 w-5 text-white" />
//           </div>
//           <div>
//             <h2 className="text-lg font-semibold text-white">Video Generator</h2>
//             <p className="text-xs text-gray-400">Create final video</p>
//           </div>
//         </div>
        
//         <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
//           <Cpu className="h-3 w-3" />
//           Ready
//         </div>
//       </div>

//       {/* Processor Status */}
//       <div className="mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
//         <div className="flex items-center gap-2">
//           <CheckCircle className="h-4 w-4 text-blue-400" />
//           <span className="text-sm text-blue-400">
//             Browser MediaRecorder API - No External Dependencies!
//           </span>
//         </div>
//       </div>

//       {/* Requirements */}
//       <div className="mb-4 space-y-3">
//         <div className="flex items-center justify-between text-sm">
//           <div className="flex items-center gap-2">
//             {image ? (
//               <CheckCircle className="h-4 w-4 text-green-400" />
//             ) : (
//               <AlertCircle className="h-4 w-4 text-yellow-400" />
//             )}
//             <span className={image ? 'text-gray-300' : 'text-gray-500'}>
//               Background Image
//             </span>
//           </div>
//           {image && <span className="text-green-400 text-xs">✓</span>}
//         </div>
        
//         <div className="flex items-center justify-between text-sm">
//           <div className="flex items-center gap-2">
//             {story ? (
//               <CheckCircle className="h-4 w-4 text-green-400" />
//             ) : (
//               <AlertCircle className="h-4 w-4 text-yellow-400" />
//             )}
//             <span className={story ? 'text-gray-300' : 'text-gray-500'}>
//               Story Content
//             </span>
//           </div>
//           {story && (
//             <span className="text-green-400 text-xs">
//               {slides.length} slide{slides.length !== 1 ? 's' : ''}
//             </span>
//           )}
//         </div>
        
//         <div className="flex items-center justify-between text-sm">
//           <div className="flex items-center gap-2">
//             <CheckCircle className="h-4 w-4 text-green-400" />
//             <span className="text-gray-300">Video Processor</span>
//           </div>
//           <span className="text-green-400 text-xs">✓ Ready</span>
//         </div>
//       </div>

//       {/* Video Summary */}
//       {slides.length > 0 && (
//         <div className="mb-4 p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50">
//           <div className="flex items-center justify-between mb-3">
//             <h3 className="font-medium flex items-center gap-2 text-white">
//               <Sparkles className="h-4 w-4 text-blue-400" />
//               Video Summary
//             </h3>
//             <div className="flex items-center gap-2 text-sm text-gray-400">
//               <Clock className="h-4 w-4" />
//               {totalDuration}s
//             </div>
//           </div>
          
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//             <div className="text-center p-2 bg-gray-800/30 rounded-lg">
//               <div className="text-xl font-bold text-white">{slides.length}</div>
//               <div className="text-xs text-gray-400">Slides</div>
//             </div>
//             <div className="text-center p-2 bg-gray-800/30 rounded-lg">
//               <div className="text-xl font-bold text-white">{controls.slideDuration || 3}s</div>
//               <div className="text-xs text-gray-400">Per Slide</div>
//             </div>
//             <div className="text-center p-2 bg-gray-800/30 rounded-lg">
//               <div className="text-xl font-bold text-white">{voice ? 'Yes' : 'No'}</div>
//               <div className="text-xs text-gray-400">Audio</div>
//             </div>
//             <div className="text-center p-2 bg-gray-800/30 rounded-lg">
//               <div className="text-xl font-bold text-white">720p</div>
//               <div className="text-xs text-gray-400">HD</div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Progress */}
//       {isLoading && (
//         <div className="mb-4 space-y-3">
//           <div className="flex justify-between text-sm">
//             <span className="text-gray-300">{getStatusMessage()}</span>
//             <span className="text-blue-400">{progress}%</span>
//           </div>
//           <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
//             <div 
//               className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
//               style={{ width: `${progress}%` }}
//             />
//           </div>
          
//           {debugLog.length > 0 && (
//             <div className="mt-3 p-3 bg-gray-800/50 rounded-lg max-h-24 overflow-y-auto">
//               <div className="text-xs text-gray-400 space-y-1">
//                 {debugLog.slice(-3).map((log, idx) => (
//                   <div key={idx}>{log}</div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Error Display */}
//       {loadError && (
//         <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
//           <div className="flex items-center gap-2 text-sm text-red-400">
//             <AlertTriangle className="h-4 w-4" />
//             <span>{loadError}</span>
//           </div>
//         </div>
//       )}

//       {/* Generated Video */}
//       {generatedVideo && (
//         <div className="mb-4 space-y-4">
//           <div className="flex items-center justify-between">
//             <h3 className="font-medium flex items-center gap-2 text-white">
//               <FileVideo className="h-4 w-4 text-green-400" />
//               Your Video
//             </h3>
//             {videoInfo && (
//               <div className="text-xs text-gray-400">
//                 {videoInfo.duration}s • {videoInfo.size}MB
//               </div>
//             )}
//           </div>
          
//           <div className="relative rounded-lg overflow-hidden bg-black border border-gray-700">
//             <video
//               src={videoUrl}
//               controls
//               className="w-full h-48 object-contain"
//               poster={slides[0]?.image}
//             />
//           </div>
          
//           {videoInfo && (
//             <div className="grid grid-cols-2 gap-3 text-sm">
//               <div className="p-3 bg-gray-800/30 rounded-lg">
//                 <div className="text-gray-400">Resolution</div>
//                 <div className="font-medium text-white">{videoInfo.resolution}</div>
//               </div>
//               <div className="p-3 bg-gray-800/30 rounded-lg">
//                 <div className="text-gray-400">Format</div>
//                 <div className="font-medium text-white">{videoInfo.format}</div>
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Action Buttons */}
//       <div className="space-y-3">
//         <button
//           onClick={generateVideo}
//           disabled={!isReadyToGenerate || isLoading}
//           className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl font-medium transition-all ${
//             isReadyToGenerate && !isLoading
//               ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
//               : 'bg-gray-800 text-gray-500 cursor-not-allowed'
//           }`}
//         >
//           {isLoading ? (
//             <>
//               <Loader className="h-5 w-5 animate-spin" />
//               Processing...
//             </>
//           ) : (
//             <>
//               <Zap className="h-5 w-5" />
//               Generate Video
//             </>
//           )}
//         </button>
        
//         {generatedVideo && (
//           <button
//             onClick={downloadVideo}
//             className="w-full flex items-center justify-center gap-3 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl text-white font-medium transition-all"
//           >
//             <Download className="h-5 w-5" />
//             Download Video ({videoInfo?.size}MB)
//           </button>
//         )}
//       </div>

//       {/* Security Info */}
//       <div className="mt-4 p-4 bg-gray-800/30 rounded-xl">
//         <div className="flex items-start gap-3">
//           <Shield className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
//           <div className="space-y-2">
//             <p className="text-sm font-medium text-gray-300">100% Secure Processing</p>
//             <ul className="text-xs text-gray-400 space-y-1">
//               <li className="flex items-start gap-2">
//                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1"></div>
//                 <span>All processing happens in your browser</span>
//               </li>
//               <li className="flex items-start gap-2">
//                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1"></div>
//                 <span>No data is sent to any server</span>
//               </li>
//               <li className="flex items-start gap-2">
//                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1"></div>
//                 <span>Native browser API - instant and fast</span>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </div>

//       {/* System Status */}
//       <div className="mt-4 p-3 bg-gray-800/20 rounded-lg">
//         <div className="flex items-center justify-between text-xs">
//           <div className="flex items-center gap-2 text-gray-400">
//             <HardDrive className="h-3 w-3" />
//             <span>Local Processing</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
//             <span className="text-green-400">Active</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VideoGenerator;
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Video, Download, Play, Trash2, Upload, Loader, Settings } from 'lucide-react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export default function VideoGenerator() {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState({ title: '', content: '', image: null });
  const [voice, setVoice] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle');
  const [videoInfo, setVideoInfo] = useState(null);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [debugLog, setDebugLog] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [controls, setControls] = useState({
    slideDuration: 3,
    fontSize: 32,
    bgColor: '#1F2937'
  });

  const ffmpegRef = useRef(new FFmpeg());
  const [ffmpegLoaded, setFFmpegLoaded] = useState(false);

  const addDebugLog = (message) => {
    setDebugLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // Load FFmpeg
  useEffect(() => {
    loadFFmpeg();
  }, []);

  const loadFFmpeg = async () => {
    try {
      addDebugLog('FFmpeg loading...');
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      const ffmpeg = ffmpegRef.current;
      
      ffmpeg.on('log', ({ message }) => {
        console.log('FFmpeg:', message);
      });

      ffmpeg.on('progress', ({ progress: prog, time }) => {
        if (status === 'encoding') {
          setProgress(Math.min(95, Math.round(prog * 100)));
          addDebugLog(`Encoding: ${Math.round(prog * 100)}% (${(time / 1000000).toFixed(1)}s)`);
        }
      });

      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      setFFmpegLoaded(true);
      addDebugLog('✅ FFmpeg loaded successfully!');
    } catch (error) {
      addDebugLog(`❌ FFmpeg load error: ${error.message}`);
      setLoadError('FFmpeg load nahi ho saka. Page refresh karein.');
    }
  };

  const addSlide = () => {
    if (currentSlide.title || currentSlide.content || currentSlide.image) {
      setSlides([...slides, { ...currentSlide, id: Date.now() }]);
      setCurrentSlide({ title: '', content: '', image: null });
    }
  };

  const deleteSlide = (id) => {
    setSlides(slides.filter(s => s.id !== id));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCurrentSlide({ ...currentSlide, image: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVoice(file);
      addDebugLog(`Audio file uploaded: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    }
  };

  // Generate slide as canvas and return blob
  const generateSlideImage = async (slide, index) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = controls.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Background image if exists
    if (slide.image) {
      const img = new Image();
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = slide.image;
      });
      
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      
      // Dark overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Title
    if (slide.title) {
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${controls.fontSize + 16}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(slide.title, canvas.width / 2, 200);
    }

    // Content
    if (slide.content) {
      ctx.fillStyle = '#e5e7eb';
      ctx.font = `${controls.fontSize}px Arial`;
      ctx.textAlign = 'center';
      
      const words = slide.content.split(' ');
      let line = '';
      let y = 300;
      
      for (let word of words) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > canvas.width - 200 && line !== '') {
          ctx.fillText(line, canvas.width / 2, y);
          line = word + ' ';
          y += controls.fontSize + 10;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, canvas.width / 2, y);
    }

    // Slide number
    ctx.fillStyle = '#9ca3af';
    ctx.font = '24px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`${index + 1}/${slides.length}`, canvas.width - 40, canvas.height - 40);

    return new Promise(resolve => {
      canvas.toBlob(resolve, 'image/png');
    });
  };

  const generateVideo = async () => {
    if (slides.length === 0) {
      alert('Please add some content first.');
      return;
    }

    if (!ffmpegLoaded) {
      alert('FFmpeg abhi load ho raha hai, thoda wait karein...');
      return;
    }

    addDebugLog('🎬 Video generation शुरू...');
    setIsLoading(true);
    setStatus('preparing');
    setProgress(0);
    setLoadError('');
    setDebugLog([]);

    try {
      const ffmpeg = ffmpegRef.current;
      const duration = controls.slideDuration || 3;
      const fps = 30;

      // Step 1: Generate all slide images
      setStatus('generating_slides');
      addDebugLog(`Step 1: ${slides.length} slides generate कर रहे हैं...`);
      
      const slideBlobs = [];
      for (let i = 0; i < slides.length; i++) {
        const blob = await generateSlideImage(slides[i], i);
        slideBlobs.push(blob);
        setProgress(Math.round((i + 1) / slides.length * 30));
        addDebugLog(`Slide ${i + 1}/${slides.length} generated`);
      }

      // Step 2: Write slide images to FFmpeg filesystem
      setStatus('preparing_ffmpeg');
      addDebugLog('Step 2: Images FFmpeg में load कर रहे हैं...');
      
      for (let i = 0; i < slideBlobs.length; i++) {
        const fileName = `slide${String(i).padStart(3, '0')}.png`;
        await ffmpeg.writeFile(fileName, await fetchFile(slideBlobs[i]));
        setProgress(30 + Math.round((i + 1) / slideBlobs.length * 20));
      }

      // Step 3: Write audio if exists
      let hasAudio = false;
      if (voice) {
        addDebugLog('Step 3: Audio file load कर रहे हैं...');
        await ffmpeg.writeFile('audio.mp3', await fetchFile(voice));
        hasAudio = true;
        setProgress(52);
      }

      // Step 4: Create concat file for slides
      setStatus('encoding');
      addDebugLog('Step 4: Video encoding शुरू...');
      
      let concatContent = '';
      for (let i = 0; i < slides.length; i++) {
        concatContent += `file 'slide${String(i).padStart(3, '0')}.png'\n`;
        concatContent += `duration ${duration}\n`;
      }
      // Add last image again for proper duration
      concatContent += `file 'slide${String(slides.length - 1).padStart(3, '0')}.png'\n`;
      
      await ffmpeg.writeFile('concat.txt', new TextEncoder().encode(concatContent));

      // Step 5: Run FFmpeg command
      addDebugLog('Step 5: FFmpeg command चला रहे हैं...');
      
      const totalDuration = slides.length * duration;
      
      if (hasAudio) {
        // With audio
        addDebugLog('Video with audio बना रहे हैं...');
        await ffmpeg.exec([
          '-f', 'concat',
          '-safe', '0',
          '-i', 'concat.txt',
          '-i', 'audio.mp3',
          '-r', String(fps),
          '-vf', 'scale=1280:720',
          '-c:v', 'libx264',
          '-preset', 'medium',
          '-crf', '23',
          '-pix_fmt', 'yuv420p',
          '-c:a', 'aac',
          '-b:a', '128k',
          '-shortest',
          '-movflags', '+faststart',
          '-y',
          'output.mp4'
        ]);
      } else {
        // Without audio
        addDebugLog('Video without audio बना रहे हैं...');
        await ffmpeg.exec([
          '-f', 'concat',
          '-safe', '0',
          '-i', 'concat.txt',
          '-r', String(fps),
          '-vf', 'scale=1280:720',
          '-c:v', 'libx264',
          '-preset', 'medium',
          '-crf', '23',
          '-pix_fmt', 'yuv420p',
          '-movflags', '+faststart',
          '-t', String(totalDuration),
          '-y',
          'output.mp4'
        ]);
      }

      // Step 6: Read output video
      setStatus('finalizing');
      addDebugLog('Step 6: Output video read कर रहे हैं...');
      setProgress(95);
      
      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data.buffer], { type: 'video/mp4' });
      
      addDebugLog(`✅ Video created: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);

      // Create download URL
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setGeneratedVideo(blob);

      setVideoInfo({
        duration: totalDuration.toFixed(1),
        size: (blob.size / 1024 / 1024).toFixed(2),
        resolution: '1280x720',
        format: 'MP4',
        codec: hasAudio ? 'H.264 + AAC' : 'H.264'
      });

      setStatus('completed');
      setProgress(100);
      addDebugLog('🎉 Video successfully generated!');
      
      // Auto download
      downloadVideo(blob);

    } catch (error) {
      addDebugLog(`❌ Error: ${error.message}`);
      console.error('Video generation error:', error);
      setStatus('error');
      setLoadError(error.message);
      alert(`Generation failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadVideo = (blob = generatedVideo) => {
    if (!blob) return;
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `video_${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addDebugLog('📥 Video downloaded!');
  };

  const getStatusText = () => {
    switch (status) {
      case 'preparing': return 'तैयारी हो रही है...';
      case 'generating_slides': return 'Slides बना रहे हैं...';
      case 'preparing_ffmpeg': return 'FFmpeg में load हो रहा है...';
      case 'encoding': return 'Video encode हो रही है...';
      case 'finalizing': return 'अंतिम processing...';
      case 'completed': return '✅ Video तैयार है!';
      case 'error': return '❌ Error आया';
      default: return 'Ready';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Video className="w-12 h-12" />
            AI Video Generator
          </h1>
          <p className="text-gray-300">FFmpeg-powered professional video generation</p>
          {!ffmpegLoaded && (
            <div className="mt-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
              <p className="text-yellow-200 flex items-center justify-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                FFmpeg loading... Please wait
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Input */}
          <div className="space-y-6">
            {/* Settings Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 block mb-2">
                    Slide Duration (seconds): {controls.slideDuration}
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    value={controls.slideDuration}
                    onChange={(e) => setControls({...controls, slideDuration: Number(e.target.value)})}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 block mb-2">
                    Font Size: {controls.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="48"
                    value={controls.fontSize}
                    onChange={(e) => setControls({...controls, fontSize: Number(e.target.value)})}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 block mb-2">Background Color</label>
                  <input
                    type="color"
                    value={controls.bgColor}
                    onChange={(e) => setControls({...controls, bgColor: e.target.value})}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Add Slide Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4">Add Slide</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Slide Title"
                  value={currentSlide.title}
                  onChange={(e) => setCurrentSlide({...currentSlide, title: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <textarea
                  placeholder="Slide Content"
                  value={currentSlide.content}
                  onChange={(e) => setCurrentSlide({...currentSlide, content: e.target.value})}
                  rows="4"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Background Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-purple-500 file:text-white file:cursor-pointer hover:file:bg-purple-600"
                  />
                </div>
                <button
                  onClick={addSlide}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Slide
                </button>
              </div>
            </div>

            {/* Voice Upload Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4">Audio/Voice (Optional)</h2>
              <input
                type="file"
                accept="audio/*"
                onChange={handleVoiceUpload}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-green-500 file:text-white file:cursor-pointer hover:file:bg-green-600"
              />
              {voice && (
                <p className="text-green-400 mt-2 text-sm">✓ {voice.name}</p>
              )}
            </div>

            {/* Slides Preview */}
            {slides.length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4">Slides ({slides.length})</h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {slides.map((slide, index) => (
                    <div key={slide.id} className="bg-white/5 p-3 rounded-lg flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-white font-semibold">{index + 1}. {slide.title || 'Untitled'}</p>
                        <p className="text-gray-400 text-sm truncate">{slide.content}</p>
                      </div>
                      <button
                        onClick={() => deleteSlide(slide.id)}
                        className="text-red-400 hover:text-red-300 ml-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Output */}
          <div className="space-y-6">
            {/* Generate Button */}
            <button
              onClick={generateVideo}
              disabled={isLoading || slides.length === 0 || !ffmpegLoaded}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <Loader className="w-6 h-6 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Video className="w-6 h-6" />
                  Generate Video
                </>
              )}
            </button>

            {/* Progress */}
            {isLoading && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="space-y-4">
                  <div className="flex justify-between text-white">
                    <span>{getStatusText()}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {loadError && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-6">
                <p className="text-red-200">❌ {loadError}</p>
              </div>
            )}

            {/* Video Preview */}
            {videoUrl && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4">Preview</h2>
                <video
                  src={videoUrl}
                  controls
                  className="w-full rounded-lg"
                />
                {videoInfo && (
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/5 p-3 rounded">
                      <p className="text-gray-400">Duration</p>
                      <p className="text-white font-semibold">{videoInfo.duration}s</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded">
                      <p className="text-gray-400">Size</p>
                      <p className="text-white font-semibold">{videoInfo.size} MB</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded">
                      <p className="text-gray-400">Format</p>
                      <p className="text-white font-semibold">{videoInfo.format}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded">
                      <p className="text-gray-400">Codec</p>
                      <p className="text-white font-semibold">{videoInfo.codec}</p>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => downloadVideo()}
                  className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Video
                </button>
              </div>
            )}

            {/* Debug Log */}
            {debugLog.length > 0 && (
              <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4">Debug Log</h2>
                <div className="bg-black/60 rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-xs space-y-1">
                  {debugLog.map((log, i) => (
                    <div key={i} className="text-green-400">{log}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}