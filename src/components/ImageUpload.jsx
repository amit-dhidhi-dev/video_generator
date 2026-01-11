import React, { useCallback } from 'react';
import { Upload, Image as ImageIcon, X, CheckCircle } from 'lucide-react';

const ImageUpload = ({ image, setImage }) => {
  const onDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, [setImage]);

  const onFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  return (
    <div className="glass-card p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-blue-400" />
          Background Image
        </h2>
        {image && (
          <button
            onClick={removeImage}
            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div 
        className={`border-2 border-dashed rounded-xl transition-all duration-300 ${
          image 
            ? 'border-green-500/50 bg-green-500/5' 
            : 'border-gray-700 hover:border-blue-500/50 hover:bg-gray-800/30'
        }`}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {image ? (
          <div className="p-4">
            <div className="relative group">
              <img 
                src={image} 
                alt="Preview" 
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-4 left-4">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <p className="text-sm text-gray-300 mt-1">Image uploaded successfully</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <label className="cursor-pointer flex flex-col items-center justify-center p-8 text-center">
            <div className="p-4 bg-gray-800/50 rounded-full mb-4">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium mb-2">Drop your image here</p>
            <p className="text-gray-400 text-sm mb-4">or click to browse</p>
            <span className="text-xs text-gray-500">Supports: JPG, PNG, WebP</span>
            <input
              type="file"
              accept="image/*"
              onChange={onFileSelect}
              className="hidden"
            />
          </label>
        )}
      </div>

      {image && (
        <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
          <p className="text-sm text-blue-400 flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Image ready! It will be used as background for all slides.
          </p>
        </div>
      )}

      <div className="mt-6 space-y-3">
        <h3 className="text-sm font-medium text-gray-400">Tips:</h3>
        <ul className="space-y-2 text-sm text-gray-500">
          <li className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 bg-blue-500 rounded-full"></div>
            Use high-resolution images for best quality
          </li>
          <li className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 bg-purple-500 rounded-full"></div>
            Landscape images work best (16:9 ratio)
          </li>
          <li className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 bg-green-500 rounded-full"></div>
            The blur effect will be applied automatically
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUpload;