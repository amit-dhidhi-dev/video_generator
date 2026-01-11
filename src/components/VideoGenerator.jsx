// import React, { useState, useEffect } from 'react';
// import { FFmpeg } from '@ffmpeg/ffmpeg';
// import { fetchFile, toBlobURL } from '@ffmpeg/util';
// import { 
//   Video, 
//   Download, 
//   Settings, 
//   Loader, 
//   CheckCircle, 
//   AlertCircle,
//   Clock,
//   FileVideo,
//   Sparkles,
//   Zap
// } from 'lucide-react';

// const VideoGenerator = ({ slides, voice, controls, image, story }) => {
//   const [ffmpeg, setFfmpeg] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [status, setStatus] = useState('idle');
//   const [generatedVideo, setGeneratedVideo] = useState(null);
//   const [videoUrl, setVideoUrl] = useState('');
//   const [videoInfo, setVideoInfo] = useState(null);

//   // Initialize FFmpeg
//   useEffect(() => {
//     const loadFFmpeg = async () => {
//       const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
//       const ffmpegInstance = new FFmpeg();
    
//       ffmpegInstance.on('log', ({ message }) => {
//         console.log('FFmpeg log:', message);
//       });
      
//       ffmpegInstance.on('progress', ({ progress: p }) => {       
//         setProgress(Math.round(p * 100));
//       });
      
//       await ffmpegInstance.load({
//         coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
//         wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'text/javascript'),
//       });
      
//       setFfmpeg(ffmpegInstance);
//     };
    
//     loadFFmpeg();
  
//   }, []);

//   const generateSlidesAsImages = async () => {
//     const slideImages = [];
    
//     for (let i = 0; i < slides.length; i++) {
//       const slide = slides[i];
//       const canvas = document.createElement('canvas');
//       canvas.width = 1920;
//       canvas.height = 1080;
//       const ctx = canvas.getContext('2d');
      
//       // Create temporary image to draw
//       const img = new Image();
//       await new Promise((resolve) => {
//         img.onload = resolve;
//         img.src = slide.image;
//       });
      
//       // Apply blur effect
//       ctx.filter = `blur(${controls.blurAmount}px) brightness(${controls.brightness}%) contrast(${controls.contrast}%)`;
//       ctx.drawImage(img, 0, 0, 1920, 1080);
//       ctx.filter = 'none';
      
//       // Add overlay
//       ctx.fillStyle = controls.backgroundColor;
//       ctx.fillRect(0, 0, 1920, 1080);
      
//       // Add text with proper positioning
//       ctx.fillStyle = controls.textColor;
//       ctx.font = `${controls.fontSize}px ${controls.fontFamily}`;
//       ctx.textAlign = controls.textPosition === 'left' ? 'left' : 
//                      controls.textPosition === 'right' ? 'right' : 'center';
      
//       const textX = controls.textPosition === 'left' ? 100 :
//                    controls.textPosition === 'right' ? 1820 : 960;
//       const textY = controls.textPosition === 'top' ? 200 :
//                    controls.textPosition === 'bottom' ? 880 : 540;
      
//       // Wrap text
//       const words = slide.text.split(' ');
//       let line = '';
//       let y = textY;
//       const lineHeight = controls.fontSize * 1.5;
      
//       for (let word of words) {
//         const testLine = line + word + ' ';
//         const metrics = ctx.measureText(testLine);
        
//         if (metrics.width > 1600 && line !== '') {
//           ctx.fillText(line, textX, y);
//           line = word + ' ';
//           y += lineHeight;
//         } else {
//           line = testLine;
//         }
//       }
//       ctx.fillText(line, textX, y);
      
//       // Convert to blob
//       const blob = await new Promise(resolve => {
//         canvas.toBlob(resolve, 'image/png');
//       });
      
//       slideImages.push(blob);
//     }
    
//     return slideImages;
//   };

//   const generateVideo = async () => {
//     if (!ffmpeg || slides.length === 0) {
//       alert('Please wait for FFmpeg to load and add content first');
//       return;
//     }
//     console.log('Starting video generation process...');
//     setIsLoading(true);
//     setStatus('preparing');
//     setProgress(0);
    
//     try {
//       // Step 1: Generate slide images
//       setStatus('generating_slides');
//       const slideImages = await generateSlidesAsImages();
      
//       // Step 2: Write images to FFmpeg
//       setStatus('writing_files');
//       for (let i = 0; i < slideImages.length; i++) {
//         await ffmpeg.writeFile(`slide_${i}.png`, await fetchFile(slideImages[i]));
//       }
      
//       // Step 3: Write audio if exists
//       if (voice) {
//         await ffmpeg.writeFile('audio.mp3', await fetchFile(voice));
//       }
      
//       // Step 4: Create video from slides
//       setStatus('creating_video');
//       const slideDuration = controls.slideDuration;
      
//       const args = [
//         '-framerate', `1/${slideDuration}`,
//         '-i', 'slide_%d.png',
//         '-c:v', 'libx264',
//         '-pix_fmt', 'yuv420p',
//         '-vf', 'scale=1920:1080',
//         '-r', '30',
//       ];
      
//       // Add audio if exists
//       if (voice) {
//         args.push('-i', 'audio.mp3', '-c:a', 'aac', '-shortest');
//       } else {
//         args.push('-t', `${slides.length * slideDuration}`);
//       }
      
//       args.push('output.mp4');
      
//       await ffmpeg.exec(args);
      
//       // Step 5: Read the output
//       setStatus('reading_output');
//       const data = await ffmpeg.readFile('output.mp4');
      
//       // Step 6: Create video URL
//       const blob = new Blob([data.buffer], { type: 'video/mp4' });
//       const url = URL.createObjectURL(blob);
      
//       setVideoUrl(url);
//       setGeneratedVideo(blob);
      
//       // Calculate video info
//       const video = document.createElement('video');
//       video.src = url;
//       await new Promise((resolve) => {
//         video.onloadedmetadata = resolve;
//       });
      
//       setVideoInfo({
//         duration: video.duration.toFixed(1),
//         size: (blob.size / 1024 / 1024).toFixed(2),
//         resolution: '1920x1080',
//         format: 'MP4'
//       });
      
//       setStatus('completed');
      
//     } catch (error) {
//       console.error('Error generating video:', error);
//       setStatus('error');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const downloadVideo = () => {
//     if (generatedVideo) {
//       const link = document.createElement('a');
//       link.href = videoUrl;
//       link.download = `video-${Date.now()}.mp4`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     }
//   };

