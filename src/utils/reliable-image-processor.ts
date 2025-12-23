/**
 * Reliable image processing for CivicSamadhan
 * Fixes the black image issue in admin dashboard
 */

export interface ProcessedImageResult {
  url: string;
  width: number;
  height: number;
  size: number;
  method: 'filereader-original' | 'canvas-resized' | 'canvas-direct';
  isValid: boolean;
}

export class ReliableImageProcessor {
  private static readonly MAX_SIZE = 1200;
  private static readonly QUALITY = 0.9; // Higher quality
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  /**
   * Process image with multiple strategies, prioritizing reliability over optimization
   */
  static async processImage(file: File): Promise<ProcessedImageResult> {
    console.log('🔧 ReliableImageProcessor: Processing', file.name, `(${(file.size / 1024).toFixed(1)}KB)`);

    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB`);
    }

    // Strategy 1: Direct FileReader (most reliable)
    try {
      const result = await this.processWithFileReader(file);
      if (await this.validateImage(result.url)) {
        console.log('✅ Direct FileReader successful');
        return result;
      }
    } catch (error) {
      console.warn('⚠️ FileReader failed:', error);
    }

    // Strategy 2: Canvas with careful processing (resized)
    try {
      const result = await this.processWithCanvas(file, true);
      if (await this.validateImage(result.url)) {
        console.log('✅ Canvas resizing successful');
        return result;
      }
    } catch (error) {
      console.warn('⚠️ Canvas resizing failed:', error);
    }

    // Strategy 3: Canvas without resizing (direct copy)
    try {
      const result = await this.processWithCanvas(file, false);
      if (await this.validateImage(result.url)) {
        console.log('✅ Canvas direct copy successful');
        return result;
      }
    } catch (error) {
      console.warn('⚠️ Canvas direct copy failed:', error);
    }

    throw new Error('All image processing methods failed');
  }

  /**
   * FileReader method - most reliable, no modification
   */
  private static async processWithFileReader(file: File): Promise<ProcessedImageResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const result = e.target?.result;
        if (typeof result === 'string' && result.startsWith('data:image/')) {
          try {
            const dimensions = await this.getImageDimensions(result);
            resolve({
              url: result,
              width: dimensions.width,
              height: dimensions.height,
              size: result.length,
              method: 'filereader-original',
              isValid: true
            });
          } catch (error) {
            reject(new Error('Failed to get image dimensions'));
          }
        } else {
          reject(new Error('Invalid FileReader result'));
        }
      };

      reader.onerror = () => reject(new Error('FileReader error'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Canvas processing with optional resizing
   */
  private static async processWithCanvas(file: File, shouldResize: boolean): Promise<ProcessedImageResult> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectURL = URL.createObjectURL(file);

      const cleanup = () => {
        URL.revokeObjectURL(objectURL);
      };

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            cleanup();
            reject(new Error('Canvas context unavailable'));
            return;
          }

          let width = img.naturalWidth;
          let height = img.naturalHeight;

          // Resize if needed and requested
          if (shouldResize && (width > this.MAX_SIZE || height > this.MAX_SIZE)) {
            if (width > height) {
              height = (height * this.MAX_SIZE) / width;
              width = this.MAX_SIZE;
            } else {
              width = (width * this.MAX_SIZE) / height;
              height = this.MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Configure canvas for high quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Important: Fill with white background to avoid transparency issues
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);

          // Draw the image
          ctx.drawImage(img, 0, 0, width, height);

          // Verify canvas content
          const testData = ctx.getImageData(width / 2, height / 2, 1, 1);
          const pixel = testData.data;
          
          // Check if we have actual image data (not just white background)
          const hasImageContent = this.verifyCanvasContent(ctx, width, height);
          
          if (!hasImageContent) {
            cleanup();
            reject(new Error('Canvas contains no image data'));
            return;
          }

          // Convert to high-quality JPEG
          const dataURL = canvas.toDataURL('image/jpeg', this.QUALITY);

          if (!dataURL || dataURL.length < 1000 || !dataURL.startsWith('data:image/')) {
            cleanup();
            reject(new Error('Invalid canvas output'));
            return;
          }

          cleanup();
          resolve({
            url: dataURL,
            width: Math.round(width),
            height: Math.round(height),
            size: dataURL.length,
            method: shouldResize ? 'canvas-resized' : 'canvas-direct',
            isValid: true
          });

        } catch (error) {
          cleanup();
          reject(error);
        }
      };

      img.onerror = () => {
        cleanup();
        reject(new Error('Image loading failed'));
      };

      // Set image source
      img.crossOrigin = 'anonymous';
      img.src = objectURL;

      // Timeout after 10 seconds
      setTimeout(() => {
        cleanup();
        reject(new Error('Image loading timeout'));
      }, 10000);
    });
  }

  /**
   * Verify that canvas actually contains image data
   */
  private static verifyCanvasContent(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
    try {
      // Sample multiple points across the image
      const samplePoints = [
        { x: Math.floor(width * 0.25), y: Math.floor(height * 0.25) },
        { x: Math.floor(width * 0.5), y: Math.floor(height * 0.5) },
        { x: Math.floor(width * 0.75), y: Math.floor(height * 0.75) },
      ];

      let nonWhitePixels = 0;
      
      for (const point of samplePoints) {
        const imageData = ctx.getImageData(point.x, point.y, 1, 1);
        const [r, g, b] = imageData.data;
        
        // Count non-white pixels
        if (r !== 255 || g !== 255 || b !== 255) {
          nonWhitePixels++;
        }
      }

      // Require at least one non-white pixel
      return nonWhitePixels > 0;
    } catch (error) {
      console.warn('Canvas verification failed:', error);
      return false;
    }
  }

  /**
   * Get image dimensions from data URL
   */
  private static async getImageDimensions(dataURL: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => reject(new Error('Failed to load image for dimensions'));
      img.src = dataURL;
    });
  }

  /**
   * Validate that an image URL can be loaded
   */
  private static async validateImage(dataURL: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!dataURL || !dataURL.startsWith('data:image/') || dataURL.length < 100) {
        resolve(false);
        return;
      }

      const img = new Image();
      img.onload = () => {
        // Ensure image has valid dimensions and isn't just a broken image
        resolve(img.naturalWidth > 0 && img.naturalHeight > 0 && img.complete);
      };
      img.onerror = () => resolve(false);
      img.src = dataURL;

      // Timeout validation after 3 seconds
      setTimeout(() => resolve(false), 3000);
    });
  }

  /**
   * Create a debug info object for troubleshooting
   */
  static createDebugInfo(file: File, result?: ProcessedImageResult): any {
    return {
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      },
      result: result ? {
        method: result.method,
        isValid: result.isValid,
        urlLength: result.url.length,
        urlPrefix: result.url.substring(0, 50),
        dimensions: `${result.width}x${result.height}`,
        sizeKB: Math.round(result.size / 1024)
      } : null,
      timestamp: new Date().toISOString()
    };
  }
}