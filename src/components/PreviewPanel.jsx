// import React, { useState } from 'react';
// import { 
//   Eye, 
//   ChevronLeft, 
//   ChevronRight, 
//   Play, 
//   Pause, 
//   Maximize2,
//   Smartphone,
//   Monitor,
//   Tablet
// } from 'lucide-react';

// const PreviewPanel = ({ slides, controls, image, story }) => {
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [deviceSize, setDeviceSize] = useState('desktop'); // mobile, tablet, desktop
// //   const [autoPlay, setAutoPlay] = useState(false);

//   const deviceDimensions = {
//     mobile: { width: 320, height: 568 },
//     tablet: { width: 768, height: 1024 },
//     desktop: { width: 1280, height: 720 }
//   };

//   const dim = deviceDimensions[deviceSize];

//   // Auto play slides
//   React.useEffect(() => {
//     let interval;
//     if (isPlaying && slides.length > 0) {
//       interval = setInterval(() => {
//         setCurrentSlide(prev => (prev + 1) % slides.length);
//       }, controls.slideDuration * 1000);
//     }
//     return () => clearInterval(interval);
//   }, [isPlaying, slides.length, controls.slideDuration]);

//   const renderSlide = (slide, index) => {
//     const isActive = index === currentSlide;
    
//     const slideStyle = {
//       fontFamily: controls.fontFamily,
//       color: controls.textColor,
//       fontSize: `${controls.fontSize}px`,
//       textAlign: 'center',
//       position: 'relative',
//       width: '100%',
//       height: '100%',
//       overflow: 'hidden'
//     };

//     const backgroundStyle = {
//       filter: `blur(${controls.blurAmount}px) brightness(${controls.brightness}%) contrast(${controls.contrast}%)`,
//       backgroundImage: `url(${slide.image || ''})`,
//       backgroundSize: 'cover',
//       backgroundPosition: 'center',
//       position: 'absolute',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0
//     };

//     const overlayStyle = {
//       backgroundColor: controls.backgroundColor,
//       position: 'absolute',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0
//     };

//     const textContainerStyle = {
//       position: 'absolute',
//       width: '80%',
//       left: '10%',
//       ...(controls.textPosition === 'top' && { top: '10%' }),
//       ...(controls.textPosition === 'center' && { top: '50%', transform: 'translateY(-50%)' }),
//       ...(controls.textPosition === 'bottom' && { bottom: '10%' }),
//       ...(controls.textPosition === 'left' && { left: '5%', width: '60%', textAlign: 'left' }),
//       ...(controls.textPosition === 'right' && { right: '5%', left: 'auto', width: '60%', textAlign: 'right' })
//     };

//     return (
//       <div 
//         className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
//           isActive ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900' : 'opacity-60'
//         }`}
//         style={{ width: dim.width, height: dim.height }}
//       >
//         {/* Background Image with Effects */}
//         <div style={backgroundStyle} />
        
//         {/* Overlay */}
//         <div style={overlayStyle} />
        
//         {/* Text Content */}
//         <div style={textContainerStyle}>
//           <div style={slideStyle}>
//             {slide.text}
//           </div>
//         </div>

//         {/* Slide Number */}
//         <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
//           Slide {index + 1}/{slides.length}
//         </div>

//         {/* Duration Indicator */}
//         <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
//           <div className="flex items-center gap-2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
//             <div className="h-1 w-1 bg-green-400 rounded-full animate-pulse"></div>
//             {controls.slideDuration}s
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const goToSlide = (index) => {
//     setCurrentSlide(index);
//   };

//   const nextSlide = () => {
//     setCurrentSlide((prev) => (prev + 1) % slides.length);
//   };

//   const prevSlide = () => {
//     setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
//   };

//   const togglePlay = () => {
//     setIsPlaying(!isPlaying);
//   };

//   if (!image && !story) {
//     return (
//       <div className="glass-card p-8 text-center">
//         <Eye className="h-12 w-12 text-gray-600 mx-auto mb-4" />
//         <h3 className="text-xl font-semibold mb-2">Preview Panel</h3>
//         <p className="text-gray-400 mb-6">
//           Upload an image and add story content to see the preview
//         </p>
//         <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
//           <div className="p-4 bg-gray-800/50 rounded-lg">
//             <div className="text-3xl font-bold text-blue-400">1</div>
//             <div className="text-sm text-gray-400 mt-1">Upload Image</div>
//           </div>
//           <div className="p-4 bg-gray-800/50 rounded-lg">
//             <div className="text-3xl font-bold text-purple-400">2</div>
//             <div className="text-sm text-gray-400 mt-1">Add Story</div>
//           </div>
//           <div className="p-4 bg-gray-800/50 rounded-lg">
//             <div className="text-3xl font-bold text-green-400">3</div>
//             <div className="text-sm text-gray-400 mt-1">See Preview</div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="glass-card p-6">
//       <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
//         <div>
//           <h2 className="text-xl font-semibold flex items-center gap-2">
//             <Eye className="h-5 w-5 text-yellow-400" />
//             Live Preview
//           </h2>
//           <p className="text-sm text-gray-400">
//             {slides.length} slides • Total duration: {slides.length * controls.slideDuration}s
//           </p>
//         </div>
        
//         <div className="flex items-center gap-4">
//           {/* Device Selector */}
//           <div className="flex bg-gray-800 rounded-lg p-1">
//             <button
//               onClick={() => setDeviceSize('mobile')}
//               className={`p-2 rounded ${deviceSize === 'mobile' ? 'bg-gray-700' : ''}`}
//               title="Mobile"
//             >
//               <Smartphone className={`h-4 w-4 ${deviceSize === 'mobile' ? 'text-blue-400' : 'text-gray-400'}`} />
//             </button>
//             <button
//               onClick={() => setDeviceSize('tablet')}
//               className={`p-2 rounded ${deviceSize === 'tablet' ? 'bg-gray-700' : ''}`}
//               title="Tablet"
//             >
//               <Tablet className={`h-4 w-4 ${deviceSize === 'tablet' ? 'text-blue-400' : 'text-gray-400'}`} />
//             </button>
//             <button
//               onClick={() => setDeviceSize('desktop')}
//               className={`p-2 rounded ${deviceSize === 'desktop' ? 'bg-gray-700' : ''}`}
//               title="Desktop"
//             >
//               <Monitor className={`h-4 w-4 ${deviceSize === 'desktop' ? 'text-blue-400' : 'text-gray-400'}`} />
//             </button>
//           </div>
          
//           <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
//             <Maximize2 className="h-4 w-4" />
//           </button>
//         </div>
//       </div>

//       {/* Main Preview */}
//       <div className="flex items-center justify-center mb-8">
//         <div className="relative">
//           {slides.length > 0 ? renderSlide(slides[currentSlide], currentSlide) : (
//             <div className="flex flex-col items-center justify-center p-12">
//               <div className="text-4xl text-gray-600 mb-4">🎬</div>
//               <p className="text-gray-400">Processing slides...</p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Controls */}
//       <div className="flex items-center justify-between mb-6">
//         <button
//           onClick={prevSlide}
//           disabled={slides.length === 0}
//           className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//         >
//           <ChevronLeft className="h-5 w-5" />
//         </button>
        
//         <div className="flex items-center gap-4">
//           <button
//             onClick={togglePlay}
//             disabled={slides.length === 0}
//             className={`p-3 rounded-full ${
//               isPlaying 
//                 ? 'bg-red-500 hover:bg-red-600' 
//                 : 'bg-green-500 hover:bg-green-600'
//             } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
//           >
//             {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
//           </button>
          
//           <div className="text-center">
//             <div className="text-sm text-gray-400">Current Slide</div>
//             <div className="text-xl font-bold">
//               {slides.length > 0 ? currentSlide + 1 : 0} / {slides.length}
//             </div>
//           </div>
//         </div>
        
//         <button
//           onClick={nextSlide}
//           disabled={slides.length === 0}
//           className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//         >
//           <ChevronRight className="h-5 w-5" />
//         </button>
//       </div>

//       {/* Slide Thumbnails */}
//       {slides.length > 0 && (
//         <div>
//           <div className="text-sm text-gray-400 mb-3">Slide Navigator</div>
//           <div className="flex gap-2 overflow-x-auto pb-2">
//             {slides.map((slide, index) => (
//               <button
//                 key={index}
//                 onClick={() => goToSlide(index)}
//                 className={`flex-shrink-0 w-20 h-12 rounded-lg overflow-hidden relative transition-all ${
//                   currentSlide === index 
//                     ? 'ring-2 ring-blue-500 transform scale-105' 
//                     : 'opacity-70 hover:opacity-100'
//                 }`}
//               >
//                 <div 
//                   className="absolute inset-0 bg-cover bg-center"
//                   style={{
//                     backgroundImage: `url(${slide.image})`,
//                     filter: `blur(2px) brightness(0.7)`
//                   }}
//                 />
//                 <div className="absolute inset-0 bg-black/40" />
//                 <div className="absolute inset-0 flex items-center justify-center">
//                   <span className="text-xs font-bold">{index + 1}</span>
//                 </div>
//                 {currentSlide === index && (
//                   <div className="absolute inset-0 bg-blue-500/20" />
//                 )}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Preview Info */}
//       <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
//         <div className="grid grid-cols-2 gap-4 text-sm">
//           <div>
//             <div className="text-gray-400">Resolution</div>
//             <div className="font-medium">{dim.width} × {dim.height}</div>
//           </div>
//           <div>
//             <div className="text-gray-400">Font</div>
//             <div className="font-medium">{controls.fontFamily}, {controls.fontSize}px</div>
//           </div>
//           <div>
//             <div className="text-gray-400">Effects</div>
//             <div className="font-medium">Blur: {controls.blurAmount}px</div>
//           </div>
//           <div>
//             <div className="text-gray-400">Timing</div>
//             <div className="font-medium">{controls.slideDuration}s per slide</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PreviewPanel;

// import React, { useState, useEffect, useRef } from 'react';
// import { 
//   Eye, 
//   ChevronLeft, 
//   ChevronRight, 
//   Play, 
//   Pause, 
//   Maximize2,
//   Smartphone,
//   Monitor,
//   Tablet,
//   Tv,
//   Clock,
//   Type,
//   Droplets,
//   Palette,
//   Timer,
//   RefreshCw,
//   Settings,
//   Video,
//   Fullscreen,
//   Volume2,
//   VolumeX,
//   Zap,
//   Grid,
//   Square,
//   Circle
// } from 'lucide-react';

// const PreviewPanel = ({ slides, controls, image, story }) => {
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [deviceSize, setDeviceSize] = useState('desktop'); // mobile, tablet, desktop, youtube
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [isMuted, setIsMuted] = useState(false);
//   const [volume, setVolume] = useState(80);
//   const [showControls, setShowControls] = useState(true);
//   const [autoHideControls, setAutoHideControls] = useState(true);
//   const [progress, setProgress] = useState(0);
//   const [transitionEffect, setTransitionEffect] = useState('fade');
//   const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  
//   const previewRef = useRef(null);
//   const controlsTimeoutRef = useRef(null);
//   const playIntervalRef = useRef(null);
//   const progressIntervalRef = useRef(null);

//   // Aspect ratios for different devices
//   const deviceAspectRatios = {
//     mobile: { width: 9, height: 16, label: 'Mobile (9:16)' },
//     tablet: { width: 4, height: 3, label: 'Tablet (4:3)' },
//     desktop: { width: 16, height: 9, label: 'Desktop (16:9)' },
//     youtube: { width: 16, height: 9, label: 'YouTube (16:9)' },
//     square: { width: 1, height: 1, label: 'Square (1:1)' },
//     cinema: { width: 21, height: 9, label: 'Cinema (21:9)' }
//   };

//   const transitionEffects = [
//     { id: 'fade', name: 'Fade', icon: <Circle className="h-3 w-3" /> },
//     { id: 'slide', name: 'Slide', icon: <ChevronRight className="h-3 w-3" /> },
//     { id: 'zoom', name: 'Zoom', icon: <Maximize2 className="h-3 w-3" /> },
//     { id: 'flip', name: 'Flip', icon: <RefreshCw className="h-3 w-3" /> },
//     { id: 'none', name: 'None', icon: <Square className="h-3 w-3" /> }
//   ];

//   const playbackSpeeds = [
//     { value: 0.5, label: '0.5x' },
//     { value: 0.75, label: '0.75x' },
//     { value: 1.0, label: '1.0x' },
//     { value: 1.25, label: '1.25x' },
//     { value: 1.5, label: '1.5x' },
//     { value: 2.0, label: '2.0x' }
//   ];

//   // Calculate preview dimensions
//   const getPreviewDimensions = () => {
//     const aspectRatio = deviceAspectRatios[deviceSize];
//     const containerWidth = isFullscreen ? window.innerWidth - 40 : 800;
//     const containerHeight = isFullscreen ? window.innerHeight - 200 : 450;
    
//     let width, height;
    
//     if (deviceSize === 'mobile') {
//       // Portrait mode for mobile
//       height = Math.min(containerHeight, containerWidth * (aspectRatio.height / aspectRatio.width));
//       width = height * (aspectRatio.width / aspectRatio.height);
//     } else {
//       // Landscape for others
//       width = Math.min(containerWidth, containerHeight * (aspectRatio.width / aspectRatio.height));
//       height = width * (aspectRatio.height / aspectRatio.width);
//     }
    
//     return { width: Math.floor(width), height: Math.floor(height) };
//   };

//   const dim = getPreviewDimensions();

//   // Auto play slides
//   useEffect(() => {
//     if (isPlaying && slides.length > 0) {
//       const interval = (controls.slideDuration * 1000) / playbackSpeed;
      
//       playIntervalRef.current = setInterval(() => {
//         setCurrentSlide(prev => (prev + 1) % slides.length);
//       }, interval);
//     }
    
//     return () => {
//       if (playIntervalRef.current) {
//         clearInterval(playIntervalRef.current);
//       }
//     };
//   }, [isPlaying, slides.length, controls.slideDuration, playbackSpeed]);

//   // Update progress bar
//   useEffect(() => {
//     if (isPlaying && slides.length > 0) {
//       const progressPerSecond = 100 / (controls.slideDuration * playbackSpeed);
      
//       progressIntervalRef.current = setInterval(() => {
//         setProgress(prev => {
//           if (prev >= 100) {
//             return 0;
//           }
//           return prev + (progressPerSecond / 10);
//         });
//       }, 100);
//     } else {
//       setProgress(0);
//     }
    
//     return () => {
//       if (progressIntervalRef.current) {
//         clearInterval(progressIntervalRef.current);
//       }
//     };
//   }, [isPlaying, controls.slideDuration, playbackSpeed, slides.length]);

//   // Reset progress on slide change
//   useEffect(() => {
//     setProgress(0);
//   }, [currentSlide]);

//   // Auto-hide controls
//   useEffect(() => {
//     if (autoHideControls && showControls && !isFullscreen) {
//       controlsTimeoutRef.current = setTimeout(() => {
//         setShowControls(false);
//       }, 3000);
//     }
    
//     return () => {
//       if (controlsTimeoutRef.current) {
//         clearTimeout(controlsTimeoutRef.current);
//       }
//     };
//   }, [showControls, autoHideControls, isFullscreen]);

//   const handleMouseMove = () => {
//     setShowControls(true);
//     if (controlsTimeoutRef.current) {
//       clearTimeout(controlsTimeoutRef.current);
//     }
//   };

//   const getTextPositionStyle = () => {
//     const positions = controls.textPosition.split('-');
//     const positionStyles = {
//       position: 'absolute',
//       width: '85%',
//       maxWidth: '1200px',
//       padding: '40px',
//       borderRadius: '12px',
//       backdropFilter: 'blur(10px)'
//     };

//     // Horizontal positioning
//     if (positions.includes('left')) {
//       positionStyles.left = '5%';
//       positionStyles.textAlign = 'left';
//     } else if (positions.includes('right')) {
//       positionStyles.right = '5%';
//       positionStyles.left = 'auto';
//       positionStyles.textAlign = 'right';
//     } else {
//       positionStyles.left = '50%';
//       positionStyles.transform = 'translateX(-50%)';
//       positionStyles.textAlign = 'center';
//     }

//     // Vertical positioning
//     if (positions.includes('top')) {
//       positionStyles.top = '10%';
//     } else if (positions.includes('bottom')) {
//       positionStyles.bottom = '10%';
//     } else {
//       positionStyles.top = '50%';
//       positionStyles.transform += ' translateY(-50%)';
//     }

//     return positionStyles;
//   };

//   const renderSlide = (slide, index) => {
//     const isActive = index === currentSlide;
    
//     const slideStyle = {
//       fontFamily: controls.fontFamily,
//       color: controls.textColor,
//       fontSize: `${controls.fontSize}px`,
//       fontWeight: 600,
//       lineHeight: 1.5,
//       textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
//       position: 'relative',
//       width: '100%',
//       zIndex: 2
//     };

//     const backgroundStyle = {
//       filter: `
//         blur(${controls.blurAmount}px) 
//         brightness(${controls.brightness}%) 
//         contrast(${controls.contrast}%)
//         saturate(${controls.saturation || 100}%)
//       `,
//       backgroundImage: slide.image ? `url(${slide.image})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//       backgroundSize: 'cover',
//       backgroundPosition: 'center',
//       backgroundRepeat: 'no-repeat',
//       position: 'absolute',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       transition: 'filter 0.3s ease'
//     };

//     const overlayStyle = {
//       backgroundColor: controls.backgroundColor,
//       position: 'absolute',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       opacity: controls.opacity ? controls.opacity / 100 : 0.4
//     };

//     const textContainerStyle = getTextPositionStyle();

//     // Transition classes
//     const transitionClasses = {
//       fade: 'opacity-0 scale-95',
//       slide: 'translate-x-full',
//       zoom: 'scale-50 opacity-0',
//       flip: 'rotate-y-90',
//       none: ''
//     };

//     return (
//       <div 
//         className={`absolute inset-0 rounded-xl overflow-hidden transition-all duration-700 ${
//           isActive ? 'opacity-100 scale-100' : `opacity-0 ${transitionClasses[transitionEffect]}`
//         }`}
//         style={{ width: '100%', height: '100%' }}
//       >
//         {/* Background Image with Effects */}
//         <div style={backgroundStyle} />
        
//         {/* Gradient Overlay */}
//         <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
        
//         {/* Color Overlay */}
//         <div style={overlayStyle} />
        
//         {/* Text Content */}
//         <div style={textContainerStyle}>
//           <div style={slideStyle} className="leading-relaxed">
//             {slide.text}
//           </div>
//         </div>

//         {/* YouTube-like Video UI Elements */}
//         <div className="absolute top-4 left-4 flex items-center gap-2">
//           <div className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
//             <Video className="h-3 w-3" />
//             <span>LIVE</span>
//           </div>
//           <div className="px-3 py-1 bg-black/70 text-white text-xs rounded-full">
//             {deviceAspectRatios[deviceSize].label}
//           </div>
//         </div>

//         {/* Slide Info */}
//         <div className="absolute top-4 right-4 flex items-center gap-3">
//           <div className="px-3 py-1 bg-black/70 text-white text-xs rounded-full flex items-center gap-1">
//             <Clock className="h-3 w-3" />
//             <span>{controls.slideDuration}s</span>
//           </div>
//           <div className="px-3 py-1 bg-black/70 text-white text-xs rounded-full">
//             Slide {index + 1}/{slides.length}
//           </div>
//         </div>

//         {/* Bottom Gradient */}
//         <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />
//       </div>
//     );
//   };

//   const goToSlide = (index) => {
//     setCurrentSlide(index);
//     setProgress(0);
//   };

//   const nextSlide = () => {
//     setCurrentSlide((prev) => (prev + 1) % slides.length);
//     setProgress(0);
//   };

//   const prevSlide = () => {
//     setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
//     setProgress(0);
//   };

//   const togglePlay = () => {
//     if (slides.length === 0) return;
//     setIsPlaying(!isPlaying);
//   };

//   const toggleFullscreen = () => {
//     setIsFullscreen(!isFullscreen);
//   };

//   const handleSpeedChange = (speed) => {
//     setPlaybackSpeed(speed);
//     if (isPlaying) {
//       setIsPlaying(false);
//       setTimeout(() => setIsPlaying(true), 100);
//     }
//   };

//   const formatTime = (totalSeconds) => {
//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = Math.floor(totalSeconds % 60);
//     return `${minutes}:${seconds.toString().padStart(2, '0')}`;
//   };

//   const totalDuration = slides.length * controls.slideDuration;
//   const currentTime = (currentSlide * controls.slideDuration) + (progress / 100) * controls.slideDuration;

//   if (!image && !story) {
//     return (
//       <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 sm:p-8">
//         <div className="flex flex-col items-center justify-center text-center py-12">
//           <div className="p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full mb-6">
//             <Eye className="h-12 w-12 text-yellow-400" />
//           </div>
//           <h3 className="text-xl font-semibold mb-3">Video Preview</h3>
//           <p className="text-gray-400 mb-8 max-w-md">
//             Add an image and story content to generate a preview of your video
//           </p>
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg">
//             {[
//               { step: 1, color: 'blue', title: 'Upload Image', desc: 'Add background image' },
//               { step: 2, color: 'purple', title: 'Write Story', desc: 'Add slide content' },
//               { step: 3, color: 'green', title: 'Preview Video', desc: 'See live preview' }
//             ].map((item) => (
//               <div key={item.step} className="p-4 bg-gray-800/30 rounded-xl">
//                 <div className={`text-2xl font-bold text-${item.color}-400 mb-2`}>{item.step}</div>
//                 <div className="text-sm font-medium text-white">{item.title}</div>
//                 <div className="text-xs text-gray-400 mt-1">{item.desc}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (slides.length === 0) {
//     return (
//       <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg">
//               <Eye className="h-5 w-5 text-yellow-400" />
//             </div>
//             <div>
//               <h2 className="text-lg font-semibold text-white">Video Preview</h2>
//               <p className="text-xs text-gray-400">Waiting for content...</p>
//             </div>
//           </div>
//         </div>
//         <div className="flex items-center justify-center p-12">
//           <div className="text-center">
//             <div className="text-4xl text-gray-600 mb-4">🎬</div>
//             <p className="text-gray-400">Processing slides...</p>
//             <p className="text-sm text-gray-500 mt-2">Add paragraphs to your story to create slides</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`bg-gray-900/50 border border-gray-800 rounded-2xl ${isFullscreen ? 'fixed inset-4 z-50' : 'p-4 sm:p-5'}`}>
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
//         <div className="flex items-center gap-3">
//           <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg">
//             <Eye className="h-5 w-5 text-yellow-400" />
//           </div>
//           <div>
//             <h2 className="text-lg font-semibold text-white">Video Preview</h2>
//             <div className="flex items-center gap-3 text-xs text-gray-400">
//               <span>{slides.length} slides</span>
//               <span>•</span>
//               <span>Total: {formatTime(totalDuration)}</span>
//               <span>•</span>
//               <span className="flex items-center gap-1">
//                 <Zap className="h-3 w-3" />
//                 {playbackSpeed}x
//               </span>
//             </div>
//           </div>
//         </div>
        
//         <div className="flex items-center gap-2">
//           {/* Device/Aspect Ratio Selector */}
//           <div className="flex bg-gray-800/50 rounded-lg p-1">
//             {['mobile', 'tablet', 'desktop', 'youtube', 'square', 'cinema'].map((device) => (
//               <button
//                 key={device}
//                 onClick={() => setDeviceSize(device)}
//                 className={`p-2 rounded transition-all ${deviceSize === device 
//                   ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
//                   : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
//                 title={deviceAspectRatios[device].label}
//               >
//                 {device === 'mobile' && <Smartphone className="h-4 w-4" />}
//                 {device === 'tablet' && <Tablet className="h-4 w-4" />}
//                 {device === 'desktop' && <Monitor className="h-4 w-4" />}
//                 {device === 'youtube' && <Tv className="h-4 w-4" />}
//                 {device === 'square' && <Square className="h-4 w-4" />}
//                 {device === 'cinema' && <Maximize2 className="h-4 w-4" />}
//               </button>
//             ))}
//           </div>
          
//           <button
//             onClick={toggleFullscreen}
//             className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-gray-400 hover:text-white transition-colors"
//           >
//             {isFullscreen ? <Maximize2 className="h-4 w-4 rotate-45" /> : <Fullscreen className="h-4 w-4" />}
//           </button>
//         </div>
//       </div>

//       {/* Main Preview Area */}
//       <div 
//         ref={previewRef}
//         className={`relative bg-black rounded-xl overflow-hidden transition-all duration-300 mx-auto ${isFullscreen ? 'h-[calc(100vh-200px)]' : ''}`}
//         style={{
//           width: dim.width,
//           height: dim.height,
//           boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
//         }}
//         onMouseMove={handleMouseMove}
//         onMouseLeave={() => autoHideControls && setShowControls(false)}
//       >
//         {/* Current Slide */}
//         {slides.length > 0 && renderSlide(slides[currentSlide], currentSlide)}

//         {/* YouTube-like Controls Overlay */}
//         {showControls && (
//           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none">
//             {/* Progress Bar */}
//             <div className="absolute bottom-16 left-0 right-0 px-4">
//               <div className="relative h-1 bg-white/30 rounded-full overflow-hidden">
//                 <div 
//                   className="absolute h-full bg-red-600 rounded-full transition-all duration-100"
//                   style={{ width: `${progress}%` }}
//                 />
//                 <div 
//                   className="absolute h-3 w-3 bg-white rounded-full -translate-y-1/2 top-1/2 shadow-lg cursor-pointer pointer-events-auto hover:scale-125"
//                   style={{ left: `${progress}%` }}
//                 />
//               </div>
//               <div className="flex items-center justify-between text-xs text-white/80 mt-2 px-1">
//                 <span>{formatTime(currentTime)}</span>
//                 <span>{formatTime(totalDuration)}</span>
//               </div>
//             </div>

//             {/* Bottom Controls Bar */}
//             <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 pointer-events-auto">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-4">
//                   <button
//                     onClick={togglePlay}
//                     className="p-2 hover:bg-white/10 rounded-full transition-colors"
//                   >
//                     {isPlaying ? 
//                       <Pause className="h-6 w-6 text-white" /> : 
//                       <Play className="h-6 w-6 text-white" />
//                     }
//                   </button>
                  
//                   <button
//                     onClick={() => setIsMuted(!isMuted)}
//                     className="p-2 hover:bg-white/10 rounded-full transition-colors"
//                   >
//                     {isMuted ? 
//                       <VolumeX className="h-5 w-5 text-white" /> : 
//                       <Volume2 className="h-5 w-5 text-white" />
//                     }
//                   </button>
                  
//                   {!isMuted && (
//                     <input
//                       type="range"
//                       min="0"
//                       max="100"
//                       value={volume}
//                       onChange={(e) => setVolume(parseInt(e.target.value))}
//                       className="w-24 accent-red-600"
//                     />
//                   )}
                  
//                   <div className="text-sm text-white/80">
//                     {currentSlide + 1} / {slides.length}
//                   </div>
//                 </div>
                
//                 <div className="flex items-center gap-4">
//                   <select
//                     value={playbackSpeed}
//                     onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
//                     className="bg-transparent text-white/80 text-sm border border-white/20 rounded px-2 py-1"
//                   >
//                     {playbackSpeeds.map(speed => (
//                       <option key={speed.value} value={speed.value} className="bg-gray-900">
//                         {speed.label}
//                       </option>
//                     ))}
//                   </select>
                  
//                   <button
//                     onClick={toggleFullscreen}
//                     className="p-2 hover:bg-white/10 rounded-full transition-colors"
//                   >
//                     <Fullscreen className="h-5 w-5 text-white" />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Play Button Overlay when paused */}
//         {!isPlaying && !showControls && (
//           <button
//             onClick={togglePlay}
//             className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity"
//           >
//             <div className="p-6 bg-black/50 rounded-full">
//               <Play className="h-12 w-12 text-white" />
//             </div>
//           </button>
//         )}
//       </div>

//       {/* Controls Panel */}
//       <div className="mt-4 sm:mt-6 space-y-4">
//         {/* Main Controls */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <button
//               onClick={prevSlide}
//               disabled={slides.length === 0}
//               className="p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               <ChevronLeft className="h-5 w-5" />
//             </button>
            
//             <button
//               onClick={togglePlay}
//               disabled={slides.length === 0}
//               className={`p-3 rounded-xl transition-all ${
//                 isPlaying 
//                   ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
//                   : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
//               } disabled:opacity-50 disabled:cursor-not-allowed`}
//             >
//               {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
//             </button>
            
//             <button
//               onClick={nextSlide}
//               disabled={slides.length === 0}
//               className="p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               <ChevronRight className="h-5 w-5" />
//             </button>
            
//             <div className="ml-4 text-sm">
//               <div className="text-gray-400">Current</div>
//               <div className="font-bold text-white">
//                 Slide {currentSlide + 1} of {slides.length}
//               </div>
//             </div>
//           </div>
          
//           <div className="flex items-center gap-3">
//             <div className="text-right">
//               <div className="text-sm text-gray-400">Duration</div>
//               <div className="font-bold text-white">{formatTime(totalDuration)}</div>
//             </div>
//           </div>
//         </div>

//         {/* Slide Thumbnails */}
//         <div>
//           <div className="flex items-center justify-between mb-3">
//             <div className="text-sm text-gray-400">Slide Navigator</div>
//             <div className="flex items-center gap-2">
//               <div className="flex bg-gray-800/30 rounded-lg p-1">
//                 {transitionEffects.map(effect => (
//                   <button
//                     key={effect.id}
//                     onClick={() => setTransitionEffect(effect.id)}
//                     className={`p-1.5 rounded flex items-center gap-1 text-xs ${
//                       transitionEffect === effect.id
//                         ? 'bg-blue-500/20 text-blue-400'
//                         : 'text-gray-400 hover:text-white'
//                     }`}
//                     title={`${effect.name} transition`}
//                   >
//                     {effect.icon}
//                     <span>{effect.name}</span>
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>
          
//           <div className="flex gap-2 overflow-x-auto pb-3">
//             {slides.map((slide, index) => (
//               <button
//                 key={index}
//                 onClick={() => goToSlide(index)}
//                 className={`flex-shrink-0 relative rounded-lg overflow-hidden transition-all ${
//                   currentSlide === index 
//                     ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900 transform scale-105' 
//                     : 'opacity-70 hover:opacity-100 hover:scale-102'
//                 }`}
//                 style={{ width: '100px', height: '60px' }}
//               >
//                 <div 
//                   className="absolute inset-0 bg-cover bg-center"
//                   style={{
//                     backgroundImage: `url(${slide.image})`,
//                     filter: `blur(1px) brightness(0.6)`
//                   }}
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
//                 <div className="absolute inset-0 flex items-center justify-center">
//                   <span className="text-xs font-bold text-white">{index + 1}</span>
//                 </div>
//                 {currentSlide === index && (
//                   <div className="absolute inset-0 bg-blue-500/30" />
//                 )}
//                 {isPlaying && currentSlide === index && (
//                   <div className="absolute bottom-1 left-1 right-1 h-0.5 bg-blue-500 rounded-full overflow-hidden">
//                     <div 
//                       className="h-full bg-green-500"
//                       style={{ width: `${progress}%` }}
//                     />
//                   </div>
//                 )}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Preview Stats */}
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//           <div className="bg-gray-800/30 p-3 rounded-xl">
//             <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
//               <Monitor className="h-3 w-3" />
//               Resolution
//             </div>
//             <div className="text-sm font-bold text-white">{dim.width} × {dim.height}</div>
//           </div>
          
//           <div className="bg-gray-800/30 p-3 rounded-xl">
//             <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
//               <Type className="h-3 w-3" />
//               Font
//             </div>
//             <div className="text-sm font-bold text-white">{controls.fontFamily}, {controls.fontSize}px</div>
//           </div>
          
//           <div className="bg-gray-800/30 p-3 rounded-xl">
//             <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
//               <Droplets className="h-3 w-3" />
//               Effects
//             </div>
//             <div className="text-sm font-bold text-white">Blur: {controls.blurAmount}px</div>
//           </div>
          
//           <div className="bg-gray-800/30 p-3 rounded-xl">
//             <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
//               <Timer className="h-3 w-3" />
//               Timing
//             </div>
//             <div className="text-sm font-bold text-white">{controls.slideDuration}s per slide</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PreviewPanel;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Maximize2,
  Smartphone,
  Monitor,
  Tablet,
  Tv,
  Clock,
  Type,
  Droplets,
  Palette,
  Timer,
  RefreshCw,
  Settings,
  Video,
  Fullscreen,
  Volume2,
  VolumeX,
  Zap,
  Grid,
  Square,
  Circle,
  Minimize2,
  X,
  Check,
  AlertCircle,
  SkipForward,
  SkipBack
} from 'lucide-react';