//   const getStatusMessage = () => {
//     const messages = {
//       preparing: 'Initializing video generator...',
//       generating_slides: 'Creating slide images...',
//       writing_files: 'Preparing files for processing...',
//       creating_video: 'Encoding video (this may take a minute)...',
//       reading_output: 'Finalizing video...',
//       completed: 'Video generated successfully!',
//       error: 'Error generating video. Please try again.'
//     };
//     return messages[status] || 'Ready to generate';
//   };

//   const isReadyToGenerate = ffmpeg && slides.length > 0 && image && story; 
//   const totalDuration = slides.length * controls.slideDuration;

//   return (
//     <div className="glass-card p-6">
//       <div className="flex items-center gap-3 mb-6">
//         <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg">
//           <Video className="h-5 w-5 text-white" />
//         </div>
//         <div>
//           <h2 className="text-xl font-semibold">Generate Video</h2>
//           <p className="text-sm text-gray-400">Create your final video</p>
//         </div>
//       </div>

//       {/* Requirements Checklist */}
//       <div className="mb-6 space-y-3">
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
//           {image && <span className="text-green-400 text-xs">✓ Ready</span>}
//         </div>
        
//         <div className="flex items-center justify-between text-sm">
//           <div className="flex items-center gap-2">
//             {story ? (
//               <CheckCircle className="h-4 w-4 text-green-400" />
//             ) : (
//               <AlertCircle className="h-4 w-4 text-yellow-400" />
//             )}
//             <span className={story ? 'text-gray-300' : 'text-gray-500'}>
//               Story Content ({slides.length} slides)
//             </span>
//           </div>
//           {story && (
//             <span className="text-green-400 text-xs">
//               {slides.length} slides
//             </span>
//           )}
//         </div>
        
//         <div className="flex items-center justify-between text-sm">
//           <div className="flex items-center gap-2">
//             {voice ? (
//               <CheckCircle className="h-4 w-4 text-green-400" />
//             ) : (
//               <AlertCircle className="h-4 w-4 text-yellow-400" />
//             )}
//             <span className={voice ? 'text-gray-300' : 'text-gray-500'}>
//               Voice Audio (Optional)
//             </span>
//           </div>
//           {voice && <span className="text-green-400 text-xs">✓ Added</span>}
//         </div>
        
//         <div className="flex items-center justify-between text-sm">
//           <div className="flex items-center gap-2">
//             {ffmpeg ? (
//               <CheckCircle className="h-4 w-4 text-green-400" />
//             ) : (
//               <Loader className="h-4 w-4 text-yellow-400 animate-spin" />
//             )}
//             <span className={ffmpeg ? 'text-gray-300' : 'text-gray-500'}>
//               Video Processor
//             </span>
//           </div>
//           {ffmpeg ? (
//             <span className="text-green-400 text-xs">✓ Loaded</span>
//           ) : (
//             <span className="text-yellow-400 text-xs">Loading...</span>
//           )}
//         </div>
//       </div>

//       {/* Video Info Summary */}
//       {slides.length > 0 && (
//         <div className="mb-6 p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50">
//           <div className="flex items-center justify-between mb-3">
//             <h3 className="font-medium flex items-center gap-2">
//               <Sparkles className="h-4 w-4 text-blue-400" />
//               Video Summary
//             </h3>
//             <div className="flex items-center gap-2 text-sm text-gray-400">
//               <Clock className="h-4 w-4" />
//               {totalDuration}s total
//             </div>
//           </div>
          
//           <div className="grid grid-cols-3 gap-4">
//             <div className="text-center">
//               <div className="text-2xl font-bold text-white">{slides.length}</div>
//               <div className="text-xs text-gray-400">Slides</div>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold text-white">{controls.slideDuration}s</div>
//               <div className="text-xs text-gray-400">Per Slide</div>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold text-white">
//                 {voice ? 'Yes' : 'No'}
//               </div>
//               <div className="text-xs text-gray-400">Audio</div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Progress Bar */}
//       {isLoading && (
//         <div className="mb-6 space-y-3">
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
//         </div>
//       )}

//       {/* Generated Video Preview */}
//       {generatedVideo && (
//         <div className="mb-6 space-y-4">
//           <div className="flex items-center justify-between">
//             <h3 className="font-medium flex items-center gap-2">
//               <FileVideo className="h-4 w-4 text-green-400" />
//               Generated Video
//             </h3>
//             {videoInfo && (
//               <div className="text-xs text-gray-400">
//                 {videoInfo.duration}s • {videoInfo.size}MB
//               </div>
//             )}
//           </div>
          
//           <div className="relative rounded-lg overflow-hidden bg-black">
//             <video
//               src={videoUrl}
//               controls
//               className="w-full h-48 object-contain"
//             />
//           </div>
          
//           {videoInfo && (
//             <div className="grid grid-cols-2 gap-4 text-sm">
//               <div className="p-3 bg-gray-800/50 rounded-lg">
//                 <div className="text-gray-400">Resolution</div>
//                 <div className="font-medium">{videoInfo.resolution}</div>
//               </div>
//               <div className="p-3 bg-gray-800/50 rounded-lg">
//                 <div className="text-gray-400">Format</div>
//                 <div className="font-medium">{videoInfo.format}</div>
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
//           className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-medium transition-all ${
//             isReadyToGenerate && !isLoading
//               ? 'btn-primary'
//               : 'bg-gray-800 text-gray-500 cursor-not-allowed'
//           }`}
//         >
//           {isLoading ? (
//             <>
//               <Loader className="h-5 w-5 animate-spin" />
//               Generating...
//             </>
//           ) : (
//             <>
//               <Zap className="h-5 w-5" />
//               Generate Video Now
//             </>
//           )}
//         </button>
        
//         {generatedVideo && (
//           <button
//             onClick={downloadVideo}
//             className="w-full btn-secondary flex items-center justify-center gap-3 py-4"
//           >
//             <Download className="h-5 w-5" />
//             Download Video ({videoInfo?.size}MB)
//           </button>
//         )}
//       </div>

//       {/* Tips & Info */}
//       <div className="mt-6 p-4 bg-gray-800/30 rounded-lg">
//         <div className="flex items-start gap-3">
//           <Settings className="h-5 w-5 text-gray-500 flex-shrink-0" />
//           <div className="space-y-2">
//             <p className="text-sm font-medium text-gray-300">Generation Tips</p>
//             <ul className="text-xs text-gray-400 space-y-1">
//               <li>• Video generation happens entirely in your browser</li>
//               <li>• Processing time depends on video length and your device</li>
//               <li>• HD videos (1080p) are generated by default</li>
//               <li>• Your data never leaves your computer</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VideoGenerator;



