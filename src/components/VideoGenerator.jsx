import React, { useState, useEffect, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';
import { videoDB, saveBlobWithRetry } from '../utils/db';
import { CheckpointManager } from '../utils/checkpoint';
import ResumeDialog from './ResumeDialog';
import ProgressIndicator from './ProgressIndicator';


// Lucide React Icons
import {
  Play,
  Pause,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  FileVideo,
  Image as ImageIcon,
  Music,
  Trash2,
  Clock,
  AlertCircle,
  Save,
  RotateCcw,
  StopCircle,
  Zap,
  Info,
  Sparkles,
  Globe,
  Shield,
  Cpu,
  Database,
  HardDrive,
  Layers,
  Eye,
  EyeOff,
  Maximize2,
} from 'lucide-react';

const VideoGenerator = ({ slides, voice, controls, image, story }) => {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle');
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [debugLog, setDebugLog] = useState([]);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [incompleteJobs, setIncompleteJobs] = useState([]);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState('Calculating...');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Refs
  const ffmpegRef = useRef(new FFmpeg());
  const checkpointManagerRef = useRef(null);
  const slideImagesRef = useRef([]);
  const abortControllerRef = useRef(null);
  const startTimeRef = useRef(null);
  const progressIntervalRef = useRef(null);





  // Custom hooks
  // const { startGeneration: startWorkerGeneration, workerError } = useVideoWorker();



  // Progress calculation helpers
  const getProgressForStage = (stage, current, total) => {
    const stageWeights = {
      preparing: 0,
      generating_slides: 30,
      slides_generated: 30,
      encoding: 100,
      completed: 100
    };

    if (stage === 'generating_slides') {
      return Math.round((current / total) * 30);
    } else if (stage === 'encoding') {
      // Encoding is from 30 to 100
      return 30 + Math.round(current * 70);
    }

    return stageWeights[stage] || 0;
  };

  const calculateResumeProgress = (existingSlides, totalSlides, currentIndex) => {
    if (existingSlides >= totalSlides) return 30;

    const baseProgress = Math.round((existingSlides / totalSlides) * 30);
    const remainingSlides = totalSlides - existingSlides;
    const currentNewSlides = currentIndex - existingSlides;

    if (remainingSlides === 0) return baseProgress;

    const progressPerNewSlide = (30 - baseProgress) / remainingSlides;
    const additionalProgress = Math.round(currentNewSlides * progressPerNewSlide);

    return Math.min(baseProgress + additionalProgress, 30);
  };

  // Progress update helper
  const updateProgress = (stage, data = {}) => {
    switch (stage) {
      case 'preparing':
        setProgress(getProgressForStage('preparing', 0, 1));
        break;

      case 'generating_slides': {
        const { currentSlide = 0, totalSlides = slides.length } = data;
        if (status === 'resuming' && slideImagesRef.current.length > 0) {
          const progress = calculateResumeProgress(
            slideImagesRef.current.length,
            totalSlides,
            currentSlide
          );
          setProgress(progress);
        } else {
          setProgress(getProgressForStage('generating_slides', currentSlide, totalSlides));
        }
        break;
      }

      case 'encoding': {
        const { encodingProgress = 0 } = data;
        setProgress(getProgressForStage('encoding', encodingProgress, 1));
        break;
      }

      case 'completed':
        setProgress(getProgressForStage('completed', 1, 1));
        break;

      default:
        setProgress(0);
    }
  };

  // Initialize and check for resume
  useEffect(() => {
    const initialize = async () => {
      try {
        addDebugLog('🚀 Initializing Video Generator...');
        addDebugLog('📦 Loading FFmpeg...');

        await loadFFmpeg();
        await checkIncompleteJobs();

        if ('serviceWorker' in navigator && import.meta.env.NODE_ENV === 'production') {
          try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            addDebugLog('✅ Service Worker registered:', registration.scope);
          } catch (error) {
            addDebugLog('⚠️ Service Worker registration failed:', error.message);
          }
        }

        addDebugLog('✅ Initialization complete');
      } catch (error) {
        console.error('Initialization error:', error);
        setLoadError(`Initialization failed: ${error.message}`);
        addDebugLog(`❌ Initialization error: ${error.message}`);
      }
    };

    initialize();

    const handleBeforeUnload = (e) => {
      if (isLoading && progress < 100) {
        e.preventDefault();
        e.returnValue = '⚠️ Video generation is in progress. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
        addDebugLog('🧹 Cleaned up video URL');
      }
      cleanupFFmpeg();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Estimate time remaining
  useEffect(() => {
    if (isLoading && progress > 0 && progress < 100) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }

      const elapsed = Date.now() - startTimeRef.current;
      const estimatedTotal = (elapsed / progress) * 100;
      const remaining = estimatedTotal - elapsed;

      if (remaining > 0) {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setEstimatedTime(`${minutes}m ${seconds}s`);
      }
    } else {
      setEstimatedTime('Calculating...');
      startTimeRef.current = null;
    }
  }, [isLoading, progress]);

  const loadFFmpeg = async () => {
    try {
      const ffmpeg = ffmpegRef.current;

      ffmpeg.on('log', ({ message }) => {
        if (message.includes('error') || message.includes('Error') || message.includes('ERROR')) {
          addDebugLog(`❌ FFmpeg Error: ${message}`);
        } else if (message.includes('warning') || message.includes('Warning')) {
          addDebugLog(`⚠️ FFmpeg Warning: ${message}`);
        } else {
          addDebugLog(`📝 FFmpeg: ${message}`);
        }
      });

      ffmpeg.on('progress', ({ progress: ffmpegProgress }) => {
        updateProgress('encoding', { encodingProgress: ffmpegProgress });
      });

      addDebugLog('📥 Downloading FFmpeg core...');

      // await ffmpeg.load({
      //   coreURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.js', 'text/javascript'),
      //   wasmURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.wasm', 'application/wasm'),
      //   workerURL: await toBlobURL('https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/esm/worker.js', 'text/javascript'),
      // });



      // await ffmpeg.load({
      //   coreURL: await toBlobURL(
      //     'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
      //     'text/javascript'
      //   ),
      //   wasmURL: await toBlobURL(
      //     'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
      //     'application/wasm'
      //   ),
      //   workerURL: await toBlobURL(
      //     'https://unpkg.com/@ffmpeg/ffmpeg@0.12.6/dist/esm/worker.js',
      //     'text/javascript'
      //   ),
      // });
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      // await ffmpeg.load({
      //   coreURL: 'ffmpeg/esm/ffmpeg-core.js',
      //   wasmURL: 'ffmpeg/esm/ffmpeg-core.wasm',
      // });

      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      setFfmpegLoaded(true);
      addDebugLog('✅ FFmpeg loaded successfully');

      try {
        await ffmpeg.exec(['-version']);
        addDebugLog('✅ FFmpeg version test passed');
      } catch (error) {
        addDebugLog('⚠️ FFmpeg version test failed:', error.message);
      }
    } catch (error) {
      console.error('FFmpeg load error:', error);
      addDebugLog(`❌ FFmpeg load error: ${error.message}`);
      setLoadError(`FFmpeg initialization failed: ${error.message}`);

      try {
        const module = await import('@ffmpeg/ffmpeg');
        ffmpegRef.current = new module.FFmpeg();
        setFfmpegLoaded(true);
        addDebugLog('✅ FFmpeg loaded via alternative method');
      } catch (fallbackError) {
        addDebugLog(`❌ Alternative loading also failed: ${fallbackError.message}`);
      }
    }
  };

  const checkIncompleteJobs = async () => {
    try {
      addDebugLog('🔍 Checking for incomplete jobs...');
      const jobs = await videoDB.getIncompleteJobs();
      setIncompleteJobs(jobs);

      addDebugLog(`📊 Found ${jobs.length} incomplete job(s)`);

      if (jobs.length > 0) {
        const lastJob = jobs[0];
        const age = Date.now() - lastJob.timestamp;
        const ageMinutes = Math.floor(age / 60000);

        addDebugLog(`⏰ Last job is ${ageMinutes} minutes old`);

        if (age < 2 * 60 * 60 * 1000) {
          setShowResumeDialog(true);
          addDebugLog('📋 Showing resume dialog');
        } else {
          addDebugLog('⏳ Job too old, not showing resume dialog');
          for (const job of jobs) {
            if (Date.now() - job.timestamp > 24 * 60 * 60 * 1000) {
              await videoDB.deleteJob(job.jobId);
              addDebugLog(`🧹 Cleaned up old job: ${job.jobId}`);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking incomplete jobs:', error);
      addDebugLog(`❌ Error checking incomplete jobs: ${error.message}`);
    }
  };

  const addDebugLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;

    console.log(`[VideoGenerator] ${message}`);

    setDebugLog(prev => {
      const newLog = [...prev, { message: logEntry, type, timestamp: Date.now() }];
      return newLog.slice(-200);
    });
  };

  const cleanupFFmpeg = async () => {
    try {
      const ffmpeg = ffmpegRef.current;
      if (ffmpeg && ffmpeg.loaded) {
        addDebugLog('🧹 Cleaning up FFmpeg...');
        await ffmpeg.terminate();
        addDebugLog('✅ FFmpeg cleanup complete');
      }
    } catch (error) {
      console.warn('FFmpeg cleanup error:', error);
      addDebugLog(`⚠️ FFmpeg cleanup error: ${error.message}`);
    }
  };

  // Generate video with resume capability
  const generateVideo = async (resumeJobId = null) => {
    if (slides.length === 0) {
      alert('❌ Please add some slides first.');
      return;
    }

    if (!ffmpegLoaded) {
      alert('⏳ FFmpeg is still loading. Please wait...');
      return;
    }

    if (!await checkStorageAvailability()) {
      alert('💾 Low disk space warning! Video generation may fail.');
    }

    const jobId = resumeJobId || `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCurrentJobId(jobId);

    checkpointManagerRef.current = new CheckpointManager(jobId);

    setIsLoading(true);
    setStatus('preparing');
    setProgress(0);
    setLoadError('');
    setDebugLog([]);
    setIsPaused(false);
    abortControllerRef.current = new AbortController();
    startTimeRef.current = Date.now();

    startProgressSimulation();

    try {
      addDebugLog(`🚀 Starting video generation - Job ID: ${jobId}`);

      if (resumeJobId) {
        addDebugLog('🔄 Resuming from checkpoint...');
        await resumeVideoGeneration(jobId);
      } else {
        addDebugLog('🆕 Starting new generation...');
        await startNewVideoGeneration(jobId);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        addDebugLog('⏸️ Generation was paused by user');
        setStatus('paused');
      } else {
        console.error('Video generation error:', error);
        addDebugLog(`❌ Error: ${error.message}`);
        setStatus('error');
        setLoadError(error.message);
        setIsLoading(false);

        if (checkpointManagerRef.current) {
          await checkpointManagerRef.current.saveCheckpoint('error', progress, {}, error.message);
        }
      }
      stopProgressSimulation();
    }
  };

  const startProgressSimulation = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev < 100 && status !== 'completed' && status !== 'error') {
          const increment = 0.1;
          return Math.min(prev + increment, 99);
        }
        return prev;
      });
    }, 1000);
  };

  const stopProgressSimulation = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const checkStorageAvailability = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const percentage = (estimate.usage / estimate.quota) * 100;
        addDebugLog(`💾 Storage: ${(estimate.usage / (1024 * 1024)).toFixed(2)}MB used of ${(estimate.quota / (1024 * 1024)).toFixed(2)}MB (${percentage.toFixed(1)}%)`);
        return percentage < 90;
      } catch (error) {
        addDebugLog('⚠️ Could not check storage:', error.message);
        return true;
      }
    }
    return true;
  };

  const startNewVideoGeneration = async (jobId) => {
    addDebugLog('🆕 Starting new video generation...');

    await checkpointManagerRef.current.saveCheckpoint('preparing', 0, {
      slidesCount: slides.length,
      controls,
      hasAudio: !!voice,
      totalDuration: slides.length * (controls.slideDuration || 3)
    });

    setStatus('generating_slides');
    addDebugLog(`🖼️ Creating ${slides.length} slide images...`);

    const slideImages = await generateSlidesAsImages(jobId);
    slideImagesRef.current = slideImages;

    if (slideImages.length === 0) {
      throw new Error('No slides were generated');
    }

    await checkpointManagerRef.current.saveCheckpoint('slides_generated', 30, {
      slidesGenerated: slideImages.length,
      slideData: slideImages.map(s => ({
        index: s.index,
        duration: s.duration
      }))
    });

    await createVideoFromSlides(jobId, slideImages);
  };

  const resumeVideoGeneration = async (jobId) => {
    addDebugLog(`🔄 Resuming video generation for job: ${jobId}`);

    const checkpoint = await checkpointManagerRef.current.resumeFromLastCheckpoint();

    setStatus(checkpoint.status);
    setProgress(checkpoint.progress);

    addDebugLog(`📊 Resuming from: ${checkpoint.status} at ${checkpoint.progress}%`);

    switch (checkpoint.status) {
      case 'generating_slides':
        addDebugLog('↩️ Restarting slide generation...');
        await resumeSlidesGeneration(jobId, checkpoint);
        break;

      case 'slides_generated': {
        addDebugLog('🖼️ Loading previously generated slides...');
        const blobs = await checkpointManagerRef.current.getBlobs();
        const slideImages = blobs
          .filter(b => b.type === 'slide')
          .map(b => ({
            blob: b.blob,
            index: parseInt(b.id.split('_')[1]),
            duration: controls.slideDuration || 3
          }))
          .sort((a, b) => a.index - b.index);

        if (slideImages.length === 0) {
          addDebugLog('❌ No slides found, restarting...');
          await startNewVideoGeneration(jobId);
          return;
        }

        slideImagesRef.current = slideImages;
        addDebugLog(`✅ Loaded ${slideImages.length} slides`);
        await createVideoFromSlides(jobId, slideImages);
        break;
      }

      case 'encoding': {
        addDebugLog('🎬 Restarting encoding...');
        const allBlobs = await checkpointManagerRef.current.getBlobs();
        const slidesForEncoding = allBlobs
          .filter(b => b.type === 'slide')
          .map(b => ({
            blob: b.blob,
            index: parseInt(b.id.split('_')[1]),
            duration: controls.slideDuration || 3
          }))
          .sort((a, b) => a.index - b.index);

        if (slidesForEncoding.length === 0) {
          addDebugLog('❌ No slides found for encoding');
          await startNewVideoGeneration(jobId);
          return;
        }

        slideImagesRef.current = slidesForEncoding;
        addDebugLog(`✅ Loaded ${slidesForEncoding.length} slides for encoding`);
        await createVideoFromSlides(jobId, slidesForEncoding);
        break;
      }

      default:
        addDebugLog(`❌ Cannot resume from status: ${checkpoint.status}`);
        throw new Error(`Cannot resume from status: ${checkpoint.status}`);
    }
  };

  const resumeSlidesGeneration = async (jobId, checkpoint) => {
    addDebugLog(`🔄 Resuming slide generation from checkpoint...`);

    try {
      const lastProcessedSlide = checkpoint.data?.currentSlide || 0;
      const totalSlides = checkpoint.data?.totalSlides || slides.length;

      addDebugLog(`📈 Resuming from slide ${lastProcessedSlide} of ${totalSlides}`);

      const existingBlobs = await checkpointManagerRef.current.getBlobs();
      const existingSlides = existingBlobs
        .filter(b => b.type === 'slide')
        .map(b => {
          const indexMatch = b.id.match(/slide_(\d+)/);
          return {
            blob: b.blob,
            index: indexMatch ? parseInt(indexMatch[1]) : 0,
            duration: controls.slideDuration || 3,
            filename: `slide_${indexMatch ? parseInt(indexMatch[1]) : 0}.png`
          };
        })
        .sort((a, b) => a.index - b.index);

      addDebugLog(`📁 Found ${existingSlides.length} previously generated slides`);

      const slideImages = [...existingSlides];
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');

      updateProgress('generating_slides', {
        currentSlide: existingSlides.length,
        totalSlides: slides.length
      });

      for (let i = existingSlides.length; i < slides.length; i++) {
        if (abortControllerRef.current?.signal.aborted) {
          addDebugLog('⏸️ Slide generation aborted during resume');
          throw new DOMException('Aborted', 'AbortError');
        }

        if (isPaused) {
          addDebugLog('⏸️ Generation paused during resume, waiting...');
          await new Promise(resolve => {
            const interval = setInterval(() => {
              if (!isPaused || abortControllerRef.current?.signal.aborted) {
                clearInterval(interval);
                resolve();
              }
            }, 100);
          });
        }

        setCurrentSlideIndex(i);
        const slide = slides[i];

        addDebugLog(`📄 Resuming slide ${i + 1}/${slides.length}: "${slide.text.substring(0, 50)}..."`);

        try {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (slide.image) {
            try {
              const img = new Image();
              img.crossOrigin = 'anonymous';

              await new Promise((resolve, reject) => {
                img.onload = () => resolve(true);
                img.onerror = () => reject(new Error('Image load failed'));
                img.src = slide.image;

                setTimeout(() => reject(new Error('Image load timeout')), 10000);
              });

              if (img.complete && img.naturalWidth !== 0) {
                ctx.save();
                ctx.filter = `
                  blur(${Math.min(controls.blurAmount || 0, 10)}px)
                  brightness(${controls.brightness || 100}%)
                  contrast(${controls.contrast || 100}%)
                `;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                ctx.restore();
              } else {
                throw new Error('Image not loaded properly');
              }
            } catch (imgError) {
              addDebugLog(`⚠️ Could not load image for slide ${i + 1}: ${imgError.message}`);
              const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
              gradient.addColorStop(0, '#4F46E5');
              gradient.addColorStop(1, '#7C3AED');
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
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

          if (!blob) {
            throw new Error('Failed to create image blob');
          }

          const blobId = `slide_${i}`;
          // await checkpointManagerRef.current.saveBlob(blobId, blob, 'slide');
          await saveBlobWithRetry(blobId, jobId, blob, 'slide');

          slideImages.push({
            blob,
            index: i,
            duration: controls.slideDuration || 3,
            filename: `slide_${i}.png`
          });

          updateProgress('generating_slides', {
            currentSlide: i + 1,
            totalSlides: slides.length
          });

          if (i % 3 === 0 || i === slides.length - 1) {
            await checkpointManagerRef.current.saveCheckpoint(
              'generating_slides',
              progress,
              {
                currentSlide: i + 1,
                totalSlides: slides.length,
                existingSlides: existingSlides.length,
                newlyGenerated: slideImages.length - existingSlides.length
              }
            );
          }

          addDebugLog(`✅ Slide ${i + 1} generated successfully (resumed)`);

        } catch (error) {
          addDebugLog(`❌ Error generating slide ${i + 1} during resume: ${error.message}`);

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#1F2937';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.fillStyle = '#9CA3AF';
          ctx.font = 'bold 32px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`Slide ${i + 1}`, canvas.width / 2, canvas.height / 2 - 40);
          ctx.fillText('Content', canvas.width / 2, canvas.height / 2);
          ctx.fillText(slide.text.substring(0, 100), canvas.width / 2, canvas.height / 2 + 40);

          const blob = await new Promise(resolve => {
            canvas.toBlob(resolve, 'image/png');
          });

          if (blob) {
            const blobId = `slide_${i}_error`;
            // await checkpointManagerRef.current.saveBlob(blobId, blob, 'slide');
            await saveBlobWithRetry(blobId, jobId, blob, 'slide');

            slideImages.push({
              blob,
              index: i,
              duration: controls.slideDuration || 3,
              filename: `slide_${i}.png`,
              isFallback: true
            });
            addDebugLog(`✅ Created fallback slide ${i + 1} (resumed)`);
          }
        }
      }

      slideImagesRef.current = slideImages;

      addDebugLog(`✅ Slide generation resumed successfully. Total slides: ${slideImages.length}`);
      addDebugLog(`📊 New slides generated: ${slideImages.length - existingSlides.length}`);

      await checkpointManagerRef.current.saveCheckpoint('slides_generated', 30, {
        slidesGenerated: slideImages.length,
        slideData: slideImages.map(s => ({
          index: s.index,
          duration: s.duration
        })),
        resumedFrom: lastProcessedSlide,
        originalTotal: totalSlides
      });

      await createVideoFromSlides(jobId, slideImages);

    } catch (error) {
      addDebugLog(`❌ Failed to resume slide generation: ${error.message}`);

      if (error.name !== 'AbortError') {
        addDebugLog('🔄 Fallback: Trying to continue with existing slides...');

        const existingBlobs = await checkpointManagerRef.current.getBlobs();
        const existingSlides = existingBlobs
          .filter(b => b.type === 'slide')
          .map(b => {
            const indexMatch = b.id.match(/slide_(\d+)/);
            return {
              blob: b.blob,
              index: indexMatch ? parseInt(indexMatch[1]) : 0,
              duration: controls.slideDuration || 3,
              filename: `slide_${indexMatch ? parseInt(indexMatch[1]) : 0}.png`
            };
          })
          .sort((a, b) => a.index - b.index);

        if (existingSlides.length > 0) {
          addDebugLog(`📁 Continuing with ${existingSlides.length} existing slides`);
          slideImagesRef.current = existingSlides;
          await createVideoFromSlides(jobId, existingSlides);
        } else {
          throw new Error(`Could not resume or continue: ${error.message}`);
        }
      } else {
        throw error;
      }
    }
  };

  const generateSlidesAsImages = async (jobId) => {
    const slideImages = [];
    addDebugLog(`🖼️ Generating ${slides.length} slide images...`);

    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');

    for (let i = 0; i < slides.length; i++) {
      if (abortControllerRef.current?.signal.aborted) {
        addDebugLog('⏸️ Slide generation aborted');
        throw new DOMException('Aborted', 'AbortError');
      }

      if (isPaused) {
        addDebugLog('⏸️ Generation paused, waiting...');
        await new Promise(resolve => {
          const interval = setInterval(() => {
            if (!isPaused || abortControllerRef.current?.signal.aborted) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
        });
      }

      setCurrentSlideIndex(i);
      const slide = slides[i];

      try {
        addDebugLog(`📄 Processing slide ${i + 1}/${slides.length}: "${slide.text.substring(0, 50)}..."`);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (slide.image) {
          try {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            await new Promise((resolve, reject) => {
              img.onload = () => resolve(true);
              img.onerror = () => reject(new Error('Image load failed'));
              img.src = slide.image;

              setTimeout(() => reject(new Error('Image load timeout')), 10000);
            });

            if (img.complete && img.naturalWidth !== 0) {
              ctx.save();
              ctx.filter = `
                blur(${Math.min(controls.blurAmount || 0, 10)}px)
                brightness(${controls.brightness || 100}%)
                contrast(${controls.contrast || 100}%)
              `;
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              ctx.restore();
              addDebugLog(`✅ Image loaded for slide ${i + 1}`);
            } else {
              throw new Error('Image not loaded properly');
            }
          } catch (imgError) {
            addDebugLog(`⚠️ Could not load image for slide ${i + 1}: ${imgError.message}`);
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#4F46E5');
            gradient.addColorStop(1, '#7C3AED');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
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

        if (!blob) {
          throw new Error('Failed to create image blob');
        }

        const blobId = `slide_${i}`;
        // await checkpointManagerRef.current.saveBlob(blobId, blob, 'slide');
        await saveBlobWithRetry(blobId, jobId, blob, 'slide');

        slideImages.push({
          blob,
          index: i,
          duration: controls.slideDuration || 3,
          filename: `slide_${i}.png`
        });

        updateProgress('generating_slides', {
          currentSlide: i + 1,
          totalSlides: slides.length
        });

        if (i % 3 === 0 || i === slides.length - 1) {
          await checkpointManagerRef.current.saveCheckpoint(
            'generating_slides',
            progress,
            {
              currentSlide: i + 1,
              totalSlides: slides.length
            }
          );
        }

        addDebugLog(`✅ Slide ${i + 1} generated successfully`);

      } catch (error) {
        addDebugLog(`❌ Error generating slide ${i + 1}: ${error.message}`);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#1F2937';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#9CA3AF';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Slide ${i + 1}`, canvas.width / 2, canvas.height / 2 - 40);
        ctx.fillText('Content', canvas.width / 2, canvas.height / 2);
        ctx.fillText(slide.text.substring(0, 100), canvas.width / 2, canvas.height / 2 + 40);

        const blob = await new Promise(resolve => {
          canvas.toBlob(resolve, 'image/png');
        });

        if (blob) {
          const blobId = `slide_${i}_error`;
          // await checkpointManagerRef.current.saveBlob(blobId, blob, 'slide');
          await saveBlobWithRetry(blobId, jobId, blob, 'slide');

          slideImages.push({
            blob,
            index: i,
            duration: controls.slideDuration || 3,
            filename: `slide_${i}.png`,
            isFallback: true
          });
          addDebugLog(`✅ Created fallback slide ${i + 1}`);
        }
      }
    }

    addDebugLog(`✅ ${slideImages.length} slides generated successfully`);
    return slideImages;
  };

  const createVideoFromSlides = async (jobId, slideImages) => {
    setStatus('encoding');
    addDebugLog('🎬 Starting FFmpeg video encoding...');

    await checkpointManagerRef.current.saveCheckpoint('encoding', 30, {
      slideCount: slideImages.length,
      totalDuration: slideImages.reduce((sum, slide) => sum + slide.duration, 0)
    });

    try {

      const ffmpeg = ffmpegRef.current;

      console.log('FFmpeg instance:', ffmpeg);

      if (!ffmpeg.loaded) {
        throw new Error('FFmpeg not loaded');
      }

      addDebugLog('💾 Writing slides to FFmpeg filesystem...');

      for (const slide of slideImages) {
        const fileName = `slide_${slide.index}.png`;
        await ffmpeg.writeFile(fileName, await fetchFile(slide.blob));
        addDebugLog(`📁 Written: ${fileName}`);
      }

      if (voice) {
        addDebugLog('🔊 Writing audio file...');
        await ffmpeg.writeFile('audio.mp3', await fetchFile(voice));
      }

      addDebugLog('📝 Creating concat file...');
      let concatContent = '';
      slideImages.forEach((slide, index) => {
        concatContent += `file slide_${slide.index}.png\n`;
        concatContent += `duration ${slide.duration}\n`;
      });

      await ffmpeg.writeFile('concat.txt', concatContent);

      addDebugLog('⚙️ Building FFmpeg command...');

      const command = voice ? [
        '-f', 'concat',
        '-safe', '0',
        '-i', 'concat.txt',
        '-i', 'audio.mp3',
        '-filter_complex', '[0:v]scale=1280:720,fps=30,format=yuv420p[v];[v][1:a]concat=n=1:v=1:a=1[outv][outa]',
        '-map', '[outv]',
        '-map', '[outa]',
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart',
        '-threads', '2',
        'output.mp4'
      ] : [
        '-f', 'concat',
        '-safe', '0',
        '-i', 'concat.txt',
        '-vf', 'fps=30,scale=1280:720,format=yuv420p',
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart',
        '-threads', '2',
        'output.mp4'
      ];

      addDebugLog('🚀 Executing FFmpeg command...');
      addDebugLog(`📋 Command: ffmpeg ${command.join(' ')}`);

      await ffmpeg.exec(command);

      if (abortControllerRef.current?.signal.aborted) {
        addDebugLog('⏸️ Encoding aborted');
        throw new DOMException('Aborted', 'AbortError');
      }

      addDebugLog('📥 Reading output file...');
      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data.buffer], { type: 'video/mp4' });

      if (blob.size === 0) {
        throw new Error('Generated video file is empty');
      }

      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setGeneratedVideo(blob);

      addDebugLog('📊 Getting video metadata...');
      const video = document.createElement('video');
      video.src = url;

      await new Promise((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error('Failed to load video metadata'));
        setTimeout(() => reject(new Error('Video metadata timeout')), 10000);
      });

      const duration = video.duration;
      const size = blob.size / (1024 * 1024);

      const videoInfoObj = {
        duration: duration.toFixed(1),
        size: size.toFixed(2),
        resolution: '1280x720',
        format: 'MP4',
        codec: 'H.264/AAC',
        frameRate: '30 fps',
        bitrate: `${(blob.size * 8 / duration / 1024 / 1024).toFixed(2)} Mbps`
      };

      setVideoInfo(videoInfoObj);

      addDebugLog('💾 Saving video to IndexedDB...');
      await checkpointManagerRef.current.saveBlob('video', blob, 'video');

      addDebugLog('🧹 Cleaning up temporary files...');
      await cleanupFFmpegFiles(slideImages);

      setStatus('completed');
      setProgress(100);
      setIsLoading(false);
      stopProgressSimulation();

      await checkpointManagerRef.current.saveCheckpoint('completed', 100, {
        videoUrl: url,
        videoInfo: videoInfoObj,
        fileSize: blob.size,
        generatedAt: new Date().toISOString()
      });

      await videoDB.deleteJob(jobId);
      setIncompleteJobs(prev => prev.filter(j => j.jobId !== jobId));

      addDebugLog('🎉 Video generation completed successfully!');
      addDebugLog(`📊 Video Info: ${duration.toFixed(1)}s, ${size.toFixed(2)}MB, 1280x720`);

      setTimeout(() => {
        downloadVideo();
      }, 2000);

    } catch (error) {
      addDebugLog(`❌ Video encoding error: ${error.message}`);
      throw error;
    }
  };

  const cleanupFFmpegFiles = async (slideImages) => {
    try {
      const ffmpeg = ffmpegRef.current;

      try {
        await ffmpeg.deleteFile('concat.txt');
        addDebugLog('🗑️ Deleted concat.txt');
      } catch (e) { }

      for (const slide of slideImages) {
        try {
          await ffmpeg.deleteFile(`slide_${slide.index}.png`);
        } catch (e) { }
      }

      if (voice) {
        try {
          await ffmpeg.deleteFile('audio.mp3');
          addDebugLog('🗑️ Deleted audio.mp3');
        } catch (e) { }
      }

      try {
        await ffmpeg.deleteFile('output.mp4');
        addDebugLog('🗑️ Deleted output.mp4');
      } catch (e) { }

      addDebugLog('✅ Cleanup complete');
    } catch (error) {
      console.warn('Cleanup error:', error);
      addDebugLog(`⚠️ Cleanup error: ${error.message}`);
    }
  };

  const pauseGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsPaused(true);
      setStatus('paused');
      stopProgressSimulation();
      addDebugLog('⏸️ Generation paused');

      if (checkpointManagerRef.current) {
        checkpointManagerRef.current.saveCheckpoint('paused', progress, {
          pausedAt: new Date().toISOString(),
          currentSlide: currentSlideIndex
        }).catch(console.error);
      }
    }
  };

  const resumeGeneration = () => {
    abortControllerRef.current = new AbortController();
    setIsPaused(false);
    setStatus('resuming');
    startProgressSimulation();
    addDebugLog('▶️ Resuming generation...');

    generateVideo(currentJobId);
  };

  const cancelGeneration = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsLoading(false);
    setStatus('cancelled');
    setIsPaused(false);
    stopProgressSimulation();

    if (checkpointManagerRef.current && currentJobId) {
      await checkpointManagerRef.current.saveCheckpoint('cancelled', progress, {}, 'User cancelled');
    }

    addDebugLog('⏹️ Generation cancelled by user');
  };

  const downloadVideo = () => {
    if (generatedVideo && videoUrl) {
      try {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
        const filename = `video-${timestamp}.mp4`;

        const link = document.createElement('a');
        link.href = videoUrl;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        addDebugLog(`📥 Download started: ${filename}`);
      } catch (error) {
        addDebugLog(`❌ Download failed: ${error.message}`);
        alert('Download failed. Please try saving the video manually.');
      }
    } else {
      alert('No video available to download');
    }
  };

  const retryGeneration = () => {
    if (currentJobId) {
      addDebugLog('🔄 Retrying generation...');
      generateVideo(currentJobId);
    } else {
      generateVideo();
    }
  };

  const handleResumeJob = (jobId) => {
    setShowResumeDialog(false);
    addDebugLog(`↩️ Resuming job: ${jobId}`);
    generateVideo(jobId);
  };

  const handleStartNew = async (oldJobId) => {
    setShowResumeDialog(false);

    if (oldJobId) {
      await videoDB.deleteJob(oldJobId);
      setIncompleteJobs(prev => prev.filter(j => j.jobId !== oldJobId));
      addDebugLog(`🗑️ Deleted old job: ${oldJobId}`);
    }

    generateVideo();
  };

  const handleDeleteJob = async (jobId) => {
    await videoDB.deleteJob(jobId);
    setIncompleteJobs(prev => prev.filter(j => j.jobId !== jobId));

    if (jobId === currentJobId) {
      setCurrentJobId(null);
    }

    addDebugLog(`🗑️ Deleted job: ${jobId}`);

    if (incompleteJobs.length === 1) {
      setShowResumeDialog(false);
    }
  };

  const clearDebugLog = () => {
    setDebugLog([]);
    addDebugLog('🧹 Debug log cleared');
  };

  const exportDebugLog = () => {
    const logText = debugLog.map(entry => entry.message).join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `debug-log-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addDebugLog('📤 Debug log exported');
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'paused':
        return <Pause className="h-6 w-6 text-yellow-500" />;
      case 'cancelled':
        return <StopCircle className="h-6 w-6 text-gray-500" />;
      case 'idle':
        return <FileVideo className="h-6 w-6 text-blue-500" />;
      default:
        return <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'idle':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  const getStatusMessage = () => {
    const messages = {
      preparing: 'Preparing video generation...',
      generating_slides: `Creating slides (${currentSlideIndex + 1}/${slides.length})...`,
      slides_generated: 'Slides generated, encoding video...',
      encoding: 'Encoding video with FFmpeg...',
      completed: 'Video ready!',
      error: 'Error occurred',
      paused: 'Paused',
      cancelled: 'Cancelled',
      resuming: 'Resuming...',
      idle: 'Ready to generate'
    };
    return messages[status] || status;
  };

  const getAdjustedProgress = () => {
    if (status === 'generating_slides' || status === 'resuming') {
      if (slideImagesRef.current.length > 0 && currentSlideIndex > 0) {
        return calculateResumeProgress(
          slideImagesRef.current.length,
          slides.length,
          currentSlideIndex + 1
        );
      }
      return getProgressForStage(status, currentSlideIndex + 1, slides.length);
    } else if (status === 'encoding') {
      return getProgressForStage(status, progress / 100, 1);
    }
    return progress;
  };

  const isReadyToGenerate = slides.length > 0 && ffmpegLoaded;
  const totalDuration = slides.length * (controls.slideDuration || 3);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6">

      {showResumeDialog && incompleteJobs.length > 0 && (
        <ResumeDialog
          job={incompleteJobs[0]}
          onResume={handleResumeJob}
          onStartNew={handleStartNew}
          onDelete={handleDeleteJob}
          onCancel={() => setShowResumeDialog(false)}
        />
      )}

      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-6 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <FileVideo className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Advanced Video Generator
              </h2>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                Create professional videos from slides with audio
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {ffmpegLoaded ? (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                <CheckCircle className="h-4 w-4 mr-1.5" />
                FFmpeg Ready
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200">
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Loading FFmpeg...
              </span>
            )}

            {incompleteJobs.length > 0 && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border border-purple-200">
                <AlertTriangle className="h-4 w-4 mr-1.5" />
                {incompleteJobs.length} incomplete job(s)
              </span>
            )}

            <button
              onClick={() => setShowDebug(!showDebug)}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition-colors"
            >
              {showDebug ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1.5" />
                  Hide Debug
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1.5" />
                  Show Debug
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <ImageIcon className="h-5 w-5" />
              <div className="text-sm font-medium">Slides</div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{slides.length}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center gap-2 text-purple-700 mb-2">
              <Clock className="h-5 w-5" />
              <div className="text-sm font-medium">Duration</div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalDuration}s
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <Music className="h-5 w-5" />
              <div className="text-sm font-medium">Audio</div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {voice ? (
                <span className="text-green-600">✓ Yes</span>
              ) : (
                <span className="text-gray-400">No</span>
              )}
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center gap-2 text-amber-700 mb-2">
              <Globe className="h-5 w-5" />
              <div className="text-sm font-medium">Resolution</div>
            </div>
            <div className="text-2xl font-bold text-gray-900">720p HD</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => generateVideo()}
            disabled={!isReadyToGenerate || isLoading}
            className={`inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] ${!isReadyToGenerate || isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
              }`}
          >
            <Play className="h-5 w-5 mr-2" />
            {isLoading ? 'Generating...' : 'Generate Video'}
          </button>

          {isLoading && (
            <>
              {isPaused ? (
                <button
                  onClick={resumeGeneration}
                  className="inline-flex items-center px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Resume
                </button>
              ) : (
                <button
                  onClick={pauseGeneration}
                  className="inline-flex items-center px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                >
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </button>
              )}

              <button
                onClick={cancelGeneration}
                className="inline-flex items-center px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              >
                <StopCircle className="h-5 w-5 mr-2" />
                Cancel
              </button>
            </>
          )}

          {status === 'completed' && generatedVideo && (
            <button
              onClick={downloadVideo}
              className="inline-flex items-center px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Video
            </button>
          )}

          {status === 'error' && (
            <button
              onClick={retryGeneration}
              className="inline-flex items-center px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Retry
            </button>
          )}

          {incompleteJobs.length > 0 && !showResumeDialog && (
            <button
              onClick={() => setShowResumeDialog(true)}
              className="inline-flex items-center px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Resume ({incompleteJobs.length})
            </button>
          )}

          {debugLog.length > 0 && (
            <button
              onClick={exportDebugLog}
              className="inline-flex items-center px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              <Save className="h-5 w-5 mr-2" />
              Export Logs
            </button>
          )}
        </div>

        {(isLoading || status !== 'idle') && (
          <div className="mb-6">
            <div className={`p-4 rounded-xl border ${getStatusColor()} mb-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon()}
                  <div>
                    <h3 className="font-bold">{getStatusMessage()}</h3>
                    <p className="text-sm opacity-80">
                      {isLoading && `Estimated time remaining: ${estimatedTime}`}
                    </p>
                  </div>
                </div>
                <div className="text-2xl font-bold">{getAdjustedProgress().toFixed(1)}%</div>
              </div>
            </div>

            <div className="relative mb-2">
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out rounded-full relative"
                  style={{ width: `${getAdjustedProgress()}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30 animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>0%</span>
                <span>{getAdjustedProgress().toFixed(1)}%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-4">
              {['preparing', 'generating_slides', 'encoding', 'completed'].map((stage, index) => (
                <div
                  key={stage}
                  className={`text-center p-2 rounded-lg ${(status === stage ||
                    (stage === 'completed' && status === 'completed') ||
                    (index < ['preparing', 'generating_slides', 'encoding', 'completed'].indexOf(status)))
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-gray-50 text-gray-500 border border-gray-200'
                    }`}
                >
                  <div className="text-xs font-medium capitalize">
                    {stage.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {videoInfo && status === 'completed' && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Video Generated Successfully
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="bg-white/70 p-3 rounded-lg backdrop-blur-sm">
                <div className="text-xs text-gray-600 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Duration
                </div>
                <div className="font-bold text-gray-900">{videoInfo.duration}s</div>
              </div>
              <div className="bg-white/70 p-3 rounded-lg backdrop-blur-sm">
                <div className="text-xs text-gray-600 flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  Size
                </div>
                <div className="font-bold text-gray-900">{videoInfo.size} MB</div>
              </div>
              <div className="bg-white/70 p-3 rounded-lg backdrop-blur-sm">
                <div className="text-xs text-gray-600 flex items-center gap-1">
                  <Maximize2 className="h-3 w-3" />
                  Resolution
                </div>
                <div className="font-bold text-gray-900">{videoInfo.resolution}</div>
              </div>
              <div className="bg-white/70 p-3 rounded-lg backdrop-blur-sm">
                <div className="text-xs text-gray-600 flex items-center gap-1">
                  <FileVideo className="h-3 w-3" />
                  Format
                </div>
                <div className="font-bold text-gray-900">{videoInfo.format}</div>
              </div>
              <div className="bg-white/70 p-3 rounded-lg backdrop-blur-sm">
                <div className="text-xs text-gray-600 flex items-center gap-1">
                  <Cpu className="h-3 w-3" />
                  Codec
                </div>
                <div className="font-bold text-gray-900">{videoInfo.codec}</div>
              </div>
            </div>
          </div>
        )}

        {loadError && (
          <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-200">
            <div className="flex items-center gap-2 text-red-700 mb-2">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Error Occurred</span>
            </div>
            <p className="text-red-600">{loadError}</p>
            <button
              onClick={() => setLoadError('')}
              className="mt-2 text-sm text-red-700 hover:text-red-900 font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* {workerError && (
          <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
            <div className="flex items-center gap-2 text-amber-700 mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Worker Error</span>
            </div>
            <p className="text-amber-600">{workerError}</p>
          </div>
        )} */}
      </div>

      {showDebug && (
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl p-6 mb-6 border border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Database className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Debug Log</h3>
                <p className="text-gray-400 text-sm">Real-time processing information</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={clearDebugLog}
                className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </button>
              <button
                onClick={exportDebugLog}
                className="px-3 py-1.5 text-sm bg-blue-900 hover:bg-blue-800 text-blue-200 rounded-lg border border-blue-800 transition-colors flex items-center gap-1.5"
              >
                <Save className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          <div className="bg-gray-950 text-gray-300 rounded-xl p-4 font-mono text-sm h-64 overflow-y-auto border border-gray-800">
            {debugLog.length === 0 ? (
              <div className="text-gray-500 italic h-full flex items-center justify-center">
                <div className="text-center">
                  <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Logs will appear here during processing...</p>
                </div>
              </div>
            ) : (
              debugLog.map((entry, index) => {
                let bgColor = 'bg-transparent';
                let textColor = 'text-gray-400';

                if (entry.type === 'error') {
                  bgColor = 'bg-red-900/20';
                  textColor = 'text-red-300';
                } else if (entry.type === 'warning') {
                  bgColor = 'bg-yellow-900/20';
                  textColor = 'text-yellow-300';
                } else if (entry.message.includes('✅')) {
                  bgColor = 'bg-green-900/20';
                  textColor = 'text-green-300';
                } else if (entry.message.includes('🚀') || entry.message.includes('🎉')) {
                  bgColor = 'bg-blue-900/20';
                  textColor = 'text-blue-300';
                }

                return (
                  <div
                    key={index}
                    className={`py-1.5 px-2 rounded mb-1 border-l-2 ${bgColor} ${entry.type === 'error' ? 'border-l-red-500' :
                      entry.type === 'warning' ? 'border-l-yellow-500' :
                        entry.message.includes('✅') ? 'border-l-green-500' :
                          'border-l-gray-700'
                      }`}
                  >
                    <div className={`flex items-start gap-2 ${textColor}`}>
                      <span className="opacity-50 text-xs mt-0.5 whitespace-nowrap">
                        {entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : '--:--:--'}
                      </span>
                      <span className="flex-1">{entry.message}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-between items-center mt-4 text-sm">
            <div className="text-gray-400 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>{debugLog.length} log entries • All processing happens locally in your browser</span>
            </div>
            <div className="text-gray-500">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">System Information</h3>
            <p className="text-gray-600 text-sm">Current generation environment</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <Cpu className="h-5 w-5" />
              <div className="font-medium">FFmpeg Status</div>
            </div>
            <div className="text-gray-900">
              {ffmpegLoaded ? (
                <span className="text-green-600 font-semibold">✓ Ready</span>
              ) : (
                <span className="text-amber-600 font-semibold">⏳ Loading...</span>
              )}
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
            <div className="flex items-center gap-2 text-purple-700 mb-2">
              <Database className="h-5 w-5" />
              <div className="font-medium">Storage</div>
            </div>
            <div className="text-gray-900">
              {incompleteJobs.length > 0 ? (
                <span className="font-semibold">{incompleteJobs.length} saved job(s)</span>
              ) : (
                <span className="text-gray-500">No saved jobs</span>
              )}
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <Info className="h-5 w-5" />
              <div className="font-medium">Ready Status</div>
            </div>
            <div className="text-gray-900">
              {isReadyToGenerate ? (
                <span className="text-green-600 font-semibold">✓ Ready to generate</span>
              ) : (
                <span className="text-amber-600 font-semibold">
                  {slides.length === 0 ? 'Add slides first' : 'Waiting for FFmpeg...'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>All video processing happens locally in your browser. No data is sent to servers.</span>
        </div>
      </div>
    </div>
  );



};

export default VideoGenerator;