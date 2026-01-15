// // src/hooks/useVideoWorker.js
// import { useState, useEffect, useRef, useCallback } from 'react';

// export const useVideoWorker = () => {
//     const workerRef = useRef(null);
//     const [isWorkerReady, setIsWorkerReady] = useState(false);
//     const [workerError, setWorkerError] = useState(null);

//     useEffect(() => {
//         // Initialize worker
//         workerRef.current = new Worker(new URL('../workers/video.worker.js', import.meta.url), {
//           type: 'module'
//         });


//         // workerRef.current = new Worker(
//         //     new URL('../workers/video.worker.js', import.meta.url),
//         //     {
//         //         type: 'classic' // ✅ MUST
//         //     }
//         // );


//         workerRef.current.onmessage = (e) => {
//             const { type, jobId, data } = e.data;

//             switch (type) {
//                 case 'FFMPEG_READY':
//                     setIsWorkerReady(true);
//                     setWorkerError(null);
//                     break;

//                 case 'ERROR':
//                     setWorkerError(data.error);
//                     console.error('Worker error:', data);
//                     break;

//                 default:
//                     // Other messages handled by parent component
//                     break;
//             }
//         };

//         workerRef.current.onerror = (error) => {
//             setWorkerError(error.message);
//             console.error('Worker error:', error);
//         };

//         // Initialize FFmpeg in worker
//         workerRef.current.postMessage({
//             type: 'INIT_FFMPEG',
//             jobId: 'init'
//         });

//         return () => {
//             if (workerRef.current) {
//                 workerRef.current.terminate();
//             }
//         };
//     }, []);

//     const startGeneration = useCallback((jobId, data) => {
//         if (!workerRef.current) {
//             throw new Error('Worker not initialized');
//         }

//         return new Promise((resolve, reject) => {
//             const handleMessage = (e) => {
//                 const { type, jobId: responseJobId, data: responseData } = e.data;

//                 if (responseJobId !== jobId) return;

//                 switch (type) {
//                     case 'VIDEO_ENCODED':
//                         workerRef.current.removeEventListener('message', handleMessage);
//                         resolve(responseData);
//                         break;

//                     case 'ERROR':
//                         workerRef.current.removeEventListener('message', handleMessage);
//                         reject(new Error(responseData.error));
//                         break;
//                 }
//             };

//             workerRef.current.addEventListener('message', handleMessage);
//             workerRef.current.postMessage({
//                 type: 'ENCODE_VIDEO',
//                 jobId,
//                 data
//             });
//         });
//     }, []);

//     const generateSlides = useCallback((jobId, data) => {
//         if (!workerRef.current) {
//             throw new Error('Worker not initialized');
//         }

//         return new Promise((resolve, reject) => {
//             const handleMessage = (e) => {
//                 const { type, jobId: responseJobId, data: responseData } = e.data;

//                 if (responseJobId !== jobId) return;

//                 switch (type) {
//                     case 'SLIDES_GENERATED':
//                         workerRef.current.removeEventListener('message', handleMessage);
//                         resolve(responseData.slides);
//                         break;

//                     case 'ERROR':
//                         workerRef.current.removeEventListener('message', handleMessage);
//                         reject(new Error(responseData.error));
//                         break;
//                 }
//             };

//             workerRef.current.addEventListener('message', handleMessage);
//             workerRef.current.postMessage({
//                 type: 'GENERATE_SLIDES',
//                 jobId,
//                 data
//             });
//         });
//     }, []);

//     const cancelJob = useCallback((jobId) => {
//         if (workerRef.current) {
//             workerRef.current.postMessage({
//                 type: 'CANCEL',
//                 jobId
//             });
//         }
//     }, []);

//     const sendProgressCallback = useCallback((callback) => {
//         if (!workerRef.current) return;

//         const handleProgress = (e) => {
//             const { type, data } = e.data;
//             if (type === 'PROGRESS') {
//                 callback(data);
//             }
//         };

//         workerRef.current.addEventListener('message', handleProgress);

//         return () => {
//             workerRef.current.removeEventListener('message', handleProgress);
//         };
//     }, []);

//     const sendLogCallback = useCallback((callback) => {
//         if (!workerRef.current) return;

//         const handleLog = (e) => {
//             const { type, data } = e.data;
//             if (type === 'LOG') {
//                 callback(data.message);
//             }
//         };

//         workerRef.current.addEventListener('message', handleLog);

//         return () => {
//             workerRef.current.removeEventListener('message', handleLog);
//         };
//     }, []);

//     return {
//         isWorkerReady,
//         workerError,
//         startGeneration,
//         generateSlides,
//         cancelJob,
//         sendProgressCallback,
//         sendLogCallback
//     };
// };


// src/hooks/useVideoWorker.js - COMPLETE WORKING VERSION
// import { useState, useEffect, useRef, useCallback } from 'react';