// import React, { useState, useEffect, useRef } from 'react';
// import { FFmpeg } from '@ffmpeg/ffmpeg';
// import { fetchFile, toBlobURL } from '@ffmpeg/util';
// import { 
//   Video, 
//   Download, 
//   Settings, 
//   Loader, 
//   CheckCircle, 
//   AlertCircle,
//   Clock,
//   FileVideo,
//   Sparkles,
//   Zap,
//   HardDrive,
//   RefreshCw,
//   ExternalLink,
//   Info,
//   AlertTriangle,
//   User
// } from 'lucide-react';

// const VideoGenerator = ({ slides, voice, controls, image, story }) => {
//   const [ffmpeg, setFfmpeg] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [status, setStatus] = useState('idle');
//   const [generatedVideo, setGeneratedVideo] = useState(null);
//   const [videoUrl, setVideoUrl] = useState('');
//   const [videoInfo, setVideoInfo] = useState(null);
//   const [ffmpegStatus, setFfmpegStatus] = useState('checking'); // checking, loading, loaded, error
//   const [ffmpegLoadProgress, setFfmpegLoadProgress] = useState(0);
//   const [retryCount, setRetryCount] = useState(0);
  
//   const ffmpegRef = useRef(null);
//   const isInitializedRef = useRef(false);

//   // Check if FFmpeg is already loaded in localStorage
//   const checkFfmpegInStorage = () => {
//     try {
//       const stored = localStorage.getItem('ffmpeg_loaded');
//       const storedTimestamp = localStorage.getItem('ffmpeg_timestamp');
      
//       if (stored === 'true' && storedTimestamp) {
//         const hoursSinceLoad = (Date.now() - parseInt(storedTimestamp)) / (1000 * 60 * 60);
//         // Keep in storage for 24 hours
//         if (hoursSinceLoad < 24) {
//           return true;
//         }
//       }
//     } catch (err) {
//       console.log('Error reading from localStorage:', err);
//     }
//     return false;
//   };

//   // Mark FFmpeg as loaded in storage
//   const markFfmpegLoaded = () => {
//     try {
//       localStorage.setItem('ffmpeg_loaded', 'true');
//       localStorage.setItem('ffmpeg_timestamp', Date.now().toString());
//     } catch (err) {
//       console.log('Error saving to localStorage:', err);
//     }
//   };

//   // Initialize FFmpeg with improved loading
//   const initializeFFmpeg = async (retry = false) => {
//     // Prevent multiple initializations
//     if (ffmpegRef.current || isInitializedRef.current) {
//       return;
//     }

//     isInitializedRef.current = true;
//     setFfmpegStatus('loading');
    
//     try {
//       const ffmpegInstance = new FFmpeg();
//       ffmpegRef.current = ffmpegInstance;

//       // Setup logging
//       ffmpegInstance.on('log', ({ message, type }) => {
//         console.log(`FFmpeg ${type}:`, message);
//       });

//       // Setup progress for loading
//       ffmpegInstance.on('progress', ({ progress: p }) => {
//         const percent = Math.round(p * 100);
//         setFfmpegLoadProgress(percent);
//         console.log(`FFmpeg load progress: ${percent}%`);
//       });

//       // Use different CDN URLs for reliability
//       const baseURLs = [
//         'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd',
//         'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd',
//         'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm'
//       ];

//       let loadSuccessful = false;
      
//       for (let baseURL of baseURLs) {
//         try {
//           console.log(`Trying to load FFmpeg from: ${baseURL}`);
          
//           const coreURL = await toBlobURL(
//             `${baseURL}/ffmpeg-core.js`,
//             'text/javascript'
//           );
          
//           const wasmURL = await toBlobURL(
//             `${baseURL}/ffmpeg-core.wasm`,
//             'application/wasm'
//           );

//           await ffmpegInstance.load({
//             coreURL,
//             wasmURL,
//             workerURL: await toBlobURL(
//               `${baseURL}/ffmpeg-core.worker.js`,
//               'text/javascript'
//             ),
//           });

//           console.log('FFmpeg loaded successfully from:', baseURL);
//           loadSuccessful = true;
//           break;
//         } catch (err) {
//           console.warn(`Failed to load from ${baseURL}:`, err);
//           continue;
//         }
//       }

//       if (!loadSuccessful) {
//         throw new Error('Failed to load FFmpeg from all sources');
//       }

//       // Test FFmpeg with a simple command
//       try {
//         await ffmpegInstance.exec(['-version']);
//         console.log('FFmpeg test successful');
//       } catch (err) {
//         console.warn('FFmpeg test failed, but continuing anyway:', err);
//       }

//       setFfmpeg(ffmpegInstance);
//       setFfmpegStatus('loaded');
//       markFfmpegLoaded();
//       setFfmpegLoadProgress(100);
      
//       console.log('FFmpeg fully initialized and ready');

//     } catch (error) {
//       console.error('Error initializing FFmpeg:', error);
//       setFfmpegStatus('error');
//       isInitializedRef.current = false; // Allow retry
      
//       if (retryCount < 2 && !retry) {
//         setTimeout(() => {
//           setRetryCount(prev => prev + 1);
//           initializeFFmpeg(true);
//         }, 2000);
//       }
//     }
//   };

//   // Load FFmpeg on component mount
//   useEffect(() => {
//     console.log('VideoGenerator mounted, checking FFmpeg...');
    
//     // Check storage first
//     const isStored = checkFfmpegInStorage();
//     if (isStored) {
//       console.log('FFmpeg marked as loaded in storage');
//     }

//     // Start initialization
//     const timer = setTimeout(() => {
//       if (!ffmpegRef.current && !isInitializedRef.current) {
//         console.log('Starting FFmpeg initialization...');
//         initializeFFmpeg();
//       }
//     }, 500);

//     return () => {
//       clearTimeout(timer);
//       // Cleanup video URLs
//       if (videoUrl) {
//         URL.revokeObjectURL(videoUrl);
//       }
//     };
//   }, []);

//   // Improved slide image generation
//   const generateSlidesAsImages = async () => {
//     const slideImages = [];
//     const canvas = document.createElement('canvas');
//     canvas.width = 1920;
//     canvas.height = 1080;
//     const ctx = canvas.getContext('2d');
    
//     console.log(`Generating ${slides.length} slide images...`);
    
//     for (let i = 0; i < slides.length; i++) {
//       const slide = slides[i];
//       console.log(`Processing slide ${i + 1}/${slides.length}`);
      
//       try {
//         // Clear canvas
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
        
//         // Load background image
//         const img = new Image();
//         img.crossOrigin = 'anonymous';
        
//         await new Promise((resolve, reject) => {
//           img.onload = resolve;
//           img.onerror = () => {
//             console.warn(`Failed to load image for slide ${i}, using fallback`);
//             resolve();
//           };
//           img.src = slide.image;
//         });