const PreviewPanel = ({ slides, controls, image, story }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [deviceSize, setDeviceSize] = useState('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [transitionEffect, setTransitionEffect] = useState('fade');
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  
  const previewRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const playIntervalRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const containerRef = useRef(null);

  // Responsive breakpoints
  const breakpoints = {
    xs: 480,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280
  };

  // Check if mobile screen
  const isMobile = windowWidth < breakpoints.md;
  const isTablet = windowWidth >= breakpoints.md && windowWidth < breakpoints.lg;

  // Aspect ratios for different devices - responsive sizes
  const deviceAspectRatios = {
    mobile: { width: 9, height: 16, label: 'Mobile', icon: <Smartphone className="h-4 w-4" /> },
    tablet: { width: 4, height: 3, label: 'Tablet', icon: <Tablet className="h-4 w-4" /> },
    desktop: { width: 16, height: 9, label: 'Desktop', icon: <Monitor className="h-4 w-4" /> },
    youtube: { width: 16, height: 9, label: 'YouTube', icon: <Tv className="h-4 w-4" /> },
    square: { width: 1, height: 1, label: 'Square', icon: <Square className="h-4 w-4" /> }
  };

  const transitionEffects = [
    { id: 'fade', name: 'Fade', icon: <Circle className="h-3 w-3" /> },
    { id: 'slide', name: 'Slide', icon: <ChevronRight className="h-3 w-3" /> },
    { id: 'zoom', name: 'Zoom', icon: <Maximize2 className="h-3 w-3" /> },
    { id: 'none', name: 'None', icon: <X className="h-3 w-3" /> }
  ];

  const playbackSpeeds = [
    { value: 0.5, label: '0.5x' },
    { value: 0.75, label: '0.75x' },
    { value: 1.0, label: '1x' },
    { value: 1.25, label: '1.25x' },
    { value: 1.5, label: '1.5x' }
  ];

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      
      // Auto adjust device size on mobile
      if (window.innerWidth < breakpoints.md && deviceSize !== 'mobile') {
        setDeviceSize('mobile');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [deviceSize]);

  // Calculate responsive preview dimensions
  const getPreviewDimensions = useCallback(() => {
    const aspectRatio = deviceAspectRatios[deviceSize];
    
    let maxWidth, maxHeight;
    
    if (isFullscreen) {
      maxWidth = window.innerWidth - (isMobile ? 20 : 40);
      maxHeight = window.innerHeight - (isMobile ? 100 : 200);
    } else {
      const containerWidth = containerRef.current?.clientWidth || (isMobile ? windowWidth - 32 : 800);
      maxWidth = Math.min(
        containerWidth - (isMobile ? 16 : 32),
        isMobile ? 400 : 800
      );
      maxHeight = isMobile ? 500 : 450;
    }
    
    let width, height;
    
    if (deviceSize === 'mobile') {
      // Portrait mode for mobile
      height = Math.min(maxHeight, maxWidth * (aspectRatio.height / aspectRatio.width));
      width = height * (aspectRatio.width / aspectRatio.height);
    } else {
      // Landscape for others
      width = Math.min(maxWidth, maxHeight * (aspectRatio.width / aspectRatio.height));
      height = width * (aspectRatio.height / aspectRatio.width);
    }
    
    // Ensure minimum sizes for mobile
    if (isMobile) {
      width = Math.max(width, 280);
      height = Math.max(height, 160);
    }
    
    return { 
      width: Math.floor(width), 
      height: Math.floor(height),
      aspectRatio: `${aspectRatio.width}:${aspectRatio.height}`
    };
  }, [deviceSize, isFullscreen, isMobile, windowWidth]);

  const dim = getPreviewDimensions();

  // Auto play slides
  useEffect(() => {
    if (isPlaying && slides.length > 0) {
      const interval = (controls.slideDuration * 1000) / playbackSpeed;
      
      playIntervalRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
      }, interval);
    }
    
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, slides.length, controls.slideDuration, playbackSpeed]);

  // Update progress bar
  useEffect(() => {
    if (isPlaying && slides.length > 0) {
      const progressPerSecond = 100 / (controls.slideDuration * playbackSpeed);
      
      progressIntervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            return 0;
          }
          return prev + (progressPerSecond / 10);
        });
      }, 100);
    } else {
      setProgress(0);
    }
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, controls.slideDuration, playbackSpeed, slides.length]);

  // Reset progress on slide change
  useEffect(() => {
    setProgress(0);
  }, [currentSlide]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const getTextPositionStyle = () => {
    const positions = controls.textPosition?.split('-') || ['center', 'center'];
    const positionStyles = {
      position: 'absolute',
      width: isMobile ? '90%' : '85%',
      maxWidth: isMobile ? '400px' : '1200px',
      padding: isMobile ? '20px' : '40px',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)'
    };

    // Horizontal positioning
    if (positions.includes('left')) {
      positionStyles.left = isMobile ? '5%' : '5%';
      positionStyles.textAlign = 'left';
    } else if (positions.includes('right')) {
      positionStyles.right = isMobile ? '5%' : '5%';
      positionStyles.left = 'auto';
      positionStyles.textAlign = 'right';
    } else {
      positionStyles.left = '50%';
      positionStyles.transform = 'translateX(-50%)';
      positionStyles.textAlign = 'center';
    }

    // Vertical positioning
    if (positions.includes('top')) {
      positionStyles.top = isMobile ? '5%' : '10%';
    } else if (positions.includes('bottom')) {
      positionStyles.bottom = isMobile ? '5%' : '10%';
    } else {
      positionStyles.top = '50%';
      positionStyles.transform += ' translateY(-50%)';
    }

    return positionStyles;
  };

  const renderSlide = (slide, index) => {
    const isActive = index === currentSlide;
    
    const slideStyle = {
      fontFamily: controls.fontFamily,
      color: controls.textColor,
      fontSize: isMobile ? `${Math.max(16, controls.fontSize * 0.7)}px` : `${controls.fontSize}px`,
      fontWeight: 600,
      lineHeight: 1.5,
      textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
      position: 'relative',
      width: '100%',
      zIndex: 2
    };

    const backgroundStyle = {
      filter: `
        blur(${controls.blurAmount}px) 
        brightness(${controls.brightness}%) 
        contrast(${controls.contrast}%)
      `,
      backgroundImage: slide.image ? `url(${slide.image})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      transition: 'filter 0.3s ease'
    };

    const overlayStyle = {
      backgroundColor: controls.backgroundColor,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: controls.opacity ? controls.opacity / 100 : 0.4
    };

    const textContainerStyle = getTextPositionStyle();

    return (
      <div 
        className={`absolute inset-0 rounded-xl overflow-hidden transition-all duration-700 ${
          isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{ width: '100%', height: '100%' }}
      >
        <div style={backgroundStyle} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
        <div style={overlayStyle} />
        
        <div style={textContainerStyle}>
          <div style={slideStyle} className="leading-relaxed">
            {slide.text}
          </div>
        </div>

        {/* Mobile optimized UI */}
        {isMobile ? (
          <>
            <div className="absolute top-2 left-2">
              <div className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                LIVE
              </div>
            </div>
            <div className="absolute top-2 right-2">
              <div className="px-2 py-1 bg-black/70 text-white text-xs rounded-full">
                {index + 1}/{slides.length}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                LIVE
              </div>
              <div className="px-3 py-1 bg-black/70 text-white text-xs rounded-full">
                {deviceAspectRatios[deviceSize].label}
              </div>
            </div>
            <div className="absolute top-4 right-4">
              <div className="px-3 py-1 bg-black/70 text-white text-xs rounded-full">
                Slide {index + 1}/{slides.length}
              </div>
            </div>
          </>
        )}

        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent" />
      </div>
    );
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setProgress(0);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setProgress(0);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
  };

  const togglePlay = () => {
    if (slides.length === 0) return;
    setIsPlaying(!isPlaying);
    if (isMobile) {
      setShowMobileControls(true);
      setTimeout(() => setShowMobileControls(false), 3000);
    }
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await previewRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error('Error attempting to enable fullscreen:', err);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        console.error('Error attempting to exit fullscreen:', err);
      }
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (isPlaying) {
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 100);
    }
  };

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const totalDuration = slides.length * controls.slideDuration;
  const currentTime = (currentSlide * controls.slideDuration) + (progress / 100) * controls.slideDuration;

  // Render empty state
  if (!image && !story) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col items-center justify-center text-center py-8 sm:py-12">
          <div className="p-3 sm:p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full mb-4 sm:mb-6">
            <Eye className="h-8 w-8 sm:h-12 sm:w-12 text-yellow-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Video Preview</h3>
          <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8 max-w-md px-4">
            Add an image and story content to generate a preview of your video
          </p>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-lg w-full">
            {[
              { step: 1, color: 'blue', title: 'Upload', desc: 'Image' },
              { step: 2, color: 'purple', title: 'Write', desc: 'Story' },
              { step: 3, color: 'green', title: 'Preview', desc: 'Video' }
            ].map((item) => (
              <div key={item.step} className="p-3 sm:p-4 bg-gray-800/30 rounded-lg sm:rounded-xl">
                <div className={`text-xl sm:text-2xl font-bold text-${item.color}-400 mb-1 sm:mb-2`}>
                  {item.step}
                </div>
                <div className="text-xs sm:text-sm font-medium text-white">{item.title}</div>
                <div className="text-xs text-gray-400">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg">
              <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-white">Video Preview</h2>
              <p className="text-xs text-gray-400">Waiting for content...</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center p-8 sm:p-12">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl text-gray-600 mb-3 sm:mb-4">🎬</div>
            <p className="text-sm sm:text-base text-gray-400">Processing slides...</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">Add paragraphs to your story to create slides</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`bg-gray-900/50 border border-gray-800 rounded-2xl p-3 sm:p-4 md:p-5 ${
        isFullscreen ? 'fixed inset-0 z-50 p-4' : ''
      }`}
    >
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg">
            <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-white">Preview</h2>
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs text-gray-400">
              <span>{slides.length} slides</span>
              <span>•</span>
              <span>{formatTime(totalDuration)}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {playbackSpeed}x
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Responsive Device Selector */}
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {isMobile ? (
              <select
                value={deviceSize}
                onChange={(e) => setDeviceSize(e.target.value)}
                className="bg-gray-800/50 text-white text-xs sm:text-sm rounded-lg px-2 py-1.5 sm:px-3 sm:py-2"
              >
                {Object.entries(deviceAspectRatios).map(([key, value]) => (
                  <option key={key} value={key} className="bg-gray-900">
                    {value.label}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex bg-gray-800/50 rounded-lg p-1">
                {Object.entries(deviceAspectRatios).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setDeviceSize(key)}
                    className={`p-1.5 sm:p-2 rounded transition-all ${deviceSize === key 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
                    title={value.label}
                  >
                    {value.icon}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex justify-center mb-4 sm:mb-6">
        <div 
          ref={previewRef}
          className={`relative bg-black rounded-lg sm:rounded-xl overflow-hidden transition-all duration-300 ${
            isFullscreen ? 'w-full h-full' : ''
          }`}
          style={{
            width: dim.width,
            height: dim.height,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            maxWidth: '100%'
          }}
          onClick={() => isMobile && setShowMobileControls(!showMobileControls)}
        >
          {/* Current Slide */}
          {slides.length > 0 && renderSlide(slides[currentSlide], currentSlide)}

          {/* Mobile Controls Overlay */}
          {isMobile && (showMobileControls || !isPlaying) && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
              {/* Progress Bar */}
              <div className="absolute bottom-20 left-4 right-4">
                <div className="relative h-1 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="absolute h-full bg-red-600 rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-white/80 mt-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(totalDuration)}</span>
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-4 left-0 right-0 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="p-2 bg-black/50 rounded-full"
                    >
                      {isPlaying ? 
                        <Pause className="h-5 w-5 text-white" /> : 
                        <Play className="h-5 w-5 text-white" />
                      }
                    </button>
                    
                    <div className="text-sm text-white/80">
                      {currentSlide + 1} / {slides.length}
                    </div>
                  </div>
                  
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 bg-black/50 rounded-full"
                  >
                    <Maximize2 className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Center Play Button */}
              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="p-4 bg-black/50 rounded-full">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                </button>
              )}
            </div>
          )}

          {/* Desktop Controls Overlay */}
          {!isMobile && showControls && (
            <div 
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
              onMouseEnter={() => setShowControls(true)}
              onMouseLeave={() => setTimeout(() => setShowControls(false), 2000)}
            >
              <div className="absolute bottom-16 left-0 right-0 px-4">
                <div className="relative h-1.5 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="absolute h-full bg-red-600 rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-white/80 mt-2 px-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(totalDuration)}</span>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                      {isPlaying ? 
                        <Pause className="h-5 w-5 sm:h-6 sm:w-6 text-white" /> : 
                        <Play className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      }
                    </button>
                    
                    <div className="text-sm text-white/80 hidden sm:block">
                      {currentSlide + 1} / {slides.length}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:gap-4">
                    <select
                      value={playbackSpeed}
                      onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                      className="bg-transparent text-white/80 text-xs sm:text-sm border border-white/20 rounded px-2 py-1"
                    >
                      {playbackSpeeds.map(speed => (
                        <option key={speed.value} value={speed.value} className="bg-gray-900">
                          {speed.label}
                        </option>
                      ))}
                    </select>
                    
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls Panel - Responsive */}
      <div className="space-y-3 sm:space-y-4">
        {/* Main Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={prevSlide}
              disabled={slides.length === 0}
              className="p-2 sm:p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg sm:rounded-xl disabled:opacity-50 transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            
            <button
              onClick={togglePlay}
              disabled={slides.length === 0}
              className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all ${
                isPlaying 
                  ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
                  : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
              } disabled:opacity-50`}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? 
                <Pause className="h-4 w-4 sm:h-5 sm:w-5" /> : 
                <Play className="h-4 w-4 sm:h-5 sm:w-5" />
              }
            </button>
            
            <button
              onClick={nextSlide}
              disabled={slides.length === 0}
              className="p-2 sm:p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg sm:rounded-xl disabled:opacity-50 transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            
            <div className="ml-2 sm:ml-4 text-sm hidden xs:block">
              <div className="text-gray-400 text-xs">Slide</div>
              <div className="font-bold text-white">
                {currentSlide + 1} / {slides.length}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {!isMobile && (
              <div className="text-right">
                <div className="text-gray-400 text-xs">Duration</div>
                <div className="font-bold text-white text-sm sm:text-base">
                  {formatTime(totalDuration)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Slide Thumbnails - Responsive */}
        {slides.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs sm:text-sm text-gray-400">Slides</div>
              {!isMobile && (
                <div className="flex bg-gray-800/30 rounded-lg p-1">
                  {transitionEffects.map(effect => (
                    <button
                      key={effect.id}
                      onClick={() => setTransitionEffect(effect.id)}
                      className={`p-1 sm:p-1.5 rounded flex items-center gap-1 text-xs ${
                        transitionEffect === effect.id
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'text-gray-400 hover:text-white'
                      }`}
                      title={`${effect.name} transition`}
                    >
                      {effect.icon}
                      {!isMobile && <span className="hidden sm:inline">{effect.name}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2">
              {slides.map((slide, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`flex-shrink-0 relative rounded-lg overflow-hidden transition-all ${
                    currentSlide === index 
                      ? 'ring-2 ring-blue-500 ring-offset-1 sm:ring-offset-2 ring-offset-gray-900' 
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ 
                    width: isMobile ? '60px' : '80px', 
                    height: isMobile ? '40px' : '50px' 
                  }}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${slide.image})`,
                      filter: `blur(1px) brightness(0.6)`
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{index + 1}</span>
                  </div>
                  {currentSlide === index && (
                    <div className="absolute inset-0 bg-blue-500/30" />
                  )}
                  {isPlaying && currentSlide === index && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Preview Stats - Responsive Grid */}
        <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'} gap-2 sm:gap-3`}>
          <div className="bg-gray-800/30 p-2 sm:p-3 rounded-lg sm:rounded-xl">
            <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-400 mb-1">
              <Monitor className="h-3 w-3" />
              <span className="hidden xs:inline">Resolution</span>
              <span className="xs:hidden">Res</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-white">
              {dim.width} × {dim.height}
            </div>
          </div>
          
          <div className="bg-gray-800/30 p-2 sm:p-3 rounded-lg sm:rounded-xl">
            <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-400 mb-1">
              <Type className="h-3 w-3" />
              <span className="hidden sm:inline">Font</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-white truncate">
              {controls.fontFamily}, {controls.fontSize}px
            </div>
          </div>
          
          <div className="bg-gray-800/30 p-2 sm:p-3 rounded-lg sm:rounded-xl">
            <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-400 mb-1">
              <Droplets className="h-3 w-3" />
              <span className="hidden sm:inline">Effects</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-white">
              Blur: {controls.blurAmount}px
            </div>
          </div>
          
          <div className="bg-gray-800/30 p-2 sm:p-3 rounded-lg sm:rounded-xl">
            <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-400 mb-1">
              <Timer className="h-3 w-3" />
              <span className="hidden sm:inline">Timing</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-white">
              {controls.slideDuration}s
            </div>
          </div>
        </div>

        {/* Mobile Speed Control */}
        {isMobile && (
          <div className="bg-gray-800/30 p-3 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Zap className="h-3 w-3" />
                Playback Speed
              </div>
              <span className="text-xs font-bold text-white">{playbackSpeed}x</span>
            </div>
            <div className="flex gap-1">
              {playbackSpeeds.map(speed => (
                <button
                  key={speed.value}
                  onClick={() => handleSpeedChange(speed.value)}
                  className={`flex-1 py-2 rounded text-xs ${
                    playbackSpeed === speed.value
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-gray-800 text-gray-300'
                  }`}
                >
                  {speed.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Instructions */}
      {isMobile && slides.length > 0 && (
        <div className="mt-3 p-2 bg-blue-500/10 rounded-lg">
          <div className="flex items-center gap-2 text-xs text-blue-400">
            <AlertCircle className="h-3 w-3" />
            Tap on video to show/hide controls • Swipe thumbnails to navigate
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewPanel;

