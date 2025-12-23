/**
 * Robust image processing utilities for CivicSamadhan
 * Handles multiple image processing strategies with fallbacks
 */

export interface ProcessedImage {
  url: string;
  width: number;
  height: number;
  size: number;
  method: 'canvas' | 'filereader' | 'objecturl';
}

export class ImageProcessor {
  private static readonly MAX_SIZE = 1200;
  private static readonly QUALITY = 0.85;
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  /**
   * Main image processing function with multiple fallback strategies
   */
  static async processImage(file: File): Promise<ProcessedImage> {
    console.log('🖼️ ImageProcessor: Starting processing for', file.name);

    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds limit of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Strategy 1: Enhanced Canvas Processing
    try {
      const result = await this.processWithCanvas(file);
      console.log('✅ Canvas processing successful');
      return result;
    } catch (error) {
      console.warn('⚠️ Canvas processing failed:', error);
    }

    // Strategy 2: Direct FileReader (no resizing)
    try {
      const result = await this.processWithFileReader(file);
      console.log('✅ FileReader processing successful');
      return result;
    } catch (error) {
      console.warn('⚠️ FileReader processing failed:', error);
    }

    // Strategy 3: Object URL (for immediate display)
    try {
      const result = this.processWithObjectURL(file);
      console.log('✅ Object URL processing successful');
      return result;
    } catch (error) {
      console.error('❌ All processing methods failed:', error);
      throw new Error('Failed to process image with all available methods');
    }
  }

  /**
   * Enhanced canvas processing with better error handling
   */
  private static async processWithCanvas(file: File): Promise<ProcessedImage> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { alpha: false }); // Disable alpha for better performance

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      const objectURL = URL.createObjectURL(file);

      const cleanup = () => {
        URL.revokeObjectURL(objectURL);
      };

      img.onload = () => {
        try {
          const { width: newWidth, height: newHeight } = this.calculateDimensions(
            img.naturalWidth,
            img.naturalHeight
          );

          canvas.width = newWidth;
          canvas.height = newHeight;

          // Set high-quality rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Fill with white background (crucial for JPEGs)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, newWidth, newHeight);

          // Draw the image
          ctx.drawImage(img, 0, 0, newWidth, newHeight);

          // Verify the canvas has content
          const imageData = ctx.getImageData(0, 0, Math.min(10, newWidth), Math.min(10, newHeight));
          const hasNonWhitePixels = this.hasVisibleContent(imageData);

          if (!hasNonWhitePixels) {
            cleanup();
            reject(new Error('Canvas appears to contain only white pixels'));
            return;
          }

          // Convert to data URL
          const dataURL = canvas.toDataURL('image/jpeg', this.QUALITY);
          
          if (!dataURL || dataURL.length < 100 || !dataURL.startsWith('data:image/')) {
            cleanup();
            reject(new Error('Invalid data URL generated'));
            return;
          }

          cleanup();
          resolve({
            url: dataURL,
            width: newWidth,
            height: newHeight,
            size: dataURL.length,
            method: 'canvas'
          });

        } catch (error) {
          cleanup();
          reject(error);
        }
      };

      img.onerror = () => {
        cleanup();
        reject(new Error('Failed to load image into canvas'));
      };

      // Set properties before src to avoid race conditions
      img.crossOrigin = 'anonymous';
      img.src = objectURL;

      // Timeout fallback
      setTimeout(() => {
        cleanup();
        reject(new Error('Image loading timeout'));
      }, 10000);
    });
  }

  /**
   * FileReader fallback method
   */
  private static async processWithFileReader(file: File): Promise<ProcessedImage> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string' && result.startsWith('data:')) {
          // Get image dimensions
          const img = new Image();
          img.onload = () => {
            resolve({
              url: result,
              width: img.width,
              height: img.height,
              size: result.length,
              method: 'filereader'
            });
          };
          img.onerror = () => reject(new Error('Failed to load image from FileReader result'));
          img.src = result;
        } else {
          reject(new Error('FileReader did not return a valid data URL'));
        }
      };

      reader.onerror = () => reject(new Error('FileReader failed'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Object URL method (least processing)
   */
  private static processWithObjectURL(file: File): ProcessedImage {
    const url = URL.createObjectURL(file);
    return {
      url,
      width: 0, // Unknown until loaded
      height: 0, // Unknown until loaded
      size: file.size,
      method: 'objecturl'
    };
  }

  /**
   * Calculate optimal dimensions while maintaining aspect ratio
   */
  private static calculateDimensions(originalWidth: number, originalHeight: number) {
    let width = originalWidth;
    let height = originalHeight;

    if (width > height && width > this.MAX_SIZE) {
      height = (height * this.MAX_SIZE) / width;
      width = this.MAX_SIZE;
    } else if (height > this.MAX_SIZE) {
      width = (width * this.MAX_SIZE) / height;
      height = this.MAX_SIZE;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  /**
   * Check if image data contains visible content (not just white pixels)
   */
  private static hasVisibleContent(imageData: ImageData): boolean {
    const { data } = imageData;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Check if pixel is not white (255, 255, 255)
      if (r !== 255 || g !== 255 || b !== 255) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Validate if a data URL represents a valid image
   */
  static async validateDataURL(dataURL: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!dataURL.startsWith('data:image/')) {
        resolve(false);
        return;
      }

      const img = new Image();
      img.onload = () => {
        resolve(img.width > 0 && img.height > 0);
      };
      img.onerror = () => resolve(false);
      img.src = dataURL;

      // Timeout
      setTimeout(() => resolve(false), 5000);
    });
  }
}