//         // Draw background with effects
//         if (img.complete && img.naturalWidth !== 0) {
//           // Apply blur effect
//           ctx.save();
//           ctx.filter = `blur(${controls.blurAmount}px) brightness(${controls.brightness}%) contrast(${controls.contrast}%)`;
//           ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//           ctx.restore();
//         } else {
//           // Fallback gradient background
//           const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
//           gradient.addColorStop(0, '#667eea');
//           gradient.addColorStop(1, '#764ba2');
//           ctx.fillStyle = gradient;
//           ctx.fillRect(0, 0, canvas.width, canvas.height);
//         }

//         // Add overlay
//         ctx.fillStyle = controls.backgroundColor || 'rgba(0, 0, 0, 0.5)';
//         ctx.fillRect(0, 0, canvas.width, canvas.height);

//         // Prepare text rendering
//         ctx.fillStyle = controls.textColor || '#ffffff';
//         ctx.font = `bold ${controls.fontSize || 48}px "${controls.fontFamily || 'Arial'}"`;
//         ctx.textAlign = 'center';
//         ctx.textBaseline = 'middle';

//         // Calculate text position
//         let x = canvas.width / 2;
//         let y = canvas.height / 2;
        
//         // Adjust for different text positions
//         if (controls.textPosition?.includes('top')) {
//           y = canvas.height * 0.25;
//         } else if (controls.textPosition?.includes('bottom')) {
//           y = canvas.height * 0.75;
//         }
        
//         if (controls.textPosition?.includes('left')) {
//           x = canvas.width * 0.25;
//           ctx.textAlign = 'left';
//         } else if (controls.textPosition?.includes('right')) {
//           x = canvas.width * 0.75;
//           ctx.textAlign = 'right';
//         }

//         // Wrap text
//         const maxWidth = 1600;
//         const lineHeight = (controls.fontSize || 48) * 1.5;
//         const words = slide.text.split(' ');
//         let line = '';
//         let currentY = y - ((words.length > 10 ? Math.floor(words.length / 10) : 0) * lineHeight / 2);

//         for (let n = 0; n < words.length; n++) {
//           const testLine = line + words[n] + ' ';
//           const metrics = ctx.measureText(testLine);
          
//           if (metrics.width > maxWidth && n > 0) {
//             ctx.fillText(line, x, currentY);
//             line = words[n] + ' ';
//             currentY += lineHeight;
//           } else {
//             line = testLine;
//           }
//         }
//         ctx.fillText(line, x, currentY);

//         // Convert to blob
//         const blob = await new Promise(resolve => {
//           canvas.toBlob(blob => {
//             if (blob) {
//               resolve(blob);
//             } else {
//               // Fallback to a simple colored blob
//               canvas.toBlob(resolve, 'image/png');
//             }
//           }, 'image/png');
//         });

//         slideImages.push(blob);
        
//         // Update progress
//         setProgress(Math.round(((i + 1) / slides.length) * 25));
        
//       } catch (error) {
//         console.error(`Error generating slide ${i}:`, error);
//         // Create a simple colored slide as fallback
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         ctx.fillStyle = '#2D3748';
//         ctx.fillRect(0, 0, canvas.width, canvas.height);
//         ctx.fillStyle = '#ffffff';
//         ctx.font = '48px Arial';
//         ctx.textAlign = 'center';
//         ctx.fillText(`Slide ${i + 1}`, canvas.width / 2, canvas.height / 2);
        
//         const fallbackBlob = await new Promise(resolve => {
//           canvas.toBlob(resolve, 'image/png');
//         });
        
//         slideImages.push(fallbackBlob);
//       }
//     }
    
//     console.log(`Generated ${slideImages.length} slide images`);
//     return slideImages;
//   };

//   // Main video generation function
//   const generateVideo = async () => {
//     if (!ffmpeg) {
//       alert('FFmpeg is still loading. Please wait a moment and try again.');
//       return;
//     }
    
//     if (slides.length === 0) {
//       alert('Please add some slides first');
//       return;
//     }

//     console.log('Starting video generation process...');
//     setIsLoading(true);
//     setStatus('preparing');
//     setProgress(0);
    
//     try {
//       // Step 1: Generate slide images
//       setStatus('generating_slides');
//       console.log('Generating slide images...');
//       const slideImages = await generateSlidesAsImages();
      
//       // Step 2: Write images to FFmpeg
//       setStatus('writing_files');
//       console.log('Writing files to FFmpeg...');
//       for (let i = 0; i < slideImages.length; i++) {
//         await ffmpeg.writeFile(`slide_${i}.png`, await fetchFile(slideImages[i]));
//         setProgress(25 + Math.round((i / slideImages.length) * 25));
//       }
      
//       // Step 3: Write audio if exists
//       if (voice) {
//         console.log('Adding audio track...');
//         await ffmpeg.writeFile('audio.mp3', await fetchFile(voice));
//       }
      
//       // Step 4: Create video from slides
//       setStatus('creating_video');
//       console.log('Creating video...');
//       const slideDuration = controls.slideDuration;
      
//       // Build FFmpeg arguments
//       const args = [
//         '-framerate', `1/${slideDuration}`,
//         '-i', 'slide_%d.png',
//         '-c:v', 'libx264',
//         '-pix_fmt', 'yuv420p',
//         '-vf', 'scale=1920:1080',
//         '-r', '30',
//         '-preset', 'fast', // Faster encoding
//         '-crf', '23', // Good quality
//       ];
      
//       // Add audio if exists
//       if (voice) {
//         args.push('-i', 'audio.mp3', '-c:a', 'aac', '-b:a', '128k', '-shortest');
//       } else {
//         args.push('-t', `${slides.length * slideDuration}`);
//       }
      
//       args.push('output.mp4');
      
//       console.log('FFmpeg args:', args);
//       await ffmpeg.exec(args);
//       setProgress(75);
      
//       // Step 5: Read the output
//       setStatus('reading_output');
//       console.log('Reading output file...');
//       const data = await ffmpeg.readFile('output.mp4');
      
//       // Step 6: Create video URL
//       const blob = new Blob([data.buffer], { type: 'video/mp4' });
//       const url = URL.createObjectURL(blob);
      
//       setVideoUrl(url);
//       setGeneratedVideo(blob);
      
//       // Calculate video info
//       const video = document.createElement('video');
//       video.src = url;
      
//       await new Promise((resolve, reject) => {
//         video.onloadedmetadata = resolve;
//         video.onerror = reject;
//         setTimeout(resolve, 1000); // Fallback timeout
//       });
      
//       setVideoInfo({
//         duration: video.duration ? video.duration.toFixed(1) : 'Unknown',
//         size: (blob.size / 1024 / 1024).toFixed(2),
//         resolution: '1920x1080',
//         format: 'MP4',
//         codec: 'H.264/AAC'
//       });
      
