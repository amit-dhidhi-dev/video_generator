import React, { useState } from 'react';

import { 
  Play, 
  Trash2, 
  X, 
  RotateCw, 
  Clock, 
  FileText 
} from 'lucide-react';


const ResumeDialog = ({ 
  job, 
  onResume, 
  onStartNew, 
  onDelete,
  onCancel 
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  

  
  const getStatusColor = (status) => {
    const colors = {
      generating_slides: 'bg-blue-100 text-blue-800',
      encoding: 'bg-purple-100 text-purple-800',
      paused: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(job.jobId);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Incomplete Generation</h3>
                <p className="text-purple-100 text-sm">Continue where you left off</p>
              </div>
            </div>
            <button 
              onClick={onCancel}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Job Info */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-2xl font-bold text-gray-900">{job.progress}%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                {job.status.replace('_', ' ')}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Updated</span>
              <span className="text-sm text-gray-900">
                {formatTime(job.timestamp)}
              </span>
            </div>
            
            {job.data?.slidesCount && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Slides</span>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-900">{job.data.slidesCount}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${job.progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-500">0%</span>
              <span className="text-xs text-gray-500">100%</span>
            </div>
          </div>
          
          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">Note:</span> Resuming may take some time 
              as we restore the previous state. Some processing may need to be redone.
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="p-6 pt-0 space-y-3">
          <button
            onClick={() => onResume(job.jobId)}
            disabled={isDeleting}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-5 w-5" />
            Resume Generation
          </button>
          
          <button
            onClick={() => onStartNew(job.jobId)}
            disabled={isDeleting}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCw className="h-5 w-5" />
            Start New
          </button>
          
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-5 w-5" />
            {isDeleting ? 'Deleting...' : 'Delete This Job'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeDialog;