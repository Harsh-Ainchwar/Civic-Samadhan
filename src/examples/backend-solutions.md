# Backend Solutions for Image Upload Issues

## 🚀 Node.js/Express Solution

```javascript
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Image processing endpoint
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('📁 Processing file:', {
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Process image with Sharp
    const processedImage = await sharp(req.file.buffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 85,
        progressive: true
      })
      .toBuffer();

    // Convert to base64 for storage
    const base64Image = `data:image/jpeg;base64,${processedImage.toString('base64')}`;

    // Store in database (example with MongoDB)
    const imageRecord = {
      filename: req.file.originalname,
      size: processedImage.length,
      data: base64Image,
      uploadedAt: new Date()
    };

    console.log('✅ Image processed successfully:', {
      originalSize: req.file.size,
      processedSize: processedImage.length,
      compressionRatio: ((req.file.size - processedImage.length) / req.file.size * 100).toFixed(1) + '%'
    });

    res.json({
      success: true,
      image: {
        id: generateId(),
        url: base64Image,
        filename: req.file.originalname,
        size: processedImage.length
      }
    });

  } catch (error) {
    console.error('❌ Image processing failed:', error);
    res.status(500).json({ 
      error: 'Image processing failed',
      details: error.message 
    });
  }
});

// Helper function for generating unique IDs
function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}
```

## 🐍 Django Solution

```python
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from PIL import Image, ImageOps
import base64
import io
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
@require_http_methods(["POST"])
def upload_image(request):
    try:
        if 'image' not in request.FILES:
            return JsonResponse({'error': 'No file uploaded'}, status=400)
        
        uploaded_file = request.FILES['image']
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
        if uploaded_file.content_type not in allowed_types:
            return JsonResponse({'error': 'Invalid file type'}, status=400)
        
        # Validate file size (5MB limit)
        if uploaded_file.size > 5 * 1024 * 1024:
            return JsonResponse({'error': 'File too large'}, status=400)
        
        logger.info(f"📁 Processing file: {uploaded_file.name}, Size: {uploaded_file.size}")
        
        # Open and process image with PIL
        with Image.open(uploaded_file) as img:
            # Fix orientation based on EXIF data
            img = ImageOps.exif_transpose(img)
            
            # Convert to RGB if necessary (handles transparency)
            if img.mode in ('RGBA', 'LA', 'P'):
                # Create white background
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            
            # Resize if needed
            max_size = 1200
            if img.width > max_size or img.height > max_size:
                img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
            
            # Save to bytes buffer
            buffer = io.BytesIO()
            img.save(buffer, format='JPEG', quality=85, optimize=True)
            buffer.seek(0)
            
            # Convert to base64
            image_data = buffer.getvalue()
            base64_image = base64.b64encode(image_data).decode('utf-8')
            data_url = f"data:image/jpeg;base64,{base64_image}"
            
            logger.info(f"✅ Image processed successfully: {len(image_data)} bytes")
            
            return JsonResponse({
                'success': True,
                'image': {
                    'id': generate_id(),
                    'url': data_url,
                    'filename': uploaded_file.name,
                    'size': len(image_data)
                }
            })
            
    except Exception as e:
        logger.error(f"❌ Image processing failed: {str(e)}")
        return JsonResponse({
            'error': 'Image processing failed',
            'details': str(e)
        }, status=500)

def generate_id():
    import time
    import random
    import string
    return str(int(time.time() * 1000)) + ''.join(random.choices(string.ascii_lowercase + string.digits, k=9))
```

## 🟠 Laravel Solution

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Intervention\Image\Facades\Image;
use Illuminate\Support\Str;

class ImageUploadController extends Controller
{
    public function uploadImage(Request $request)
    {
        try {
            // Validate the request
            $request->validate([
                'image' => 'required|image|mimes:jpeg,jpg,png,webp,gif|max:5120' // 5MB
            ]);

            $file = $request->file('image');
            
            Log::info('📁 Processing file', [
                'name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime' => $file->getMimeType()
            ]);

            // Process image with Intervention Image
            $image = Image::make($file);
            
            // Fix orientation
            $image->orientate();
            
            // Resize if needed (maintain aspect ratio)
            $maxSize = 1200;
            if ($image->width() > $maxSize || $image->height() > $maxSize) {
                $image->resize($maxSize, $maxSize, function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                });
            }

            // Ensure white background for transparency
            $canvas = Image::canvas($image->width(), $image->height(), '#ffffff');
            $canvas->insert($image);

            // Convert to JPEG with quality
            $processedImage = $canvas->encode('jpg', 85);
            
            // Convert to base64
            $base64 = base64_encode($processedImage->__toString());
            $dataUrl = 'data:image/jpeg;base64,' . $base64;

            Log::info('✅ Image processed successfully', [
                'original_size' => $file->getSize(),
                'processed_size' => strlen($processedImage->__toString()),
                'compression_ratio' => round((($file->getSize() - strlen($processedImage->__toString())) / $file->getSize()) * 100, 1) . '%'
            ]);

            return response()->json([
                'success' => true,
                'image' => [
                    'id' => $this->generateId(),
                    'url' => $dataUrl,
                    'filename' => $file->getClientOriginalName(),
                    'size' => strlen($processedImage->__toString())
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Image processing failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Image processing failed',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    private function generateId()
    {
        return (string) (time() * 1000) . Str::random(9);
    }
}
```

## 🔧 Frontend Integration

```typescript
// Updated upload function for your React app
export const uploadToBackend = async (file: File): Promise<ProcessedImage> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/api/upload-image', {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json',
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || 'Upload failed');
  }

  const result = await response.json();
  return {
    url: result.image.url,
    width: 0, // Will be determined by browser
    height: 0, // Will be determined by browser
    size: result.image.size,
    method: 'backend'
  };
};
```

## 🔍 Debug Commands

### Node.js Debug
```bash
# Enable debug logging
DEBUG=app:* npm start

# Check image processing
curl -X POST -F "image=@test.jpg" http://localhost:3000/api/upload-image
```

### Django Debug
```bash
# Enable debug logging
python manage.py runserver --verbosity=2

# Check image processing
curl -X POST -F "image=@test.jpg" http://localhost:8000/api/upload-image/
```

### Laravel Debug
```bash
# Enable debug mode
php artisan serve --verbose

# Check logs
tail -f storage/logs/laravel.log

# Test upload
curl -X POST -F "image=@test.jpg" http://localhost:8000/api/upload-image
```