//       setStatus('completed');
//       setProgress(100);
      
//       console.log('Video generation completed successfully!');
      
//       // Cleanup FFmpeg files
//       try {
//         for (let i = 0; i < slideImages.length; i++) {
//           await ffmpeg.deleteFile(`slide_${i}.png`);
//         }
//         if (voice) {
//           await ffmpeg.deleteFile('audio.mp3');
//         }
//         await ffmpeg.deleteFile('output.mp4');
//       } catch (cleanupError) {
//         console.warn('Error cleaning up files:', cleanupError);
//       }
      
//     } catch (error) {
//       console.error('Error generating video:', error);
//       setStatus('error');
//       alert(`Error generating video: ${error.message}. Please check console for details.`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const downloadVideo = () => {
//     if (generatedVideo && videoUrl) {
//       const link = document.createElement('a');
//       link.href = videoUrl;
//       link.download = `video-${new Date().toISOString().slice(0, 10)}-${Date.now()}.mp4`;
//       link.style.display = 'none';
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     }
//   };

//   const retryFfmpegLoad = () => {
//     setRetryCount(0);
//     setFfmpegStatus('checking');
//     isInitializedRef.current = false;
//     ffmpegRef.current = null;
//     initializeFFmpeg();
//   };

//   const getStatusMessage = () => {
//     const messages = {
//       preparing: 'Preparing video generation...',
//       generating_slides: 'Creating slide images...',
//       writing_files: 'Processing files...',
//       creating_video: 'Encoding video (this may take a moment)...',
//       reading_output: 'Finalizing video...',
//       completed: 'Video ready!',
//       error: 'Error occurred. Please try again.'
//     };
//     return messages[status] || 'Ready to generate';
//   };

//   const getFfmpegStatusMessage = () => {
//     const messages = {
//       checking: 'Checking video processor...',
//       loading: `Loading video processor... ${ffmpegLoadProgress}%`,
//       loaded: 'Video processor ready!',
//       error: 'Failed to load video processor'
//     };
//     return messages[ffmpegStatus] || 'Initializing...';
//   };

//   const isReadyToGenerate = ffmpeg && slides.length > 0 && image && story;
//   const totalDuration = slides.length * controls.slideDuration;

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
        
//         {ffmpegStatus === 'loaded' && (
//           <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
//             <HardDrive className="h-3 w-3" />
//             Ready
//           </div>
//         )}
//       </div>

//       {/* FFmpeg Status Indicator */}
//       {ffmpegStatus !== 'loaded' && (
//         <div className={`mb-4 p-3 rounded-xl ${
//           ffmpegStatus === 'loading' ? 'bg-blue-500/10 border border-blue-500/20' :
//           ffmpegStatus === 'error' ? 'bg-red-500/10 border border-red-500/20' :
//           'bg-yellow-500/10 border border-yellow-500/20'
//         }`}>
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               {ffmpegStatus === 'loading' && <Loader className="h-4 w-4 text-blue-400 animate-spin" />}
//               {ffmpegStatus === 'error' && <AlertTriangle className="h-4 w-4 text-red-400" />}
//               {ffmpegStatus === 'checking' && <Loader className="h-4 w-4 text-yellow-400 animate-spin" />}
//               <span className={`text-sm ${
//                 ffmpegStatus === 'loading' ? 'text-blue-400' :
//                 ffmpegStatus === 'error' ? 'text-red-400' :
//                 'text-yellow-400'
//               }`}>
//                 {getFfmpegStatusMessage()}
//               </span>
//             </div>
            
//             {ffmpegStatus === 'error' && retryCount < 2 && (
//               <button
//                 onClick={retryFfmpegLoad}
//                 className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
//               >
//                 <RefreshCw className="h-3 w-3" />
//                 Retry
//               </button>
//             )}
//           </div>
          
//           {ffmpegStatus === 'loading' && (
//             <div className="mt-2">
//               <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
//                 <div 
//                   className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
//                   style={{ width: `${ffmpegLoadProgress}%` }}
//                 />
//               </div>
//               <div className="text-xs text-gray-400 mt-1">
//                 Initializing video processing engine...
//               </div>
//             </div>
//           )}
          
//           {ffmpegStatus === 'error' && retryCount >= 2 && (
//             <div className="mt-2 text-xs text-gray-400">
//               <p>If video processor fails to load:</p>
//               <ul className="list-disc list-inside mt-1">
//                 <li>Check your internet connection</li>
//                 <li>Try refreshing the page</li>
//                 <li>Make sure WebAssembly is enabled in your browser</li>
//               </ul>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Requirements Checklist */}
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
//           {image && <span className="text-green-400 text-xs">✓ Ready</span>}
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
//             {voice ? (
//               <CheckCircle className="h-4 w-4 text-green-400" />
//             ) : (
//               <div className="text-gray-500">—</div>
//             )}
//             <span className={voice ? 'text-gray-300' : 'text-gray-500'}>
//               Voice Audio
//             </span>
//           </div>
//           {voice && <span className="text-green-400 text-xs">✓ Added</span>}
//         </div>
        
//         <div className="flex items-center justify-between text-sm">
//           <div className="flex items-center gap-2">
//             {ffmpeg ? (
//               <CheckCircle className="h-4 w-4 text-green-400" />
//             ) : (
//               <Loader className="h-4 w-4 text-yellow-400 animate-spin" />
//             )}
//             <span className={ffmpeg ? 'text-gray-300' : 'text-gray-500'}>
//               Video Processor
//             </span>
//           </div>
//           {ffmpeg ? (
//             <span className="text-green-400 text-xs">✓ Loaded</span>
//           ) : (
//             <span className="text-yellow-400 text-xs">Loading...</span>
//           )}
//         </div>
//       </div>

//       {/* Video Info Summary */}
//       {slides.length > 0 && (
//         <div className="mb-4 p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50">
//           <div className="flex items-center justify-between mb-3">
//             <h3 className="font-medium flex items-center gap-2 text-white">
//               <Sparkles className="h-4 w-4 text-blue-400" />
//               Video Summary
//             </h3>
//             <div className="flex items-center gap-2 text-sm text-gray-400">
//               <Clock className="h-4 w-4" />
//               {totalDuration}s total
//             </div>
//           </div>
          
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//             <div className="text-center p-2 bg-gray-800/30 rounded-lg">
//               <div className="text-xl font-bold text-white">{slides.length}</div>
//               <div className="text-xs text-gray-400">Slides</div>
//             </div>
//             <div className="text-center p-2 bg-gray-800/30 rounded-lg">
//               <div className="text-xl font-bold text-white">{controls.slideDuration}s</div>
//               <div className="text-xs text-gray-400">Per Slide</div>
//             </div>
//             <div className="text-center p-2 bg-gray-800/30 rounded-lg">
//               <div className="text-xl font-bold text-white">
//                 {voice ? 'Yes' : 'No'}
//               </div>
//               <div className="text-xs text-gray-400">Audio</div>
//             </div>
//             <div className="text-center p-2 bg-gray-800/30 rounded-lg">
//               <div className="text-xl font-bold text-white">HD</div>
//               <div className="text-xs text-gray-400">1080p</div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Progress Bar during generation */}
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
//           <div className="text-xs text-gray-400 text-center">
//             Processing in browser - this may take a minute
//           </div>
//         </div>
//       )}

