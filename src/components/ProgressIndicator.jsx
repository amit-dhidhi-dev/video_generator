import React from 'react';

const ProgressIndicator = ({ progress, status, videoInfo, getStatusIcon, getStatusColor }) => {
  const getStatusText = () => {
    const statusMap = {
      preparing: 'Preparing video generation...',
      generating_slides: 'Creating slide images...',
      slides_generated: 'Slides generated, encoding video...',
      encoding: 'Encoding video with FFmpeg...',
      completed: 'Video ready!',
      error: 'Error occurred',
      paused: 'Paused',
      cancelled: 'Cancelled',
      resuming: 'Resuming...'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="space-y-4">
      {/* Status Bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon && getStatusIcon()}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
            {status.toUpperCase()}
          </span>
        </div>
        <span className="text-lg font-bold text-gray-900">{progress}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Status Text */}
      <p className="text-gray-700 text-center">{getStatusText()}</p>

      {/* Video Info */}
      {videoInfo && status === 'completed' && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <h4 className="font-semibold text-green-800 mb-3">Video Information</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-lg">
              <div className="text-sm text-gray-600">Duration</div>
              <div className="font-bold text-gray-900">{videoInfo.duration}s</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-sm text-gray-600">Size</div>
              <div className="font-bold text-gray-900">{videoInfo.size} MB</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-sm text-gray-600">Resolution</div>
              <div className="font-bold text-gray-900">{videoInfo.resolution}</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-sm text-gray-600">Format</div>
              <div className="font-bold text-gray-900">{videoInfo.format}</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-sm text-gray-600">Codec</div>
              <div className="font-bold text-gray-900">{videoInfo.codec}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;