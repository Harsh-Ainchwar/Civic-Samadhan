import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ReliableImageProcessor } from '../utils/reliable-image-processor';
import { EnhancedImageDisplay } from './enhanced-image-display';

export function TestImageDebug() {
  const [processedImages, setProcessedImages] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsProcessing(true);
    const results = [];

    for (const file of Array.from(files)) {
      try {
        console.log('🚀 Testing file:', file.name);
        
        // Method 1: ReliableImageProcessor
        let reliableResult = null;
        try {
          reliableResult = await ReliableImageProcessor.processImage(file);
          console.log('✅ ReliableImageProcessor success:', reliableResult.method);
        } catch (error) {
          console.error('❌ ReliableImageProcessor failed:', error);
        }

        // Method 2: Simple FileReader
        let fileReaderResult = null;
        try {
          fileReaderResult = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result;
              if (typeof result === 'string') {
                resolve(result);
              } else {
                reject(new Error('Invalid result'));
              }
            };
            reader.onerror = () => reject(new Error('FileReader error'));
            reader.readAsDataURL(file);
          });
          console.log('✅ Simple FileReader success');
        } catch (error) {
          console.error('❌ Simple FileReader failed:', error);
        }

        // Method 3: Object URL
        const objectURL = URL.createObjectURL(file);
        console.log('✅ Object URL created');

        results.push({
          filename: file.name,
          fileSize: file.size,
          reliableProcessor: reliableResult,
          fileReader: fileReaderResult,
          objectURL: objectURL,
          id: Date.now() + Math.random()
        });

      } catch (error) {
        console.error('❌ Overall processing failed for', file.name, ':', error);
      }
    }

    setProcessedImages(results);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>🔬 Image Processing Debug Tool</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
            
            {isProcessing && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Processing images...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {processedImages.length > 0 && (
        <div className="space-y-6">
          {processedImages.map((imageResult, index) => (
            <Card key={imageResult.id} className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">
                  📷 {imageResult.filename} ({(imageResult.fileSize / 1024).toFixed(1)}KB)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Method 1: ReliableImageProcessor */}
                <div className="border rounded p-4">
                  <h3 className="font-semibold mb-3 text-emerald-700">Method 1: ReliableImageProcessor</h3>
                  {imageResult.reliableProcessor ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p><strong>Method:</strong> {imageResult.reliableProcessor.method}</p>
                          <p><strong>Size:</strong> {(imageResult.reliableProcessor.size / 1024).toFixed(1)}KB</p>
                          <p><strong>Dimensions:</strong> {imageResult.reliableProcessor.width}x{imageResult.reliableProcessor.height}</p>
                        </div>
                        <div className="aspect-square">
                          <EnhancedImageDisplay
                            src={imageResult.reliableProcessor.url}
                            alt={imageResult.filename}
                            filename={`${imageResult.filename} (${imageResult.reliableProcessor.method})`}
                            className="w-full h-full border rounded"
                            showDebugInfo={true}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 p-3 rounded">
                      <p className="text-red-700">❌ ReliableImageProcessor failed</p>
                    </div>
                  )}
                </div>

                {/* Method 2: Simple FileReader */}
                <div className="border rounded p-4">
                  <h3 className="font-semibold mb-3 text-blue-700">Method 2: Simple FileReader</h3>
                  {imageResult.fileReader ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p><strong>Size:</strong> {(imageResult.fileReader.length / 1024).toFixed(1)}KB</p>
                          <p><strong>Type:</strong> {imageResult.fileReader.substring(0, 30)}...</p>
                        </div>
                        <div className="aspect-square">
                          <img
                            src={imageResult.fileReader}
                            alt={imageResult.filename}
                            className="w-full h-full object-cover border rounded"
                            onLoad={() => console.log('✅ FileReader image loaded')}
                            onError={() => console.error('❌ FileReader image failed')}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 p-3 rounded">
                      <p className="text-red-700">❌ FileReader failed</p>
                    </div>
                  )}
                </div>

                {/* Method 3: Object URL */}
                <div className="border rounded p-4">
                  <h3 className="font-semibold mb-3 text-purple-700">Method 3: Object URL</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p><strong>URL:</strong> {imageResult.objectURL.substring(0, 50)}...</p>
                      </div>
                      <div className="aspect-square">
                        <img
                          src={imageResult.objectURL}
                          alt={imageResult.filename}
                          className="w-full h-full object-cover border rounded"
                          onLoad={() => console.log('✅ Object URL image loaded')}
                          onError={() => console.error('❌ Object URL image failed')}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}