//       {/* Generated Video Preview */}
//       {generatedVideo && (
//         <div className="mb-4 space-y-4">
//           <div className="flex items-center justify-between">
//             <h3 className="font-medium flex items-center gap-2 text-white">
//               <FileVideo className="h-4 w-4 text-green-400" />
//               Generated Video
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
//           disabled={!isReadyToGenerate || isLoading || ffmpegStatus !== 'loaded'}
//           className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl font-medium transition-all ${
//             isReadyToGenerate && !isLoading && ffmpegStatus === 'loaded'
//               ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
//               : 'bg-gray-800 text-gray-500 cursor-not-allowed'
//           }`}
//         >
//           {isLoading ? (
//             <>
//               <Loader className="h-5 w-5 animate-spin" />
//               Generating Video...
//             </>
//           ) : (
//             <>
//               <Zap className="h-5 w-5" />
//               Generate Video Now
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

//       {/* Tips & Info */}
//       <div className="mt-4 p-4 bg-gray-800/30 rounded-xl">
//         <div className="flex items-start gap-3">
//           <Info className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
//           <div className="space-y-2">
//             <p className="text-sm font-medium text-gray-300">Important Notes</p>
//             <ul className="text-xs text-gray-400 space-y-1">
//               <li className="flex items-start gap-2">
//                 <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1"></div>
//                 <span>Video processing happens 100% in your browser</span>
//               </li>
//               <li className="flex items-start gap-2">
//                 <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1"></div>
//                 <span>No data is sent to any server - completely private</span>
//               </li>
//               <li className="flex items-start gap-2">
//                 <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1"></div>
//                 <span>Processor caches for 24 hours for faster loading</span>
//               </li>
//               <li className="flex items-start gap-2">
//                 <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1"></div>
//                 <span>Longer videos require more processing time</span>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </div>

//       {/* System Status */}
//       <div className="mt-4 p-3 bg-gray-800/20 rounded-lg">
//         <div className="flex items-center justify-between text-xs">
//           <div className="flex items-center gap-2 text-gray-400">
//             <User className="h-3 w-3" />
//             <span>Browser Processing</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className={`w-2 h-2 rounded-full ${ffmpeg ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
//             <span className={ffmpeg ? 'text-green-400' : 'text-yellow-400'}>
//               {ffmpeg ? 'Active' : 'Initializing'}
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VideoGenerator;



// 
// import React, { useState, useEffect, useRef } from 'react';
// import { FFmpeg } from '@ffmpeg/ffmpeg';
// import { fetchFile } from '@ffmpeg/util';
// import { 
//   Video, 
//   Download, 
//   Settings, 
//   Loader, 
//   CheckCircle, 
//   AlertCircle,
//   Clock,
//   FileVideo,
//   Sparkles,
//   Zap,
//   HardDrive,
//   RefreshCw,
//   Info,
//   AlertTriangle,
//   User,
//   Cpu,
//   Shield
// } from 'lucide-react';

// const VideoGenerator = ({ slides, voice, controls, image, story }) => {
//   const [ffmpeg, setFfmpeg] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [status, setStatus] = useState('idle');
//   const [generatedVideo, setGeneratedVideo] = useState(null);
//   const [videoUrl, setVideoUrl] = useState('');
//   const [videoInfo, setVideoInfo] = useState(null);
//   const [ffmpegStatus, setFfmpegStatus] = useState('checking');
//   const [ffmpegLoadProgress, setFfmpegLoadProgress] = useState(0);
//   const [loadError, setLoadError] = useState('');
  
//   const isInitializedRef = useRef(false);

//   // Initialize FFmpeg
//   const initializeFFmpeg = async () => {
//     if (isInitializedRef.current || ffmpeg) return;
    
//     isInitializedRef.current = true;
//     setFfmpegStatus('loading');
//     setLoadError('');
    
//     try {
//       console.log('Initializing FFmpeg...');
      
//       // Create FFmpeg instance
//       const ffmpegInstance = new FFmpeg();
      
//       // Set up logging
//       ffmpegInstance.on('log', ({ type, message }) => {
//         console.log(`FFmpeg ${type}:`, message);
//       });
      
//       // Set up progress for loading
//       ffmpegInstance.on('progress', ({ progress: p }) => {
//         const percent = Math.round(p * 100);
//         setFfmpegLoadProgress(percent);
//       });
      
//       // Load FFmpeg
//       console.log('Loading FFmpeg core...');
//       await ffmpegInstance.load({
//         coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js',
//         wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.wasm',
//       });
      
//       console.log('FFmpeg loaded successfully!');
//       setFfmpeg(ffmpegInstance);
//       setFfmpegStatus('loaded');
//       setFfmpegLoadProgress(100);
      
//       // Store in localStorage
//       localStorage.setItem('ffmpeg_loaded', 'true');
//       localStorage.setItem('ffmpeg_timestamp', Date.now().toString());
      
//     } catch (error) {
//       console.error('Error initializing FFmpeg:', error);
//       setFfmpegStatus('error');
//       setLoadError(error.message);
//       isInitializedRef.current = false;
      
//       // Try alternative CDN
//       setTimeout(() => {
//         if (!ffmpeg && !isInitializedRef.current) {
//           console.log('Trying alternative CDN...');
//           initializeFFmpegWithAlternativeCDN();
//         }
//       }, 2000);
//     }
//   };

//   // Alternative CDN initialization
//   const initializeFFmpegWithAlternativeCDN = async () => {
//     try {
//       console.log('Trying jsDelivr CDN...');
//       const ffmpegInstance = new FFmpeg();
      
//       ffmpegInstance.on('log', ({ type, message }) => {
//         console.log(`FFmpeg ${type}:`, message);
//       });
      
//       ffmpegInstance.on('progress', ({ progress: p }) => {
//         setFfmpegLoadProgress(Math.round(p * 100));
//       });
      
//       await ffmpegInstance.load({
//         coreURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js',
//         wasmURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/ffmpeg-core.wasm',
//       });
      
//       console.log('FFmpeg loaded from jsDelivr!');
//       setFfmpeg(ffmpegInstance);
//       setFfmpegStatus('loaded');
//       setFfmpegLoadProgress(100);
      
//       localStorage.setItem('ffmpeg_loaded', 'true');
//       localStorage.setItem('ffmpeg_timestamp', Date.now().toString());
      
//     } catch (error) {
//       console.error('Alternative CDN also failed:', error);
//       setLoadError('Failed to load video processor from all sources. Please check your internet connection.');
//     }
//   };

//   // Check and load FFmpeg
//   useEffect(() => {
//     const checkAndLoadFFmpeg = () => {
//       try {
//         const stored = localStorage.getItem('ffmpeg_loaded');
//         const timestamp = localStorage.getItem('ffmpeg_timestamp');
        
//         if (stored === 'true' && timestamp) {
//           const hoursSinceLoad = (Date.now() - parseInt(timestamp)) / (1000 * 60 * 60);
//           if (hoursSinceLoad < 24) {
//             console.log('Using cached FFmpeg state');
//           }
//         }
//       } catch (err) {
//         console.log('Cache check error:', err);
//       }
      
//       // Load FFmpeg with delay to prevent blocking
//       setTimeout(() => {
//         if (!isInitializedRef.current && !ffmpeg) {
//           initializeFFmpeg();
//         }
//       }, 1000);
//     };

//     checkAndLoadFFmpeg();
    
//     // Cleanup
//     return () => {
//       if (videoUrl) {
//         URL.revokeObjectURL(videoUrl);
//       }
//     };
//   }, []);

//   // Generate slide images
//   const generateSlidesAsImages = async () => {
//     const slideImages = [];
//     console.log(`Generating ${slides.length} slide images...`);
    
//     // Create a single canvas and reuse it
//     const canvas = document.createElement('canvas');
//     canvas.width = 1280;
//     canvas.height = 720;
//     const ctx = canvas.getContext('2d');
    
//     for (let i = 0; i < slides.length; i++) {
//       const slide = slides[i];
      
//       try {
//         // Clear canvas
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
        
//         // Load image
//         const img = new Image();
//         img.crossOrigin = 'anonymous';
        
//         await new Promise((resolve, reject) => {
//           img.onload = resolve;
//           img.onerror = () => {
//             console.log(`Image ${i} failed, using fallback`);
//             resolve();
//           };
//           img.src = slide.image;
//         });
        
//         // Draw background
//         if (img.complete && img.naturalWidth !== 0) {
//           // Apply effects
//           ctx.save();
//           ctx.filter = `blur(${Math.min(controls.blurAmount, 10)}px) brightness(${controls.brightness}%) contrast(${controls.contrast}%)`;
//           ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//           ctx.restore();
//         } else {
//           // Gradient fallback
//           const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
//           gradient.addColorStop(0, '#4F46E5');
//           gradient.addColorStop(1, '#7C3AED');
//           ctx.fillStyle = gradient;
//           ctx.fillRect(0, 0, canvas.width, canvas.height);
//         }
        
//         // Add overlay
//         ctx.fillStyle = controls.backgroundColor || 'rgba(0, 0, 0, 0.4)';
//         ctx.fillRect(0, 0, canvas.width, canvas.height);
        
//         // Add text
//         ctx.fillStyle = controls.textColor || '#ffffff';
//         const fontSize = Math.min(controls.fontSize || 36, 42);
//         ctx.font = `bold ${fontSize}px "${controls.fontFamily || 'Arial, sans-serif'}"`;
//         ctx.textAlign = 'center';
//         ctx.textBaseline = 'middle';
        
//         // Text positioning
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
        
//         // Text wrapping
//         const maxWidth = canvas.width * 0.8;
//         const lineHeight = fontSize * 1.4;
//         const words = slide.text.split(' ');
//         let line = '';
//         let currentY = y - ((words.length > 10 ? 2 : 0) * lineHeight / 2);
        
//         for (let n = 0; n < words.length; n++) {
//           const testLine = line + words[n] + ' ';
//           const metrics = ctx.measureText(testLine);
          
//           if (metrics.width > maxWidth && n > 0) {
//             ctx.fillText(line, x, currentY);
//             line = words[n] + ' ';
//             currentY += lineHeight;
//           } else {
//             line = testLine;
//           }
//         }
//         ctx.fillText(line, x, currentY);
        
//         // Convert to blob
//         const blob = await new Promise(resolve => {
//           canvas.toBlob(resolve, 'image/jpeg', 0.85);
//         });
        
//         slideImages.push(blob);
        
//         // Update progress
//         setProgress(Math.round(((i + 1) / slides.length) * 30));
        
//       } catch (error) {
//         console.error(`Error with slide ${i}:`, error);
//         // Create simple fallback slide
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         ctx.fillStyle = '#1F2937';
//         ctx.fillRect(0, 0, canvas.width, canvas.height);
//         ctx.fillStyle = '#9CA3AF';
//         ctx.font = 'bold 32px Arial';
//         ctx.textAlign = 'center';
//         ctx.fillText(`Slide ${i + 1}`, canvas.width / 2, canvas.height / 2);
        
//         const blob = await new Promise(resolve => {
//           canvas.toBlob(resolve, 'image/jpeg');
//         });
        
//         slideImages.push(blob);
//       }
//     }
    
//     console.log(`Generated ${slideImages.length} slide images`);
//     return slideImages;
//   };

//   // Generate video
//   const generateVideo = async () => {
//     if (!ffmpeg) {
//       alert('Video processor is still loading. Please wait a moment.');
//       return;
//     }
    
//     if (slides.length === 0) {
//       alert('Please add some content first.');
//       return;
//     }

//     console.log('Starting video generation...');
//     setIsLoading(true);
//     setStatus('preparing');
//     setProgress(0);
    
//     try {
//       // Generate slides
//       setStatus('generating_slides');
//       const slideImages = await generateSlidesAsImages();
      
//       // Write slides to FFmpeg
//       setStatus('writing_files');
//       for (let i = 0; i < slideImages.length; i++) {
//         await ffmpeg.writeFile(`slide${i}.jpg`, await fetchFile(slideImages[i]));
//         setProgress(30 + Math.round((i / slideImages.length) * 30));
//       }
      
//       // Add audio if available
//       if (voice) {
//         console.log('Adding audio track...');
//         await ffmpeg.writeFile('audio.mp3', await fetchFile(voice));
//       }
      
//       // Create video
//       setStatus('creating_video');
//       console.log('Encoding video...');
      
//       const duration = controls.slideDuration;
//       const args = [
//         '-framerate', `1/${duration}`,
//         '-i', 'slide%d.jpg',
//         '-c:v', 'libx264',
//         '-pix_fmt', 'yuv420p',
//         '-vf', 'scale=1280:720',
//         '-r', '30',
//         '-preset', 'fast',
//         '-crf', '28',
//       ];
      
//       if (voice) {
//         args.push('-i', 'audio.mp3', '-c:a', 'aac', '-b:a', '128k', '-shortest');
//       } else {
//         args.push('-t', `${slides.length * duration}`);
//       }
      
//       args.push('output.mp4');
      
//       await ffmpeg.exec(args);
//       setProgress(85);
      
//       // Read output
//       setStatus('reading_output');
//       const data = await ffmpeg.readFile('output.mp4');
      
//       // Create video URL
//       const blob = new Blob([data.buffer], { type: 'video/mp4' });
//       const url = URL.createObjectURL(blob);
      
//       setVideoUrl(url);
//       setGeneratedVideo(blob);
      
//       // Get video info
//       const video = document.createElement('video');
//       video.src = url;
      
//       await new Promise((resolve) => {
//         video.onloadedmetadata = resolve;
//         setTimeout(resolve, 1000);
//       });
      
//       setVideoInfo({
//         duration: video.duration ? video.duration.toFixed(1) : 'Unknown',
//         size: (blob.size / 1024 / 1024).toFixed(2),
//         resolution: '1280x720',
//         format: 'MP4',
//         codec: 'H.264/AAC'
//       });
      
//       setStatus('completed');
//       setProgress(100);
      
//       console.log('Video generation completed!');
      
//       // Cleanup FFmpeg files
//       try {
//         for (let i = 0; i < slideImages.length; i++) {
//           await ffmpeg.deleteFile(`slide${i}.jpg`);
//         }
//         if (voice) await ffmpeg.deleteFile('audio.mp3');
//         await ffmpeg.deleteFile('output.mp4');
//       } catch (e) {
//         console.warn('Cleanup error:', e);
//       }
      
//     } catch (error) {
//       console.error('Video generation error:', error);
//       setStatus('error');
//       alert(`Generation failed: ${error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const downloadVideo = () => {
//     if (generatedVideo && videoUrl) {
//       const link = document.createElement('a');
//       link.href = videoUrl;
//       link.download = `video-${new Date().toISOString().slice(0, 10)}.mp4`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     }
//   };

//   const retryFfmpegLoad = () => {
//     localStorage.removeItem('ffmpeg_loaded');
//     localStorage.removeItem('ffmpeg_timestamp');
//     isInitializedRef.current = false;
//     setFfmpeg(null);
//     setFfmpegStatus('checking');
//     setLoadError('');
//     initializeFFmpeg();
//   };

//   const getStatusMessage = () => {
//     const messages = {
//       preparing: 'Preparing video generation...',
//       generating_slides: 'Creating slide images...',
//       writing_files: 'Processing files...',
//       creating_video: 'Encoding video...',
//       reading_output: 'Finalizing video...',
//       completed: 'Video ready!',
//       error: 'Error occurred'
//     };
//     return messages[status] || 'Ready';
//   };

//   const getFfmpegStatusMessage = () => {
//     const messages = {
//       checking: 'Checking video processor...',
//       loading: `Loading video processor... ${ffmpegLoadProgress}%`,
//       loaded: 'Processor ready!',
//       error: 'Failed to load'
//     };
//     return messages[ffmpegStatus] || 'Initializing...';
//   };

//   const isReadyToGenerate = ffmpeg && slides.length > 0;
//   const totalDuration = slides.length * controls.slideDuration;

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
        
//         {ffmpegStatus === 'loaded' && (
//           <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
//             <Cpu className="h-3 w-3" />
//             Ready
//           </div>
//         )}
//       </div>

//       {/* FFmpeg Status */}
//       {ffmpegStatus !== 'loaded' && (
//         <div className={`mb-4 p-3 rounded-xl ${
//           ffmpegStatus === 'loading' ? 'bg-blue-500/10 border border-blue-500/20' :
//           ffmpegStatus === 'error' ? 'bg-red-500/10 border border-red-500/20' :
//           'bg-yellow-500/10 border border-yellow-500/20'
//         }`}>
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               {ffmpegStatus === 'loading' && <Loader className="h-4 w-4 text-blue-400 animate-spin" />}
//               {ffmpegStatus === 'error' && <AlertTriangle className="h-4 w-4 text-red-400" />}
//               {ffmpegStatus === 'checking' && <Loader className="h-4 w-4 text-yellow-400 animate-spin" />}
//               <span className={`text-sm ${
//                 ffmpegStatus === 'loading' ? 'text-blue-400' :
//                 ffmpegStatus === 'error' ? 'text-red-400' :
//                 'text-yellow-400'
//               }`}>
//                 {getFfmpegStatusMessage()}
//               </span>
//             </div>
            
//             {ffmpegStatus === 'error' && (
//               <button
//                 onClick={retryFfmpegLoad}
//                 className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
//               >
//                 <RefreshCw className="h-3 w-3" />
//                 Retry
//               </button>
//             )}
//           </div>
          
//           {ffmpegStatus === 'loading' && (
//             <div className="mt-2">
//               <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
//                 <div 
//                   className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
//                   style={{ width: `${ffmpegLoadProgress}%` }}
//                 />
//               </div>
//               <div className="text-xs text-gray-400 mt-1">
//                 Downloading video processor (first time only)...
//               </div>
//             </div>
//           )}
          
//           {loadError && (
//             <div className="mt-2 text-xs text-red-400">
//               {loadError}
//             </div>
//           )}
//         </div>
//       )}

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
//             {ffmpeg ? (
//               <CheckCircle className="h-4 w-4 text-green-400" />
//             ) : (
//               <Loader className="h-4 w-4 text-yellow-400 animate-spin" />
//             )}
//             <span className={ffmpeg ? 'text-gray-300' : 'text-gray-500'}>
//               Video Processor
//             </span>
//           </div>
//           {ffmpeg ? (
//             <span className="text-green-400 text-xs">✓</span>
//           ) : (
//             <span className="text-yellow-400 text-xs">Loading</span>
//           )}
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
//               <div className="text-xl font-bold text-white">{controls.slideDuration}s</div>
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
//                 <span>Video processor loads once and caches locally</span>
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
//             <div className={`w-2 h-2 rounded-full ${ffmpeg ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
//             <span className={ffmpeg ? 'text-green-400' : 'text-yellow-400'}>
//               {ffmpeg ? 'Active' : 'Loading...'}
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VideoGenerator;

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
      
      const stream = canvas.captureStream(fps);
      const mediaRecorder = new MediaRecorder(stream, {
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

