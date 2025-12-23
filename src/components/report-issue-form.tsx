import { useState, useRef, FormEvent, ChangeEvent } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { IssueCategories } from "./issue-categories";
import { LocationSelector } from "./location-selector";
import { Send, Camera, Paperclip, AlertTriangle, X, Image as ImageIcon, Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { analyzeReportWithAI } from "../utils/ai-service";
import { checkTitleDescriptionMatch } from "../utils/title-validation";

interface ReportIssueFormProps {
  onSubmit: (report: any) => void;
  onCancel: () => void;
  currentUser?: string;
}

export function ReportIssueForm({ onSubmit, onCancel, currentUser = "Citizen User" }: ReportIssueFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [title, setTitle] = useState("");
  const [photos, setPhotos] = useState<Array<{ file: File; url: string; id: string }>>([]);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({ lat: 40.712800, lng: -74.006000 });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !title || !description) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Automatically analyze report with AI before submission
    setIsAnalyzing(true);
    try {
      console.log('Starting automatic AI analysis with:', { title, description, address });
      const analysis = await analyzeReportWithAI(title, description, address);
      console.log('Received AI analysis:', analysis);
      
      // Apply AI suggestions automatically
      if (analysis.category && analysis.category !== selectedCategory) {
        setSelectedCategory(analysis.category);
        console.log('Applied AI suggested category:', analysis.category);
      }
      

      
      if (analysis.title && analysis.title !== title) {
        setTitle(analysis.title);
        console.log('Applied AI suggested title:', analysis.title);
      }
      
      if (analysis.description && analysis.description !== description) {
        setDescription(analysis.description);
        console.log('Applied AI suggested description:', analysis.description);
      }
      
      // Check if title and description match using AI (advisory only, not blocking)
      try {
        const matchResult = await checkTitleDescriptionMatch(title, description);
        if (!matchResult.matches) {
          toast.warning("Consider improving your title/description match. Suggestions: " + matchResult.suggestions.join(", "));
        }
      } catch (error) {
        console.warn("Non-critical AI validation error (submission allowed):", error);
      }
    } catch (error) {
      console.error("Automatic AI analysis failed:", error);
      // Continue with submission even if AI fails
    } finally {
      setIsAnalyzing(false);
    }

    const report = {
      id: Date.now().toString(),
      category: selectedCategory,
      title,
      description,
      address,
      status: "new" as const,
      date: new Date().toISOString(),
      submittedBy: currentUser,
      coordinates,
      photos: photos.map((photo: { id: string; file: File; url: string }) => ({
        id: photo.id,
        url: photo.url,
        filename: photo.file.name
      }))
    };

    console.log('ReportForm - Submitting report with photos:', {
      reportId: report.id,
      photosCount: report.photos.length,
      photos: report.photos.map((p: { id: string; filename: string; url: string }) => ({ id: p.id, filename: p.filename, urlLength: p.url.length }))
    });

    onSubmit(report);
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser.");
      return;
    }

    // Check if the page is served over HTTPS (required for geolocation in most browsers)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      toast.error("Location access requires a secure connection (HTTPS).");
      return;
    }

    setIsLoadingLocation(true);
    toast.info("Getting your current location...");

    // Check permissions first if available
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (permission.state === 'denied') {
          setIsLoadingLocation(false);
          toast.error("Location permission is denied. Please enable location permissions in your browser settings.");
          return;
        }
      } catch (err) {
        // Permissions API not supported, continue with regular geolocation
        console.log("Permissions API not supported, continuing with geolocation");
      }
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        
        // Set address to coordinates instead of using reverse geocoding
        setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        setIsLoadingLocation(false);
        toast.success("Location coordinates captured!");
      },
      (error) => {
        setIsLoadingLocation(false);
        console.error("Geolocation error details:", {
          code: error.code,
          message: error.message,
          errorObject: error
        });
        
        let errorMessage = "Unable to get your current location.";
        
        // Use the GeolocationPositionError constants
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            errorMessage = "Location access denied. Please enable location permissions in your browser and try again.";
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage = "Location information is unavailable. Please check your GPS/location services and try again.";
            break;
          case 3: // TIMEOUT
            errorMessage = "Location request timed out. Please try again or enter the address manually.";
            break;
          default:
            errorMessage = `Location error (${error.code}): ${error.message || 'Unknown error occurred'}`;
        }
        
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000 // 1 minute
      }
    );
  };

  const formatAddress = (geocodeData: any) => {
    const address = geocodeData.address || {};
    
    // Prioritize city name for the address field
    if (address.city) {
      return address.city;
    } else if (address.town) {
      return address.town;
    } else if (address.village) {
      return address.village;
    }
    
    // If no city/town/village, create a formatted address
    const parts = [];
    
    // Building number and street
    if (address.house_number) parts.push(address.house_number);
    if (address.road) parts.push(address.road);
    
    // Neighborhood or suburb
    if (address.neighbourhood) parts.push(address.neighbourhood);
    else if (address.suburb) parts.push(address.suburb);
    
    // State
    if (address.state) parts.push(address.state);
    if (address.postcode) parts.push(address.postcode);
    
    return parts.length > 0 ? parts.join(', ') : `${geocodeData.lat}, ${geocodeData.lon}`;
  };

  const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const maxFiles = 5;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (photos.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} photos allowed`);
      return;
    }

    for (const file of Array.from(files)) {
      const typedFile = file as File;
      if (!allowedTypes.includes(typedFile.type)) {
        toast.error(`${typedFile.name}: Only JPEG, PNG, WebP, and GIF images are allowed`);
        continue;
      }

      if (typedFile.size > maxFileSize) {
        toast.error(`${typedFile.name}: File size must be less than 5MB`);
        continue;
      }

      if (typedFile.size === 0) {
        toast.error(`${typedFile.name}: File appears to be empty`);
        continue;
      }

      console.log('Processing file:', { name: typedFile.name, type: typedFile.type, size: typedFile.size });

      // Process the image file
      const reader = new FileReader();
      reader.onload = (e) => {
        const newPhoto = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          file: typedFile,
          url: e.target?.result as string,
          filename: typedFile.name,
          size: typedFile.size,
        };
        
        setPhotos((prev: any[]) => [...prev, newPhoto]);
        toast.success(`Photo ${typedFile.name} uploaded successfully`);
      };
      
      reader.onerror = (error) => {
        console.error('❌ Image processing failed:', { filename: typedFile.name, error });
        toast.error(`Failed to process ${typedFile.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      };
      
      reader.readAsDataURL(typedFile);
    }
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos((prev: any[]) => prev.filter((photo: any) => photo.id !== photoId));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium">Report an Issue</h2>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <IssueCategories 
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />

          <Card>
            <CardHeader>
              <CardTitle>Issue Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief description of the issue"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Description *</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide more details about the issue..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Photos</label>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={triggerFileInput}
                      disabled={photos.length >= 5}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Add Photos ({photos.length}/5)
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>

                  {photos.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {photos.map((photo) => (
                        <div key={photo.id} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                            <img
                              src={photo.url}
                              alt="Issue photo"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('Report form - Image failed to load:', {
                                  filename: photo.file.name,
                                  urlPrefix: photo.url?.substring(0, 50),
                                  urlLength: photo.url?.length
                                });
                                // Set a red placeholder to indicate error
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZmYwMDAwIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIj5FUlJPUjwvdGV4dD4KPC9zdmc+';
                              }}
                              onLoad={() => {
                                console.log('Report form - Image loaded successfully:', photo.file.name);
                              }}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemovePhoto(photo.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                          <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 text-white text-xs p-1 rounded truncate">
                            {photo.file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <ImageIcon className="w-3 h-3" />
                      <span>Supported: JPEG, PNG, WebP (max 5MB each)</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <LocationSelector
            address={address}
            onAddressChange={setAddress}
            onUseCurrentLocation={handleUseCurrentLocation}
            coordinates={coordinates}
            isLoadingLocation={isLoadingLocation}
          />

          <Card>
            <CardContent className="p-6 space-y-4">
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isAnalyzing}>
                <Send className="w-4 h-4 mr-2" />
                {isAnalyzing ? "Analyzing & Submitting..." : "Submit Report"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Your report will be reviewed by city officials
              </p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}