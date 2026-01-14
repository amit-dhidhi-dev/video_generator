// import React, { useState, useRef } from 'react';
// import { Upload, Play, Pause, FileText, Music, AlertCircle } from 'lucide-react';

// export default function WordTimingAnalyzer() {
//   const [script, setScript] = useState('');
//   const [audioFile, setAudioFile] = useState(null);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [results, setResults] = useState(null);
//   const [error, setError] = useState('');
//   const [analysisMethod, setAnalysisMethod] = useState('waveform');
//   const audioRef = useRef(null);

//   // Waveform analysis - pauses detect karta hai
//   const analyzeWithWaveform = async (audioBuffer, words) => {
//     const channelData = audioBuffer.getChannelData(0);
//     const sampleRate = audioBuffer.sampleRate;
//     const duration = audioBuffer.duration;
    
//     // Speech detection threshold
//     const threshold = 0.02;
//     const windowSize = Math.floor(sampleRate * 0.1); // 100ms window
    
//     // Find speech segments (pauses ko exclude karke)
//     const speechSegments = [];
//     let inSpeech = false;
//     let segmentStart = 0;
    
//     for (let i = 0; i < channelData.length; i += windowSize) {
//       const window = channelData.slice(i, i + windowSize);
//       const energy = Math.sqrt(window.reduce((sum, val) => sum + val * val, 0) / window.length);
      
//       if (energy > threshold) {
//         if (!inSpeech) {
//           segmentStart = i / sampleRate;
//           inSpeech = true;
//         }
//       } else {
//         if (inSpeech) {
//           speechSegments.push({
//             start: segmentStart,
//             end: i / sampleRate,
//             duration: (i / sampleRate) - segmentStart
//           });
//           inSpeech = false;
//         }
//       }
//     }
    
//     // Last segment
//     if (inSpeech) {
//       speechSegments.push({
//         start: segmentStart,
//         end: duration,
//         duration: duration - segmentStart
//       });
//     }
    
//     // Total speech time (pauses excluded)
//     const totalSpeechTime = speechSegments.reduce((sum, seg) => sum + seg.duration, 0);
//     const totalPauseTime = duration - totalSpeechTime;
    
//     // Calculate per-word timing
//     const totalWords = words.length;
//     const timePerWord = totalSpeechTime / totalWords;
//     const timeFor30Words = timePerWord * 30;
    
//     // Estimate 30 words ki actual position
//     const wordsPerSegment = speechSegments.map(seg => 
//       Math.round((seg.duration / totalSpeechTime) * totalWords)
//     );
    
//     let wordCount = 0;
//     let timeAt30Words = 0;
    
//     for (let i = 0; i < speechSegments.length; i++) {
//       wordCount += wordsPerSegment[i];
//       if (wordCount >= 30) {
//         const wordsInThisSegment = 30 - (wordCount - wordsPerSegment[i]);
//         const timeInSegment = (wordsInThisSegment / wordsPerSegment[i]) * speechSegments[i].duration;
//         timeAt30Words = speechSegments[i].start + timeInSegment;
//         break;
//       }
//     }
    
//     return {
//       totalWords,
//       audioDuration: duration,
//       totalSpeechTime,
//       totalPauseTime,
//       timeFor30Words,
//       timeAt30Words: timeAt30Words || timeFor30Words,
//       wordsPerSecond: totalWords / totalSpeechTime,
//       wordsPerMinute: (totalWords / totalSpeechTime) * 60,
//       secondsPerWord: timePerWord,
//       speechSegments: speechSegments.length,
//       pausePercentage: (totalPauseTime / duration) * 100
//     };
//   };

//   const analyzeWordTiming = async () => {
//     if (!script.trim() || !audioFile) {
//       setError('Script aur audio file dono required hain');
//       return;
//     }

//     setIsAnalyzing(true);
//     setError('');
//     setResults(null);
    
//     try {
//       const words = script.trim().split(/\s+/).filter(w => w.length > 0);
      
//       if (words.length < 30) {
//         setError('Script mein kam se kam 30 words hone chahiye');
//         setIsAnalyzing(false);
//         return;
//       }
      
//       // Audio ko decode karein
//       const arrayBuffer = await audioFile.arrayBuffer();
//       const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//       const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
//       // Waveform analysis
//       const analysisResults = await analyzeWithWaveform(audioBuffer, words);
      
//       analysisResults.wordsList = words.slice(0, 30);
//       analysisResults.totalWords = words.length;
      
//       setResults(analysisResults);
      
//     } catch (error) {
//       setError('Error analyzing audio: ' + error.message);
//       console.error(error);
//     } finally {
//       setIsAnalyzing(false);
//     }
//   };

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = (seconds % 60).toFixed(3);
//     return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
//       <div className="max-w-4xl mx-auto">
//         <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
//           <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
//             <FileText className="text-indigo-600" />
//             Word Timing Analyzer Pro
//           </h1>
//           <p className="text-gray-600 mb-2">Pauses ko detect karke accurate timing</p>
//           <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-6">
//             <p className="text-sm text-blue-800">
//               ✨ Audio waveform analysis se pauses automatically detect hote hain
//             </p>
//           </div>

//           {error && (
//             <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
//               <div className="flex items-center gap-2">
//                 <AlertCircle className="text-red-500" size={20} />
//                 <p className="text-red-700">{error}</p>
//               </div>
//             </div>
//           )}

//           {/* Script Input */}
//           <div className="mb-6">
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Script/Text (minimum 30 words)
//             </label>
//             <textarea
//               className="w-full border-2 border-gray-300 rounded-lg p-4 focus:border-indigo-500 focus:outline-none min-h-40 font-mono text-sm"
//               placeholder="Apni script yahan paste karein..."
//               value={script}
//               onChange={(e) => setScript(e.target.value)}
//             />
//             <p className="text-sm text-gray-500 mt-2">
//               Words count: {script.trim().split(/\s+/).filter(w => w).length}
//             </p>
//           </div>

//           {/* Audio Upload */}
//           <div className="mb-6">
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Audio File
//             </label>
//             <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
//               <input
//                 type="file"
//                 accept="audio/*"
//                 onChange={(e) => {
//                   setAudioFile(e.target.files[0]);
//                   setResults(null);
//                   setError('');
//                 }}
//                 className="hidden"
//                 id="audio-upload"
//               />
//               <label htmlFor="audio-upload" className="cursor-pointer">
//                 <Music className="mx-auto mb-2 text-indigo-600" size={40} />
//                 <p className="text-gray-600">
//                   {audioFile ? audioFile.name : 'Audio file select karein'}
//                 </p>
//                 <p className="text-sm text-gray-500 mt-1">MP3, WAV, M4A supported</p>
//               </label>
//             </div>
//           </div>

//           {/* Analyze Button */}
//           <button
//             onClick={analyzeWordTiming}
//             disabled={isAnalyzing || !script.trim() || !audioFile}
//             className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
//           >
//             {isAnalyzing ? (
//               <>
//                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                 Analyzing Audio Waveform...
//               </>
//             ) : (
//               <>
//                 <Upload size={20} />
//                 Analyze Karein
//               </>
//             )}
//           </button>

//           {/* Results */}
//           {results && (
//             <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
//               <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Analysis Results</h2>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//                 <div className="bg-white rounded-lg p-4 shadow">
//                   <p className="text-sm text-gray-600">Total Words</p>
//                   <p className="text-2xl font-bold text-indigo-600">{results.totalWords}</p>
//                 </div>
                
//                 <div className="bg-white rounded-lg p-4 shadow">
//                   <p className="text-sm text-gray-600">Audio Duration</p>
//                   <p className="text-2xl font-bold text-indigo-600">{formatTime(results.audioDuration)}</p>
//                 </div>
                
//                 <div className="bg-white rounded-lg p-4 shadow">
//                   <p className="text-sm text-gray-600">Actual Speech Time</p>
//                   <p className="text-2xl font-bold text-green-600">{formatTime(results.totalSpeechTime)}</p>
//                 </div>
                
//                 <div className="bg-white rounded-lg p-4 shadow">
//                   <p className="text-sm text-gray-600">Total Pauses</p>
//                   <p className="text-2xl font-bold text-orange-600">{formatTime(results.totalPauseTime)}</p>
//                 </div>
                
//                 <div className="bg-green-500 rounded-lg p-4 shadow md:col-span-2">
//                   <p className="text-sm text-white font-semibold">⏱️ 30 Words Bolne Mein Time (Pauses Excluded)</p>
//                   <p className="text-3xl font-bold text-white">{formatTime(results.timeFor30Words)}</p>
//                 </div>

//                 <div className="bg-purple-500 rounded-lg p-4 shadow md:col-span-2">
//                   <p className="text-sm text-white font-semibold">📍 30 Words Audio Mein Kahan Khatam Hue</p>
//                   <p className="text-3xl font-bold text-white">{formatTime(results.timeAt30Words)}</p>
//                 </div>
                
//                 <div className="bg-white rounded-lg p-4 shadow">
//                   <p className="text-sm text-gray-600">Words Per Minute</p>
//                   <p className="text-2xl font-bold text-indigo-600">{results.wordsPerMinute.toFixed(1)}</p>
//                 </div>
                
//                 <div className="bg-white rounded-lg p-4 shadow">
//                   <p className="text-sm text-gray-600">Seconds Per Word</p>
//                   <p className="text-2xl font-bold text-indigo-600">{results.secondsPerWord.toFixed(3)}s</p>
//                 </div>

//                 <div className="bg-white rounded-lg p-4 shadow">
//                   <p className="text-sm text-gray-600">Speech Segments</p>
//                   <p className="text-2xl font-bold text-indigo-600">{results.speechSegments}</p>
//                 </div>

//                 <div className="bg-white rounded-lg p-4 shadow">
//                   <p className="text-sm text-gray-600">Pause %</p>
//                   <p className="text-2xl font-bold text-orange-600">{results.pausePercentage.toFixed(1)}%</p>
//                 </div>
//               </div>

//               {/* Audio Player */}
//               {audioFile && (
//                 <div className="bg-white rounded-lg p-4 shadow mb-4">
//                   <p className="text-sm font-semibold text-gray-700 mb-3">Audio Playback</p>
//                   <audio
//                     ref={audioRef}
//                     src={URL.createObjectURL(audioFile)}
//                     className="w-full"
//                     controls
//                   />
//                 </div>
//               )}

//               {/* First 30 Words */}
//               <div className="bg-white rounded-lg p-4 shadow">
//                 <p className="text-sm font-semibold text-gray-700 mb-2">First 30 Words:</p>
//                 <p className="text-sm text-gray-600 leading-relaxed">
//                   {results.wordsList.join(' ')}
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }



/////////////////////////////////////////////////////////////////////////////////
// import React, { useState, useRef } from 'react';
// import { Upload, FileText, Music, AlertCircle, Play, Pause } from 'lucide-react';

// export default function WordTimingAnalyzer() {
//   const [script, setScript] = useState('');
//   const [audioFile, setAudioFile] = useState(null);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [results, setResults] = useState(null);
//   const [error, setError] = useState('');
//   const [progress, setProgress] = useState('');
//   const audioRef = useRef(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);

//   const analyzeWithSpeechRecognition = async () => {
//     if (!script.trim() || !audioFile) {
//       setError('Script aur audio file dono required hain');
//       return;
//     }

//     const words = script.trim().split(/\s+/).filter(w => w.length > 0);
    
//     if (words.length < 30) {
//       setError('Script mein kam se kam 30 words hone chahiye');
//       return;
//     }

//     setIsAnalyzing(true);
//     setError('');
//     setResults(null);
//     setProgress('Audio load ho rahi hai...');

//     try {
//       // Check browser support
//       if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
//         throw new Error('Speech Recognition API supported nahi hai is browser mein. Chrome use karein.');
//       }

//       const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//       const recognition = new SpeechRecognition();
      
//       recognition.continuous = true;
//       recognition.interimResults = false;
//       recognition.lang = 'en-US'; // Change to 'hi-IN' for Hindi

//       // Create audio element
//       const audio = new Audio(URL.createObjectURL(audioFile));
//       await new Promise(resolve => {
//         audio.addEventListener('loadedmetadata', resolve, { once: true });
//       });

//       const totalDuration = audio.duration;
      
//       setProgress('Speech recognition shuru ho rahi hai...');

//       // Get audio context for playback
//       const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//       const source = audioContext.createMediaElementSource(audio);
//       const destination = audioContext.createMediaStreamDestination();
//       source.connect(destination);
//       source.connect(audioContext.destination);

//       recognition.start();

//       const transcribedWords = [];
//       let recognitionComplete = false;

//       recognition.onresult = (event) => {
//         for (let i = event.resultIndex; i < event.results.length; i++) {
//           if (event.results[i].isFinal) {
//             const transcript = event.results[i][0].transcript.trim();
//             const resultWords = transcript.split(/\s+/);
//             const timestamp = audio.currentTime;
            
//             resultWords.forEach(word => {
//               transcribedWords.push({
//                 word: word.toLowerCase().replace(/[^\w\s]/g, ''),
//                 timestamp: timestamp
//               });
//             });
            
//             setProgress(`${transcribedWords.length} words transcribed...`);
//           }
//         }
//       };

//       recognition.onerror = (event) => {
//         console.error('Recognition error:', event.error);
//       };

//       recognition.onend = () => {
//         recognitionComplete = true;
//       };

//       // Play audio
//       audio.play();

//       // Wait for audio to finish
//       await new Promise(resolve => {
//         audio.addEventListener('ended', resolve, { once: true });
//       });

//       // Give recognition time to process
//       await new Promise(resolve => setTimeout(resolve, 2000));

//       if (!recognitionComplete) {
//         recognition.stop();
//       }

//       setProgress('Analysis complete! Results generate ho rahe hain...');

//       // Match transcribed words with script
//       const scriptWords = words.map(w => w.toLowerCase().replace(/[^\w\s]/g, ''));
//       const wordTimestamps = [];
      
//       let scriptIndex = 0;
//       let lastMatchedTime = 0;

//       for (let i = 0; i < transcribedWords.length && scriptIndex < scriptWords.length; i++) {
//         const transcribed = transcribedWords[i].word;
//         const scriptWord = scriptWords[scriptIndex];
        
//         // Fuzzy matching for better accuracy
//         if (transcribed === scriptWord || 
//             transcribed.includes(scriptWord) || 
//             scriptWord.includes(transcribed)) {
//           wordTimestamps.push({
//             wordNumber: scriptIndex + 1,
//             word: words[scriptIndex],
//             timestamp: transcribedWords[i].timestamp || lastMatchedTime
//           });
//           lastMatchedTime = transcribedWords[i].timestamp || lastMatchedTime;
//           scriptIndex++;
//         }
//       }

//       // If recognition missed some words, interpolate
//       if (wordTimestamps.length < scriptWords.length) {
//         const avgTimePerWord = totalDuration / scriptWords.length;
//         for (let i = wordTimestamps.length; i < scriptWords.length; i++) {
//           wordTimestamps.push({
//             wordNumber: i + 1,
//             word: words[i],
//             timestamp: avgTimePerWord * (i + 1)
//           });
//         }
//       }

//       // Calculate 30-word intervals
//       const intervals = [];
//       for (let i = 29; i < wordTimestamps.length; i += 30) {
//         const startWord = wordTimestamps[i - 29];
//         const endWord = wordTimestamps[i];
//         intervals.push({
//           startWordNum: i - 29 + 1,
//           endWordNum: i + 1,
//           startTime: startWord.timestamp,
//           endTime: endWord.timestamp,
//           duration: endWord.timestamp - startWord.timestamp,
//           words: words.slice(i - 29, i + 1)
//         });
//       }

//       setResults({
//         totalWords: words.length,
//         audioDuration: totalDuration,
//         wordTimestamps: wordTimestamps.slice(0, 100), // First 100 for display
//         intervals,
//         transcribedCount: transcribedWords.length,
//         matchedCount: wordTimestamps.length
//       });

//     } catch (error) {
//       setError('Error: ' + error.message);
//       console.error(error);
//     } finally {
//       setIsAnalyzing(false);
//       setProgress('');
//     }
//   };

//   const formatTime = (seconds) => {
//     if (!seconds && seconds !== 0) return '0.000s';
//     const mins = Math.floor(seconds / 60);
//     const secs = (seconds % 60).toFixed(3);
//     return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
//   };

//   const handlePlayPause = () => {
//     if (!audioRef.current) return;
    
//     if (isPlaying) {
//       audioRef.current.pause();
//     } else {
//       audioRef.current.play();
//     }
//     setIsPlaying(!isPlaying);
//   };

//   const seekToTime = (time) => {
//     if (audioRef.current) {
//       audioRef.current.currentTime = time;
//       audioRef.current.play();
//       setIsPlaying(true);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
//       <div className="max-w-6xl mx-auto">
//         <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
//           <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
//             <FileText className="text-indigo-600" />
//             Word Timestamp Analyzer
//           </h1>
//           <p className="text-gray-600 mb-2">Audio mein har 30 words kab end hota hai</p>
//           <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mb-6">
//             <p className="text-sm text-yellow-800">
//               ⚠️ Chrome browser use karein. Audio clear honi chahiye for best results.
//             </p>
//           </div>

//           {error && (
//             <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
//               <div className="flex items-center gap-2">
//                 <AlertCircle className="text-red-500" size={20} />
//                 <p className="text-red-700">{error}</p>
//               </div>
//             </div>
//           )}

//           {progress && (
//             <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
//               <p className="text-blue-700">{progress}</p>
//             </div>
//           )}

//           {/* Script Input */}
//           <div className="mb-6">
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Script/Text (minimum 30 words)
//             </label>
//             <textarea
//               className="w-full border-2 border-gray-300 rounded-lg p-4 focus:border-indigo-500 focus:outline-none min-h-40 font-mono text-sm"
//               placeholder="Apni script yahan paste karein..."
//               value={script}
//               onChange={(e) => setScript(e.target.value)}
//             />
//             <p className="text-sm text-gray-500 mt-2">
//               Words count: {script.trim().split(/\s+/).filter(w => w).length}
//             </p>
//           </div>

//           {/* Audio Upload */}
//           <div className="mb-6">
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Audio File
//             </label>
//             <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
//               <input
//                 type="file"
//                 accept="audio/*"
//                 onChange={(e) => {
//                   setAudioFile(e.target.files[0]);
//                   setResults(null);
//                   setError('');
//                 }}
//                 className="hidden"
//                 id="audio-upload"
//               />
//               <label htmlFor="audio-upload" className="cursor-pointer">
//                 <Music className="mx-auto mb-2 text-indigo-600" size={40} />
//                 <p className="text-gray-600">
//                   {audioFile ? audioFile.name : 'Audio file select karein'}
//                 </p>
//                 <p className="text-sm text-gray-500 mt-1">MP3, WAV, M4A (clear audio recommended)</p>
//               </label>
//             </div>
//           </div>

//           {/* Analyze Button */}
//           <button
//             onClick={analyzeWithSpeechRecognition}
//             disabled={isAnalyzing || !script.trim() || !audioFile}
//             className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
//           >
//             {isAnalyzing ? (
//               <>
//                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                 Analyzing... Audio play ho rahi hai
//               </>
//             ) : (
//               <>
//                 <Upload size={20} />
//                 Analyze with Speech Recognition
//               </>
//             )}
//           </button>

//           {/* Results */}
//           {results && (
//             <div className="mt-8 space-y-6">
//               {/* Audio Player */}
//               {audioFile && (
//                 <div className="bg-white rounded-lg p-4 shadow-lg">
//                   <p className="text-sm font-semibold text-gray-700 mb-3">Audio Playback</p>
//                   <audio
//                     ref={audioRef}
//                     src={URL.createObjectURL(audioFile)}
//                     className="w-full"
//                     controls
//                     onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
//                     onPlay={() => setIsPlaying(true)}
//                     onPause={() => setIsPlaying(false)}
//                   />
//                 </div>
//               )}

//               {/* Stats */}
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 <div className="bg-white rounded-lg p-4 shadow">
//                   <p className="text-sm text-gray-600">Total Words</p>
//                   <p className="text-2xl font-bold text-indigo-600">{results.totalWords}</p>
//                 </div>
//                 <div className="bg-white rounded-lg p-4 shadow">
//                   <p className="text-sm text-gray-600">Audio Duration</p>
//                   <p className="text-2xl font-bold text-indigo-600">{formatTime(results.audioDuration)}</p>
//                 </div>
//                 <div className="bg-white rounded-lg p-4 shadow">
//                   <p className="text-sm text-gray-600">Words Detected</p>
//                   <p className="text-2xl font-bold text-green-600">{results.matchedCount}</p>
//                 </div>
//                 <div className="bg-white rounded-lg p-4 shadow">
//                   <p className="text-sm text-gray-600">30-Word Intervals</p>
//                   <p className="text-2xl font-bold text-purple-600">{results.intervals.length}</p>
//                 </div>
//               </div>