// export const useVideoWorker = () => {
//   const workerRef = useRef(null);
//   const [isWorkerReady, setIsWorkerReady] = useState(false);
//   const [workerError, setWorkerError] = useState(null);
//   const [workerStatus, setWorkerStatus] = useState({
//     initialized: false,
//     ffmpegLoaded: false,
//     lastPing: null
//   });
  
//   // Callbacks registry for job-specific handlers
//   const callbacksRef = useRef(new Map());
  
//   // Initialize worker
//   useEffect(() => {
//     const initializeWorker = () => {
//       try {
//         console.log('🔄 Initializing video worker...');
        
//         // Create worker as classic worker (not module)
//         const workerURL = new URL('../workers/video.worker.js', import.meta.url);
        
//         workerRef.current = new Worker(workerURL, {
//           name: 'VideoGeneratorWorker'
//           // Note: Not using type: 'module' to avoid importScripts issues
//         });
        
//         // Set up global message handler
//         workerRef.current.onmessage = (e) => {
//           const { type, jobId, data } = e.data;
          
//           switch (type) {
//             case 'FFMPEG_READY':
//               console.log('✅ Worker: FFmpeg ready');
//               setIsWorkerReady(true);
//               setWorkerError(null);
//               setWorkerStatus(prev => ({
//                 ...prev,
//                 initialized: true,
//                 ffmpegLoaded: true,
//                 lastPing: Date.now()
//               }));
//               break;
              
//             case 'ERROR':
//               console.error('❌ Worker error:', data);
//               setWorkerError({
//                 message: data.error || 'Unknown worker error',
//                 stack: data.stack,
//                 context: data.context,
//                 timestamp: data.timestamp
//               });
//               setWorkerStatus(prev => ({
//                 ...prev,
//                 ffmpegLoaded: false,
//                 lastPing: Date.now()
//               }));
//               break;
              
//             case 'LOG':
//               console.log(`📝 Worker: ${data.message}`);
//               break;
              
//             case 'PROGRESS':
//               // Forward progress to registered callback
//               const progressCallback = callbacksRef.current.get(`${jobId}_progress`);
//               if (progressCallback) {
//                 progressCallback(data);
//               }
//               break;
              
//             case 'SLIDES_GENERATED':
//             case 'VIDEO_ENCODED':
//             case 'IMAGE_PROCESSED':
//             case 'WORKER_TESTED':
//             case 'CANCELLED':
//               // Handle success responses via registered callbacks
//               const successCallback = callbacksRef.current.get(`${jobId}_success`);
//               const errorCallback = callbacksRef.current.get(`${jobId}_error`);
              
//               if (successCallback) {
//                 successCallback(data);
//               }
              
//               // Cleanup callbacks
//               callbacksRef.current.delete(`${jobId}_success`);
//               callbacksRef.current.delete(`${jobId}_error`);
//               callbacksRef.current.delete(`${jobId}_progress`);
//               break;
              
//             default:
//               console.log(`📨 Unknown worker message type: ${type}`, data);
//           }
//         };
        
//         workerRef.current.onerror = (errorEvent) => {
//           console.error('❌ Worker error event:', errorEvent);
//           const error = {
//             message: errorEvent.message || 'Worker error',
//             filename: errorEvent.filename,
//             lineno: errorEvent.lineno,
//             colno: errorEvent.colno
//           };
//           setWorkerError(error);
//           setWorkerStatus(prev => ({
//             ...prev,
//             ffmpegLoaded: false,
//             lastPing: Date.now()
//           }));
//         };
        
//         workerRef.current.onmessageerror = (event) => {
//           console.error('❌ Worker message error:', event);
//           setWorkerError({
//             message: 'Failed to deserialize message from worker',
//             event
//           });
//         };
        
//         // Initialize FFmpeg in worker
//         setTimeout(() => {
//           if (workerRef.current) {
//             workerRef.current.postMessage({
//               type: 'INIT_FFMPEG',
//               jobId: 'init'
//             });
//           }
//         }, 100);
        
//         // Test worker after initialization
//         const testTimeout = setTimeout(() => {
//           if (workerRef.current && !isWorkerReady) {
//             testWorker();
//           }
//         }, 5000);
        
//         return () => clearTimeout(testTimeout);
        
//       } catch (error) {
//         console.error('❌ Failed to initialize worker:', error);
//         setWorkerError({
//           message: `Worker initialization failed: ${error.message}`,
//           stack: error.stack
//         });
//       }
//     };
    
//     initializeWorker();
    
//     // Cleanup on unmount
//     return () => {
//       if (workerRef.current) {
//         console.log('🧹 Terminating worker...');
//         workerRef.current.terminate();
//         workerRef.current = null;
//         setIsWorkerReady(false);
//         setWorkerError(null);
//         callbacksRef.current.clear();
//       }
//     };
//   }, []);
  
//   // Test worker function
//   const testWorker = useCallback(() => {
//     if (!workerRef.current) {
//       throw new Error('Worker not initialized');
//     }
    
//     return new Promise((resolve, reject) => {
//       const jobId = `test_${Date.now()}`;
      
//       // Register callbacks
//       callbacksRef.current.set(`${jobId}_success`, (data) => {
//         resolve(data);
//       });
      
//       callbacksRef.current.set(`${jobId}_error`, (error) => {
//         reject(new Error(error.error || 'Worker test failed'));
//       });
      
//       // Send test message
//       workerRef.current.postMessage({
//         type: 'TEST_WORKER',
//         jobId,
//         data: { test: true }
//       });
      
//       // Timeout after 10 seconds
//       setTimeout(() => {
//         if (callbacksRef.current.has(`${jobId}_success`)) {
//           reject(new Error('Worker test timeout'));
//           callbacksRef.current.delete(`${jobId}_success`);
//           callbacksRef.current.delete(`${jobId}_error`);
//         }
//       }, 10000);
//     });
//   }, []);
  
//   // Start video generation
//   const startGeneration = useCallback((jobId, data) => {
//     if (!workerRef.current) {
//       throw new Error('Worker not initialized');
//     }
    
//     if (!isWorkerReady) {
//       throw new Error('Worker is not ready. Please wait for initialization.');
//     }
    
//     return new Promise((resolve, reject) => {
//       // Register success callback
//       callbacksRef.current.set(`${jobId}_success`, (result) => {
//         resolve(result);
//       });
      
//       // Register error callback
//       callbacksRef.current.set(`${jobId}_error`, (errorData) => {
//         reject(new Error(errorData.error || 'Worker encoding failed'));
//       });
      
//       // Send encoding request
//       workerRef.current.postMessage({
//         type: 'ENCODE_VIDEO',
//         jobId,
//         data
//       });
      
//       // Set timeout for operation
//       setTimeout(() => {
//         if (callbacksRef.current.has(`${jobId}_success`)) {
//           reject(new Error('Video encoding timeout (5 minutes)'));
//           // Cleanup callbacks
//           callbacksRef.current.delete(`${jobId}_success`);
//           callbacksRef.current.delete(`${jobId}_error`);
//           callbacksRef.current.delete(`${jobId}_progress`);
//         }
//       }, 300000); // 5 minutes timeout
//     });
//   }, [isWorkerReady]);
  
//   // Generate slides
//   const generateSlides = useCallback((jobId, data) => {
//     if (!workerRef.current) {
//       throw new Error('Worker not initialized');
//     }
    
//     if (!isWorkerReady) {
//       throw new Error('Worker is not ready. Please wait for initialization.');
//     }
    
//     return new Promise((resolve, reject) => {
//       // Register success callback
//       callbacksRef.current.set(`${jobId}_success`, (result) => {
//         resolve(result.slides || []);
//       });
      
//       // Register error callback
//       callbacksRef.current.set(`${jobId}_error`, (errorData) => {
//         reject(new Error(errorData.error || 'Slide generation failed'));
//       });
      
//       // Send slide generation request
//       workerRef.current.postMessage({
//         type: 'GENERATE_SLIDES',
//         jobId,
//         data
//       });
      
//       // Set timeout
//       setTimeout(() => {
//         if (callbacksRef.current.has(`${jobId}_success`)) {
//           reject(new Error('Slide generation timeout (3 minutes)'));
//           callbacksRef.current.delete(`${jobId}_success`);
//           callbacksRef.current.delete(`${jobId}_error`);
//           callbacksRef.current.delete(`${jobId}_progress`);
//         }
//       }, 180000); // 3 minutes timeout
//     });
//   }, [isWorkerReady]);
  
//   // Process image
//   const processImage = useCallback((jobId, data) => {
//     if (!workerRef.current) {
//       throw new Error('Worker not initialized');
//     }
    
//     return new Promise((resolve, reject) => {
//       callbacksRef.current.set(`${jobId}_success`, (result) => {
//         resolve(result.image);
//       });
      
//       callbacksRef.current.set(`${jobId}_error`, (errorData) => {
//         reject(new Error(errorData.error || 'Image processing failed'));
//       });
      
//       workerRef.current.postMessage({
//         type: 'PROCESS_IMAGE',
//         jobId,
//         data
//       });
      
//       setTimeout(() => {
//         if (callbacksRef.current.has(`${jobId}_success`)) {
//           reject(new Error('Image processing timeout'));
//           callbacksRef.current.delete(`${jobId}_success`);
//           callbacksRef.current.delete(`${jobId}_error`);
//         }
//       }, 30000);
//     });
//   }, []);
  
//   // Cancel job
//   const cancelJob = useCallback((jobId) => {
//     if (workerRef.current) {
//       // Cleanup callbacks for this job
//       callbacksRef.current.delete(`${jobId}_success`);
//       callbacksRef.current.delete(`${jobId}_error`);
//       callbacksRef.current.delete(`${jobId}_progress`);
      
//       // Send cancel message
//       workerRef.current.postMessage({
//         type: 'CANCEL',
//         jobId
//       });
//     }
//   }, []);
  
//   // Register progress callback
//   const registerProgressCallback = useCallback((jobId, callback) => {
//     if (typeof callback === 'function') {
//       callbacksRef.current.set(`${jobId}_progress`, callback);
//       return () => {
//         callbacksRef.current.delete(`${jobId}_progress`);
//       };
//     }
//   }, []);
  
//   // Register log callback
//   const registerLogCallback = useCallback((callback) => {
//     if (!workerRef.current || typeof callback !== 'function') return () => {};
    
//     const handleLog = (e) => {
//       if (e.data.type === 'LOG') {
//         callback(e.data.data.message);
//       }
//     };
    
//     workerRef.current.addEventListener('message', handleLog);
    
//     return () => {
//       if (workerRef.current) {
//         workerRef.current.removeEventListener('message', handleLog);
//       }
//     };
//   }, []);
  
//   // Restart worker
//   const restartWorker = useCallback(() => {
//     if (workerRef.current) {
//       workerRef.current.terminate();
//       workerRef.current = null;
//     }
    
//     setIsWorkerReady(false);
//     setWorkerError(null);
//     setWorkerStatus({
//       initialized: false,
//       ffmpegLoaded: false,
//       lastPing: null
//     });
//     callbacksRef.current.clear();
    
//     // Re-initialize
//     setTimeout(() => {
//       const initializeWorker = () => {
//         try {
//           const workerURL = new URL('../workers/video.worker.js', import.meta.url);
//           workerRef.current = new Worker(workerURL, {
//             name: 'VideoGeneratorWorker_Restarted'
//           });
          
//           // Re-setup handlers
//           workerRef.current.onmessage = (e) => {
//             if (e.data.type === 'FFMPEG_READY') {
//               setIsWorkerReady(true);
//               setWorkerError(null);
//             }
//           };
          
//           workerRef.current.postMessage({
//             type: 'INIT_FFMPEG',
//             jobId: 'restart_init'
//           });
          
//         } catch (error) {
//           setWorkerError({
//             message: `Failed to restart worker: ${error.message}`
//           });
//         }
//       };
      
//       initializeWorker();
//     }, 1000);
//   }, []);
  
//   // Get worker health status
//   const getWorkerHealth = useCallback(() => {
//     return {
//       ready: isWorkerReady,
//       error: workerError,
//       status: workerStatus,
//       workerExists: !!workerRef.current,
//       activeJobs: callbacksRef.current.size / 3 // Divide by 3 (success, error, progress)
//     };
//   }, [isWorkerReady, workerError, workerStatus]);
  
//   // Initialize worker on mount
//   const initializeWorker = useCallback(() => {
//     if (!workerRef.current) {
//       const workerURL = new URL('../workers/video.worker.js', import.meta.url);
//       workerRef.current = new Worker(workerURL, {
//         name: 'VideoGeneratorWorker'
//       });
      
//       workerRef.current.postMessage({
//         type: 'INIT_FFMPEG',
//         jobId: 'manual_init'
//       });
//     }
//   }, []);
  
//   return {
//     // State
//     isWorkerReady,
//     workerError,
//     workerStatus: getWorkerHealth(),
    
//     // Actions
//     startGeneration,
//     generateSlides,
//     processImage,
//     cancelJob,
//     testWorker,
//     restartWorker,
//     initializeWorker,
    
//     // Callbacks
//     registerProgressCallback,
//     registerLogCallback,
    
//     // Utility
//     workerInstance: workerRef.current
//   };
// };

// export default useVideoWorker;

import { useEffect, useRef, useState } from 'react'

export const useVideoWorker = () => {
  const workerRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/video.worker.js', import.meta.url),
      { type: 'module' }
    )

    worker.onmessage = (e) => {
      const { type, data } = e.data

      if (type === 'READY') setReady(true)
      if (type === 'ERROR') setError(data.message)
      if (type === 'DONE') {
        const url = URL.createObjectURL(data.blob)
        console.log('VIDEO URL:', url)
      }
    }

    worker.postMessage({ type: 'INIT' })
    workerRef.current = worker

    return () => worker.terminate()
  }, [])

  const encode = (images, audio) => {
    workerRef.current.postMessage({
      type: 'ENCODE',
      data: { images, audio }
    })
  }

  return { ready, error, encode }
}
