import React, { useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface SimpleImageFixProps {
  src: string;
  alt: string;
  className?: string;
  filename?: string;
}

export function SimpleImageFix({ src, alt, className = '', filename }: SimpleImageFixProps) {
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleError = () => {
    console.error('🚨 SimpleImageFix - Image failed to load:', {
      src: src.substring(0, 100),
      filename,
      isDataURL: src.startsWith('data:'),
      srcLength: src.length
    });
    setImageError(true);
  };

  const handleLoad = () => {
    console.log('✅ SimpleImageFix - Image loaded successfully:', filename);
    setImageError(false);
  };

  const handleRetry = () => {
    if (retryCount < 2) {
      setImageError(false);
      setRetryCount(prev => prev + 1);
      // Force reload by adding timestamp
      const img = document.createElement('img');
      img.src = src;
      img.onload = () => setImageError(false);
      img.onerror = () => setImageError(true);
    }
  };

  if (imageError) {
    return (
      <div className={`bg-red-50 border-2 border-red-200 rounded-lg flex flex-col items-center justify-center p-4 ${className}`}>
        <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
        <p className="text-sm font-medium text-red-700">Image Failed</p>
        <p className="text-xs text-red-600 mt-1">{filename || 'Unknown'}</p>
        {retryCount < 2 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            className="mt-2 text-red-700 border-red-300"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry ({retryCount + 1}/3)
          </Button>
        )}
        <div className="mt-2 text-xs text-gray-500 text-center">
          <p>Src: {src.startsWith('data:') ? 'Data URL' : 'URL'}</p>
          <p>Length: {src.length} chars</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover rounded-lg"
        onError={handleError}
        onLoad={handleLoad}
      />
      {filename && (
        <div className="absolute bottom-1 left-1 right-1 bg-black bg-opacity-70 text-white text-xs p-1 rounded text-center truncate">
          {filename}
        </div>
      )}
    </div>
  );
}