//               {/* 30-Word Intervals */}
//               <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
//                 <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 Har 30 Words Ka Time</h2>
//                 <div className="space-y-4">
//                   {results.intervals.map((interval, idx) => (
//                     <div key={idx} className="bg-white rounded-lg p-5 shadow-lg hover:shadow-xl transition-shadow">
//                       <div className="flex justify-between items-start mb-3">
//                         <div>
//                           <h3 className="text-lg font-bold text-gray-800">
//                             Words {interval.startWordNum} - {interval.endWordNum}
//                           </h3>
//                           <p className="text-sm text-gray-600 mt-1">
//                             Start: <span className="font-mono text-indigo-600">{formatTime(interval.startTime)}</span>
//                             {' → '}
//                             End: <span className="font-mono text-green-600">{formatTime(interval.endTime)}</span>
//                           </p>
//                         </div>
//                         <div className="text-right">
//                           <p className="text-sm text-gray-600">Duration</p>
//                           <p className="text-xl font-bold text-purple-600">{formatTime(interval.duration)}</p>
//                         </div>
//                       </div>
//                       <button
//                         onClick={() => seekToTime(interval.startTime)}
//                         className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200 transition-colors"
//                       >
//                         ▶ Play from here
//                       </button>
//                       <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700 leading-relaxed">
//                         {interval.words.join(' ')}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Word Timeline (First 30) */}
//               <div className="bg-white rounded-xl p-6 shadow-lg">
//                 <h3 className="text-xl font-bold text-gray-800 mb-4">📍 First 30 Words Timeline</h3>
//                 <div className="space-y-2 max-h-96 overflow-y-auto">
//                   {results.wordTimestamps.slice(0, 30).map((item, idx) => (
//                     <div key={idx} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
//                       <span className="text-gray-700">
//                         <span className="font-bold text-indigo-600">{item.wordNumber}.</span> {item.word}
//                       </span>
//                       <span className="font-mono text-sm text-gray-600">{formatTime(item.timestamp)}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

//////////////////////////////////////////////////////////////////////////////
// import React, { useState, useRef } from 'react';
// import { Upload, FileText, Music, AlertCircle, Play, Pause } from 'lucide-react';

// export default function WordTimingAnalyzer() {
//   const [script, setScript] = useState('');
//   const [audioFile, setAudioFile] = useState(null);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [results, setResults] = useState(null);
//   const [error, setError] = useState('');
//   const [progress, setProgress] = useState('');
//   const audioRef = useRef(null);
//   const [isPlaying, setIsPlaying] = useState(false);

//   const analyzeWithSpeechRecognition = async () => {
//     if (!script.trim() || !audioFile) {
//       setError('Script aur audio file dono required hain');
//       return;
//     }

//     const words = script.trim().split(/\s+/).filter(w => w.length > 0);
    
//     if (words.length < 30) {
//       setError('Script mein kam se kam 30 words hone chahiye');
//       return;
//     }

//     setIsAnalyzing(true);
//     setError('');
//     setResults(null);
//     setProgress('Audio load ho rahi hai...');

//     try {
//       // Check browser support
//       if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
//         throw new Error('Speech Recognition API supported nahi hai is browser mein. Chrome use karein.');
//       }

//       const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//       const recognition = new SpeechRecognition();
      
//       recognition.continuous = true;
//       recognition.interimResults = false;
//       recognition.lang = 'en-US'; // Change to 'hi-IN' for Hindi

//       // Create audio element
//       const audio = new Audio(URL.createObjectURL(audioFile));
//       await new Promise(resolve => {
//         audio.addEventListener('loadedmetadata', resolve, { once: true });
//       });

//       const totalDuration = audio.duration;
      
//       setProgress('Speech recognition shuru ho rahi hai...');

//       // Get audio context for playback
//       const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//       const source = audioContext.createMediaElementSource(audio);
//       const destination = audioContext.createMediaStreamDestination();
//       source.connect(destination);
//       source.connect(audioContext.destination);

//       recognition.start();

//       const transcribedWords = [];
//       let recognitionComplete = false;

//       recognition.onresult = (event) => {
//         for (let i = event.resultIndex; i < event.results.length; i++) {
//           if (event.results[i].isFinal) {
//             const transcript = event.results[i][0].transcript.trim();
//             const resultWords = transcript.split(/\s+/);
//             const timestamp = audio.currentTime;
            
//             resultWords.forEach(word => {
//               transcribedWords.push({
//                 word: word.toLowerCase().replace(/[^\w\s]/g, ''),
//                 timestamp: timestamp
//               });
//             });
            
//             setProgress(`${transcribedWords.length} words transcribed...`);
//           }
//         }
//       };

//       recognition.onerror = (event) => {
//         console.error('Recognition error:', event.error);
//       };

//       recognition.onend = () => {
//         recognitionComplete = true;
//       };

//       // Play audio
//       audio.play();

//       // Wait for audio to finish
//       await new Promise(resolve => {
//         audio.addEventListener('ended', resolve, { once: true });
//       });

//       // Give recognition time to process
//       await new Promise(resolve => setTimeout(resolve, 2000));

//       if (!recognitionComplete) {
//         recognition.stop();
//       }

//       setProgress('Analysis complete! Results generate ho rahe hain...');

//       // Match transcribed words with script
//       const scriptWords = words.map(w => w.toLowerCase().replace(/[^\w\s]/g, ''));
//       const wordTimestamps = [];
      
//       let scriptIndex = 0;
//       let lastMatchedTime = 0;

//       for (let i = 0; i < transcribedWords.length && scriptIndex < scriptWords.length; i++) {
//         const transcribed = transcribedWords[i].word;
//         const scriptWord = scriptWords[scriptIndex];
        
//         // Fuzzy matching for better accuracy
//         if (transcribed === scriptWord || 
//             transcribed.includes(scriptWord) || 
//             scriptWord.includes(transcribed)) {
//           wordTimestamps.push({
//             wordNumber: scriptIndex + 1,
//             word: words[scriptIndex],
//             timestamp: transcribedWords[i].timestamp || lastMatchedTime
//           });
//           lastMatchedTime = transcribedWords[i].timestamp || lastMatchedTime;
//           scriptIndex++;
//         }
//       }

//       // If recognition missed some words, interpolate
//       if (wordTimestamps.length < scriptWords.length) {
//         const avgTimePerWord = totalDuration / scriptWords.length;
//         for (let i = wordTimestamps.length; i < scriptWords.length; i++) {
//           wordTimestamps.push({
//             wordNumber: i + 1,
//             word: words[i],
//             timestamp: avgTimePerWord * (i + 1)
//           });
//         }
//       }

//       // Calculate 30-word intervals
//       const intervals = [];
//       for (let i = 29; i < wordTimestamps.length; i += 30) {
//         const startWord = wordTimestamps[i - 29];
//         const endWord = wordTimestamps[i];
//         intervals.push({
//           startWordNum: i - 29 + 1,
//           endWordNum: i + 1,
//           startTime: startWord.timestamp,
//           endTime: endWord.timestamp,
//           duration: endWord.timestamp - startWord.timestamp,
//           words: words.slice(i - 29, i + 1)
//         });
//       }

//       setResults({
//         totalWords: words.length,
//         audioDuration: totalDuration,
//         wordTimestamps: wordTimestamps.slice(0, 100), // First 100 for display
//         intervals,
//         transcribedCount: transcribedWords.length,
//         matchedCount: wordTimestamps.length
//       });

//     } catch (error) {
//       setError('Error: ' + error.message);
//       console.error(error);
//     } finally {
//       setIsAnalyzing(false);
//       setProgress('');
//     }
//   };

//   const formatTime = (seconds) => {
//     if (!seconds && seconds !== 0) return '0.000s';
//     const mins = Math.floor(seconds / 60);
//     const secs = (seconds % 60).toFixed(3);
//     return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
//   };

//   const seekToTime = (time) => {
//     if (audioRef.current) {
//       audioRef.current.currentTime = time;
//       audioRef.current.play();
//       setIsPlaying(true);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
//       <div className="max-w-6xl mx-auto">
//         <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
//           <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
//             <FileText className="text-indigo-600" />
//             Word Timestamp Analyzer
//           </h1>
//           <p className="text-gray-600 mb-2">Audio mein har 30 words kab end hota hai</p>
//           <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mb-6">
//             <p className="text-sm text-yellow-800">
//               ⚠️ Chrome browser use karein. Audio clear honi chahiye for best results.
//             </p>
//           </div>

//           {error && (
//             <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
//               <div className="flex items-center gap-2">
//                 <AlertCircle className="text-red-500" size={20} />
//                 <p className="text-red-700">{error}</p>
//               </div>
//             </div>
//           )}

//           {progress && (
//             <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
//               <p className="text-blue-700">{progress}</p>
//             </div>
//           )}

//           {/* Script Input */}
//           <div className="mb-6">
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Script/Text (minimum 30 words)
//             </label>
//             <textarea
//               className="w-full border-2 border-gray-300 rounded-lg p-4 focus:border-indigo-500 focus:outline-none min-h-40 font-mono text-sm"
//               placeholder="Apni script yahan paste karein..."
//               value={script}
//               onChange={(e) => setScript(e.target.value)}
//             />
//             <p className="text-sm text-gray-500 mt-2">
//               Words count: {script.trim().split(/\s+/).filter(w => w).length}
//             </p>
//           </div>

//           {/* Audio Upload */}
//           <div className="mb-6">
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Audio File
//             </label>
//             <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
//               <input
//                 type="file"
//                 accept="audio/*"
//                 onChange={(e) => {
//                   setAudioFile(e.target.files[0]);
//                   setResults(null);
//                   setError('');
//                 }}
//                 className="hidden"
//                 id="audio-upload"
//               />
//               <label htmlFor="audio-upload" className="cursor-pointer">
//                 <Music className="mx-auto mb-2 text-indigo-600" size={40} />
//                 <p className="text-gray-600">
//                   {audioFile ? audioFile.name : 'Audio file select karein'}
//                 </p>
//                 <p className="text-sm text-gray-500 mt-1">MP3, WAV, M4A (clear audio recommended)</p>
//               </label>
//             </div>
//           </div>

//           {/* Analyze Button */}
//           <button
//             onClick={analyzeWithSpeechRecognition}
//             disabled={isAnalyzing || !script.trim() || !audioFile}
//             className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
//           >
//             {isAnalyzing ? (
//               <>
//                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                 Analyzing... Audio play ho rahi hai
//               </>
//             ) : (
//               <>
//                 <Upload size={20} />
//                 Analyze with Speech Recognition
//               </>
//             )}
//           </button>

//           {/* Results */}
//           {results && (
//             <div className="mt-8 space-y-6">
//               {/* Audio Player */}
//               {audioFile && (
//                 <div className="bg-white rounded-lg p-4 shadow-lg">
//                   <p className="text-sm font-semibold text-gray-700 mb-3">Audio Playback</p>
//                   <audio
//                     ref={audioRef}
//                     src={URL.createObjectURL(audioFile)}
//                     className="w-full"
//                     controls
//                     onPlay={() => setIsPlaying(true)}
//                     onPause={() => setIsPlaying(false)}
//                   />
//                 </div>
//               )}

