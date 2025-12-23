import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationSelectorProps {
  address: string;
  onAddressChange: (address: string) => void;
  onUseCurrentLocation: () => void;
  coordinates?: { lat: number; lng: number };
  isLoadingLocation?: boolean;
}

export function LocationSelector({ 
  address, 
  onAddressChange, 
  onUseCurrentLocation, 
  coordinates = { lat: 40.712800, lng: -74.006000 },
  isLoadingLocation = false 
}: LocationSelectorProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([coordinates.lat, coordinates.lng]);
  
  useEffect(() => {
    setMapCenter([coordinates.lat, coordinates.lng]);
  }, [coordinates]);

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    // In a real implementation, you would update the coordinates here
    console.log("Map clicked at:", e.latlng);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="w-5 h-5" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Address</label>
          <Input
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="Enter street address or use current location"
          />
        </div>
        
        <Button 
          variant="outline" 
          onClick={onUseCurrentLocation}
          className="w-full"
          disabled={isLoadingLocation}
        >
          {isLoadingLocation ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Getting Location...
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4 mr-2" />
              Use Current Location
            </>
          )}
        </Button>

        {/* Map Container */}
        <div className="h-64 w-full rounded-lg overflow-hidden border">
          <MapContainer 
            center={mapCenter} 
            zoom={13} 
            style={{ height: "100%", width: "100%" }}
            eventHandlers={{
              click: handleMapClick
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={mapCenter}>
              <Popup>
                Selected location
              </Popup>
            </Marker>
          </MapContainer>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div>
              <div className="font-medium text-blue-900">Precise location helps city officials respond faster</div>
              <div className="text-xs text-blue-600 mt-1">💡 Allow location access when prompted by your browser</div>
            </div>
          </div>
        </div>
        
        {coordinates && (
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <div className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0" />
              <div>
                <div className="font-medium">Location captured</div>
                <div className="text-xs text-green-600 mt-1">
                  Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}