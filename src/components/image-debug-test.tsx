import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useComplaints } from "../contexts/ComplaintContext";
import { Alert, AlertDescription } from "./ui/alert";
import { CheckCircle, AlertTriangle, Upload } from "lucide-react";

export function ImageDebugTest() {
  const { complaints, addComplaint } = useComplaints();
  const [testImageDataUrl, setTestImageDataUrl] = useState<string>('');
  
  // Find complaints with photos
  const complaintsWithPhotos = complaints.filter(c => c.photos && c.photos.length > 0);
  
  console.log('🔍 ImageDebugTest - Found complaints with photos:', {
    total: complaints.length,
    withPhotos: complaintsWithPhotos.length,
    details: complaintsWithPhotos.map(c => ({
      id: c.id,
      title: c.title,
      photosCount: c.photos?.length,
      photos: c.photos?.map(p => ({
        id: p.id,
        filename: p.filename,
        urlType: p.url?.startsWith('data:') ? 'base64' : 'external',
        urlLength: p.url?.length,
        urlPrefix: p.url?.substring(0, 50)
      }))
    }))
  });

  const handleTestImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setTestImageDataUrl(dataUrl);
      
      // Create a test complaint with this image
      const testComplaint = {
        id: `debug-test-${Date.now()}`,
        title: `Debug Test Image - ${file.name}`,
        category: "Street Infrastructure",
        description: "Debug test complaint with real uploaded image to verify functionality",
        address: "Debug Test Location",
        coordinates: { lat: 40.7128, lng: -74.0060 },
        status: "new" as const,
        priority: "low" as const,
        date: new Date().toISOString(),
        submittedBy: "Debug Test User",
        photos: [{
          id: `debug-photo-${Date.now()}`,
          url: dataUrl,
          filename: file.name
        }]
      };
      
      console.log('🔧 Adding debug test complaint with image:', {
        complaintId: testComplaint.id,
        imageSize: file.size,
        imageType: file.type,
        dataUrlLength: dataUrl.length
      });
      
      addComplaint(testComplaint);
    };
    
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-4 space-y-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Image Debug Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              This debug panel helps diagnose image upload and display issues between citizen and admin interfaces.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-medium mb-2">System Status</h4>
              <p className="text-sm">Total Complaints: <strong>{complaints.length}</strong></p>
              <p className="text-sm">With Photos: <strong>{complaintsWithPhotos.length}</strong></p>
              <p className="text-sm">Context Working: <strong className="text-green-600">✓</strong></p>
            </div>
            
            <div className="p-4 border rounded">
              <h4 className="font-medium mb-2">Quick Test Upload</h4>
              <input
                type="file"
                accept="image/*"
                onChange={handleTestImageUpload}
                className="mb-2 text-sm"
              />
              <p className="text-xs text-gray-600">Upload a test image to create a debug complaint</p>
            </div>
            
            <div className="p-4 border rounded">
              <h4 className="font-medium mb-2">Test Preview</h4>
              {testImageDataUrl ? (
                <img 
                  src={testImageDataUrl} 
                  alt="Test upload" 
                  className="w-16 h-16 object-cover border rounded"
                />
              ) : (
                <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {complaintsWithPhotos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Complaints with Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {complaintsWithPhotos.map(complaint => (
                <div key={complaint.id} className="border p-4 rounded">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium">{complaint.title}</h3>
                      <p className="text-sm text-gray-600">By: {complaint.submittedBy}</p>
                    </div>
                    <div className="text-sm">
                      Photos: <strong>{complaint.photos?.length}</strong>
                    </div>
                  </div>
                  
                  {complaint.photos && complaint.photos.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {complaint.photos.map((photo, index) => (
                        <div key={photo.id || index} className="space-y-2">
                          <div className="aspect-square border rounded overflow-hidden bg-gray-100 relative">
                            <img
                              src={photo.url}
                              alt={photo.filename}
                              className="w-full h-full object-cover"
                              onLoad={() => {
                                console.log('✅ Debug - Image loaded successfully:', {
                                  filename: photo.filename,
                                  id: photo.id,
                                  urlType: photo.url?.startsWith('data:') ? 'base64' : 'external'
                                });
                              }}
                              onError={(e) => {
                                console.error('❌ Debug - Image failed to load:', {
                                  filename: photo.filename,
                                  id: photo.id,
                                  url: photo.url?.substring(0, 100),
                                  error: e
                                });
                                // Set a clear error indicator
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZmYwMDAwIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiPkVSUk9SPC90ZXh0Pjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IndoaXRlIj5MT0FEPC90ZXh0Pjx0ZXh0IHg9IjEwMCIgeT0iMTIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IndoaXRlIj5GQUlMPC90ZXh0Pjwvc3ZnPg==';
                              }}
                            />
                            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                              {photo.url?.startsWith('data:') ? 'B64' : 'URL'}
                            </div>
                          </div>
                          <div className="text-xs space-y-1">
                            <p><strong>File:</strong> {photo.filename}</p>
                            <p><strong>Type:</strong> {photo.url?.startsWith('data:') ? 'Base64 Data URL' : 'External URL'}</p>
                            <p><strong>Size:</strong> {photo.url?.length ? `${(photo.url.length / 1024).toFixed(1)} KB` : 'Unknown'}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                console.log('🔍 Raw photo data:', photo);
                                const popup = window.open('', '_blank', 'width=600,height=400');
                                if (popup) {
                                  popup.document.write(`
                                    <html>
                                      <head><title>Photo Debug - ${photo.filename}</title></head>
                                      <body style="margin: 20px; font-family: monospace;">
                                        <h2>Photo Debug Info</h2>
                                        <p><strong>Filename:</strong> ${photo.filename}</p>
                                        <p><strong>ID:</strong> ${photo.id}</p>
                                        <p><strong>URL Length:</strong> ${photo.url?.length}</p>
                                        <p><strong>URL Type:</strong> ${photo.url?.startsWith('data:') ? 'Base64 Data URL' : 'External URL'}</p>
                                        <h3>URL Preview (first 500 chars):</h3>
                                        <textarea style="width: 100%; height: 200px;" readonly>${photo.url?.substring(0, 500)}...</textarea>
                                      </body>
                                    </html>
                                  `);
                                }
                              }}
                            >
                              Debug Info
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const popup = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
                                if (popup) {
                                  popup.document.write(`
                                    <!DOCTYPE html>
                                    <html>
                                      <head>
                                        <title>Full Image - ${photo.filename}</title>
                                        <style>
                                          body { 
                                            margin: 0; 
                                            padding: 20px; 
                                            background: #f5f5f5; 
                                            font-family: Arial, sans-serif;
                                            display: flex;
                                            flex-direction: column;
                                            align-items: center;
                                          }
                                          .image-container {
                                            background: white;
                                            padding: 20px;
                                            border-radius: 8px;
                                            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                                            max-width: 100%;
                                            text-align: center;
                                          }
                                          img { 
                                            max-width: 100%; 
                                            height: auto; 
                                            border: 1px solid #ddd;
                                            border-radius: 4px;
                                          }
                                          .info {
                                            margin-bottom: 15px;
                                            text-align: left;
                                            background: #f8f9fa;
                                            padding: 10px;
                                            border-radius: 4px;
                                            font-size: 14px;
                                          }
                                          .download-btn {
                                            margin-top: 15px;
                                            padding: 8px 16px;
                                            background: #10b981;
                                            color: white;
                                            border: none;
                                            border-radius: 4px;
                                            cursor: pointer;
                                          }
                                          .download-btn:hover {
                                            background: #059669;
                                          }
                                        </style>
                                      </head>
                                      <body>
                                        <div class="image-container">
                                          <div class="info">
                                            <strong>Filename:</strong> ${photo.filename}<br>
                                            <strong>Type:</strong> ${photo.url?.startsWith('data:') ? 'Base64 Data URL' : 'External URL'}<br>
                                            <strong>Size:</strong> ${photo.url?.length ? `${(photo.url.length / 1024).toFixed(1)} KB` : 'Unknown'}
                                          </div>
                                          <img src="${photo.url}" alt="${photo.filename}" onload="console.log('Image loaded successfully')" onerror="console.error('Failed to load image'); this.style.display='none'; this.nextElementSibling.style.display='block';" />
                                          <div style="display:none; color: red; padding: 20px; border: 2px dashed #ff6b6b; margin-top: 10px;">
                                            ❌ Failed to load image. The image data may be corrupted.
                                          </div>
                                          <button class="download-btn" onclick="
                                            const link = document.createElement('a');
                                            link.href = '${photo.url}';
                                            link.download = '${photo.filename}';
                                            link.click();
                                          ">Download Image</button>
                                        </div>
                                      </body>
                                    </html>
                                  `);
                                  popup.document.close();
                                }
                              }}
                            >
                              Open Full
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}