//               {/* Stats */}
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 <div className="bg-white rounded-lg p-4 shadow">
//                   <p className="text-sm text-gray-600">Total Words</p>
//                   <p className="text-2xl font-bold text-indigo-600">{results.totalWords}</p>
//                 </div>
//                 <div className="bg-white rounded-lg p-4 shadow">
//                   <p className="text-sm text-gray-600">Audio Duration</p>
//                   <p className="text-2xl font-bold text-indigo-600">{formatTime(results.audioDuration)}</p>
//                 </div>
//                 <div className="bg-white rounded-lg p-4 shadow">
//                   <p className="text-sm text-gray-600">Words Detected</p>
//                   <p className="text-2xl font-bold text-green-600">{results.matchedCount}</p>
//                 </div>
//                 <div className="bg-white rounded-lg p-4 shadow">
//                   <p className="text-sm text-gray-600">30-Word Intervals</p>
//                   <p className="text-2xl font-bold text-purple-600">{results.intervals.length}</p>
//                 </div>
//               </div>

//               {/* 30-Word Intervals */}
//               <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
//                 <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 Har 30 Words Ka Time</h2>
//                 <div className="space-y-4">
//                   {results.intervals.map((interval, idx) => (
//                     <div key={idx} className="bg-white rounded-lg p-5 shadow-lg hover:shadow-xl transition-shadow">
//                       <div className="flex justify-between items-start mb-3">
//                         <div>
//                           <h3 className="text-lg font-bold text-gray-800">
//                             Words {interval.startWordNum} - {interval.endWordNum}
//                           </h3>
//                           <p className="text-sm text-gray-600 mt-1">
//                             Start: <span className="font-mono text-indigo-600">{formatTime(interval.startTime)}</span>
//                             {' → '}
//                             End: <span className="font-mono text-green-600">{formatTime(interval.endTime)}</span>
//                           </p>
//                         </div>
//                         <div className="text-right">
//                           <p className="text-sm text-gray-600">Duration</p>
//                           <p className="text-xl font-bold text-purple-600">{formatTime(interval.duration)}</p>
//                         </div>
//                       </div>
//                       <button
//                         onClick={() => seekToTime(interval.startTime)}
//                         className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200 transition-colors"
//                       >
//                         ▶ Play from here
//                       </button>
//                       <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700 leading-relaxed">
//                         {interval.words.join(' ')}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Word Timeline (First 30) */}
//               <div className="bg-white rounded-xl p-6 shadow-lg">
//                 <h3 className="text-xl font-bold text-gray-800 mb-4">📍 First 30 Words Timeline</h3>
//                 <div className="space-y-2 max-h-96 overflow-y-auto">
//                   {results.wordTimestamps.slice(0, 30).map((item, idx) => (
//                     <div key={idx} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
//                       <span className="text-gray-700">
//                         <span className="font-bold text-indigo-600">{item.wordNumber}.</span> {item.word}
//                       </span>
//                       <span className="font-mono text-sm text-gray-600">{formatTime(item.timestamp)}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useState, useRef } from 'react';
import { Upload, FileText, Music, AlertCircle, Play, Pause } from 'lucide-react';

export default function WordTimingAnalyzer() {
  const [script, setScript] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const analyzeWithSpeechRecognition = async () => {
    if (!script.trim() || !audioFile) {
      setError('Script aur audio file dono required hain');
      return;
    }

    const words = script.trim().split(/\s+/).filter(w => w.length > 0);
    
    if (words.length < 30) {
      setError('Script mein kam se kam 30 words hone chahiye');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setResults(null);
    setProgress('Audio load ho rahi hai...');

    try {
      // Check browser support
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        throw new Error('Speech Recognition API supported nahi hai is browser mein. Chrome use karein.');
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US'; // Change to 'hi-IN' for Hindi

      // Create audio element
      const audio = new Audio(URL.createObjectURL(audioFile));
      await new Promise(resolve => {
        audio.addEventListener('loadedmetadata', resolve, { once: true });
      });

      const totalDuration = audio.duration;
      
      setProgress('Speech recognition shuru ho rahi hai...');

      // Get audio context for playback
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaElementSource(audio);
      const destination = audioContext.createMediaStreamDestination();
      source.connect(destination);
      source.connect(audioContext.destination);

      recognition.start();

      const transcribedWords = [];
      let recognitionComplete = false;

      recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript.trim();
            const resultWords = transcript.split(/\s+/);
            const timestamp = audio.currentTime;
            
            resultWords.forEach(word => {
              transcribedWords.push({
                word: word.toLowerCase().replace(/[^\w\s]/g, ''),
                timestamp: timestamp
              });
            });
            
            setProgress(`${transcribedWords.length} words transcribed...`);
          }
        }
      };

      recognition.onerror = (event) => {
        console.error('Recognition error:', event.error);
      };

      recognition.onend = () => {
        recognitionComplete = true;
      };

      // Play audio
      audio.play();

      // Wait for audio to finish
      await new Promise(resolve => {
        audio.addEventListener('ended', resolve, { once: true });
      });

      // Give recognition time to process
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (!recognitionComplete) {
        recognition.stop();
      }

      setProgress('Analysis complete! Results generate ho rahe hain...');

      // Match transcribed words with script
      const scriptWords = words.map(w => w.toLowerCase().replace(/[^\w\s]/g, ''));
      const wordTimestamps = [];
      
      let scriptIndex = 0;
      let lastMatchedTime = 0;

      for (let i = 0; i < transcribedWords.length && scriptIndex < scriptWords.length; i++) {
        const transcribed = transcribedWords[i].word;
        const scriptWord = scriptWords[scriptIndex];
        
        // Fuzzy matching for better accuracy
        if (transcribed === scriptWord || 
            transcribed.includes(scriptWord) || 
            scriptWord.includes(transcribed)) {
          wordTimestamps.push({
            wordNumber: scriptIndex + 1,
            word: words[scriptIndex],
            timestamp: transcribedWords[i].timestamp || lastMatchedTime
          });
          lastMatchedTime = transcribedWords[i].timestamp || lastMatchedTime;
          scriptIndex++;
        }
      }

      // If recognition missed some words, interpolate
      if (wordTimestamps.length < scriptWords.length) {
        const avgTimePerWord = totalDuration / scriptWords.length;
        for (let i = wordTimestamps.length; i < scriptWords.length; i++) {
          wordTimestamps.push({
            wordNumber: i + 1,
            word: words[i],
            timestamp: avgTimePerWord * (i + 1)
          });
        }
      }

      // Calculate 30-word intervals
      const intervals = [];
      for (let i = 29; i < wordTimestamps.length; i += 30) {
        const startWord = wordTimestamps[i - 29];
        const endWord = wordTimestamps[i];
        intervals.push({
          startWordNum: i - 29 + 1,
          endWordNum: i + 1,
          startTime: startWord.timestamp,
          endTime: endWord.timestamp,
          duration: endWord.timestamp - startWord.timestamp,
          words: words.slice(i - 29, i + 1)
        });
      }

      setResults({
        totalWords: words.length,
        audioDuration: totalDuration,
        wordTimestamps: wordTimestamps.slice(0, 100), // First 100 for display
        intervals,
        transcribedCount: transcribedWords.length,
        matchedCount: wordTimestamps.length
      });

    } catch (error) {
      setError('Error: ' + error.message);
      console.error(error);
    } finally {
      setIsAnalyzing(false);
      setProgress('');
    }
  };

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '0.000s';
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(3);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const seekToTime = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <FileText className="text-indigo-600" />
            Word Timestamp Analyzer
          </h1>
          <p className="text-gray-600 mb-2">Audio mein har 30 words kab end hota hai</p>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mb-6">
            <p className="text-sm text-yellow-800">
              ⚠️ Chrome browser use karein. Audio clear honi chahiye for best results.
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center gap-2">
                <AlertCircle className="text-red-500" size={20} />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {progress && (
            <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-blue-700">{progress}</p>
            </div>
          )}

          {/* Script Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Script/Text (minimum 30 words)
            </label>
            <textarea
              className="w-full border-2 border-gray-300 rounded-lg p-4 focus:border-indigo-500 focus:outline-none min-h-40 font-mono text-sm"
              placeholder="Apni script yahan paste karein..."
              value={script}
              onChange={(e) => setScript(e.target.value)}
            />
            <p className="text-sm text-gray-500 mt-2">
              Words count: {script.trim().split(/\s+/).filter(w => w).length}
            </p>
          </div>

          {/* Audio Upload */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Audio File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  setAudioFile(e.target.files[0]);
                  setResults(null);
                  setError('');
                }}
                className="hidden"
                id="audio-upload"
              />
              <label htmlFor="audio-upload" className="cursor-pointer">
                <Music className="mx-auto mb-2 text-indigo-600" size={40} />
                <p className="text-gray-600">
                  {audioFile ? audioFile.name : 'Audio file select karein'}
                </p>
                <p className="text-sm text-gray-500 mt-1">MP3, WAV, M4A (clear audio recommended)</p>
              </label>
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={analyzeWithSpeechRecognition}
            disabled={isAnalyzing || !script.trim() || !audioFile}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Analyzing... Audio play ho rahi hai
              </>
            ) : (
              <>
                <Upload size={20} />
                Analyze with Speech Recognition
              </>
            )}
          </button>

          {/* Results */}
          {results && (
            <div className="mt-8 space-y-6">
              {/* Audio Player */}
              {audioFile && (
                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Audio Playback</p>
                  <audio
                    ref={audioRef}
                    src={URL.createObjectURL(audioFile)}
                    className="w-full"
                    controls
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 shadow">
                  <p className="text-sm text-gray-600">Total Words</p>
                  <p className="text-2xl font-bold text-indigo-600">{results.totalWords}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow">
                  <p className="text-sm text-gray-600">Audio Duration</p>
                  <p className="text-2xl font-bold text-indigo-600">{formatTime(results.audioDuration)}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow">
                  <p className="text-sm text-gray-600">Words Detected</p>
                  <p className="text-2xl font-bold text-green-600">{results.matchedCount}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow">
                  <p className="text-sm text-gray-600">30-Word Intervals</p>
                  <p className="text-2xl font-bold text-purple-600">{results.intervals.length}</p>
                </div>
              </div>

              {/* 30-Word Intervals */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 Har 30 Words Ka Time</h2>
                <div className="space-y-4">
                  {results.intervals.map((interval, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-5 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">
                            Words {interval.startWordNum} - {interval.endWordNum}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Start: <span className="font-mono text-indigo-600">{formatTime(interval.startTime)}</span>
                            {' → '}
                            End: <span className="font-mono text-green-600">{formatTime(interval.endTime)}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="text-xl font-bold text-purple-600">{formatTime(interval.duration)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => seekToTime(interval.startTime)}
                        className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200 transition-colors"
                      >
                        ▶ Play from here
                      </button>
                      <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700 leading-relaxed">
                        {interval.words.join(' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Word Timeline (First 30) */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4">📍 First 30 Words Timeline</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {results.wordTimestamps.slice(0, 30).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                      <span className="text-gray-700">
                        <span className="font-bold text-indigo-600">{item.wordNumber}.</span> {item.word}
                      </span>
                      <span className="font-mono text-sm text-gray-600">{formatTime(item.timestamp)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}