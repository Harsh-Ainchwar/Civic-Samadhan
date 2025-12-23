import React, { useState, useEffect } from 'react';
import { AlertTriangle, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface EnhancedImageDisplayProps {
  src: string;
  alt: string;
  className?: string;
  filename?: string;
  showDebugInfo?: boolean;
  onImageClick?: () => void;
}

interface ImageState {
  status: 'loading' | 'loaded' | 'error' | 'corrupted';
  debugInfo?: any;
  retryCount: number;
}

export function EnhancedImageDisplay({ 
  src, 
  alt, 
  className = '', 
  filename,
  showDebugInfo = false,
  onImageClick
}: EnhancedImageDisplayProps) {
  const [imageState, setImageState] = useState<ImageState>({
    status: 'loading',
    retryCount: 0
  });

  const [displaySrc, setDisplaySrc] = useState(src);

  useEffect(() => {
    setImageState({ status: 'loading', retryCount: 0 });
    setDisplaySrc(src);
    validateAndLoadImage(src);
  }, [src]);

  const validateAndLoadImage = async (imageSrc: string) => {
    try {
      console.log('🖼️ EnhancedImageDisplay: Validating image', {
        src: imageSrc.substring(0, 50) + '...',
        isDataURL: imageSrc.startsWith('data:'),
        length: imageSrc.length
      });

      // Basic validation
      if (!imageSrc || imageSrc.length < 50) {
        throw new Error('Invalid image source');
      }

      if (imageSrc.startsWith('data:image/')) {
        // Additional validation for data URLs
        const isValid = await validateDataURL(imageSrc);
        if (!isValid) {
          throw new Error('Corrupted data URL');
        }
      }

      setImageState(prev => ({ ...prev, status: 'loaded' }));
    } catch (error) {
      console.error('❌ Image validation failed:', error);
      setImageState(prev => ({ 
        ...prev, 
        status: 'error',
        debugInfo: {
          error: error instanceof Error ? error.message : 'Unknown error',
          srcLength: imageSrc.length,
          srcType: imageSrc.startsWith('data:') ? 'data-url' : 'url',
          srcPrefix: imageSrc.substring(0, 100)
        }
      }));
    }
  };

  const validateDataURL = (dataURL: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        if (img.naturalWidth === 0 || img.naturalHeight === 0) {
          console.warn('⚠️ Image has zero dimensions');
          resolve(false);
        } else {
          console.log('✅ Image validation successful', {
            width: img.naturalWidth,
            height: img.naturalHeight
          });
          resolve(true);
        }
      };
      
      img.onerror = (e) => {
        console.error('❌ Image validation failed:', e);
        resolve(false);
      };
      
      img.src = dataURL;
      
      // Timeout after 5 seconds
      setTimeout(() => {
        console.warn('⏰ Image validation timeout');
        resolve(false);
      }, 5000);
    });
  };

  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully in display component');
    setImageState(prev => ({ ...prev, status: 'loaded' }));
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    console.error('❌ Image display error:', {
      src: target.src.substring(0, 100),
      naturalWidth: target.naturalWidth,
      naturalHeight: target.naturalHeight,
      complete: target.complete
    });

    setImageState(prev => ({ 
      ...prev, 
      status: target.naturalWidth === 0 ? 'corrupted' : 'error',
      retryCount: prev.retryCount + 1
    }));
  };

  const handleRetry = () => {
    if (imageState.retryCount < 3) {
      setImageState(prev => ({ ...prev, status: 'loading' }));
      validateAndLoadImage(src);
    }
  };

  const renderErrorState = () => {
    const isCorrupted = imageState.status === 'corrupted';
    
    return (
      <div className={`bg-red-50 border-2 border-red-200 rounded-lg flex flex-col items-center justify-center p-4 ${className}`}>
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-red-700">
            {isCorrupted ? 'Image Corrupted' : 'Failed to Load'}
          </p>
          <p className="text-xs text-red-600 mt-1">
            {filename || 'Unknown file'}
          </p>
          
          {imageState.retryCount < 3 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="mt-2 text-red-700 border-red-300 hover:bg-red-100"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry ({imageState.retryCount + 1}/3)
            </Button>
          )}
          
          {showDebugInfo && imageState.debugInfo && (
            <div className="mt-3 p-2 bg-red-100 rounded text-xs text-left">
              <p><strong>Error:</strong> {imageState.debugInfo.error}</p>
              <p><strong>Size:</strong> {imageState.debugInfo.srcLength} chars</p>
              <p><strong>Type:</strong> {imageState.debugInfo.srcType}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLoadingState = () => (
    <div className={`bg-gray-100 border-2 border-gray-200 rounded-lg flex items-center justify-center ${className}`}>
      <div className="text-center">
        <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-pulse" />
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    </div>
  );

  if (imageState.status === 'loading') {
    return renderLoadingState();
  }

  if (imageState.status === 'error' || imageState.status === 'corrupted') {
    return renderErrorState();
  }

  return (
    <div className={`relative group ${className}`}>
      <img
        src={displaySrc}
        alt={alt}
        className="w-full h-full object-cover rounded-lg cursor-pointer"
        onLoad={handleImageLoad}
        onError={handleImageError}
        onClick={onImageClick}
      />
      
      {/* Debug overlay */}
      {showDebugInfo && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs p-1 rounded">
          {displaySrc.startsWith('data:') ? 'Base64' : 'URL'}
        </div>
      )}
      
      {/* Filename overlay */}
      {filename && (
        <div className="absolute bottom-1 left-1 right-1 bg-black bg-opacity-70 text-white text-xs p-1 rounded text-center truncate">
          {filename}
        </div>
      )}
    </div>
  );
}