import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';

// A skeleton loader for a better user experience while the map loads
const MapSkeleton = () => (
    <div className="bg-primary border border-border rounded-lg flex items-center justify-center w-full h-full min-h-[500px]">
        <div className="text-center">
            <Loader2 size={48} className="animate-spin text-accent mx-auto" />
            <p className="mt-4 text-text-secondary">Loading Map...</p>
        </div>
    </div>
);

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: true, // Allows switching map types
  mapTypeId: 'hybrid', // Default to satellite view
  styles: [
    // These styles apply to the 'Roadmap' view to keep it dark
    { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1e293b' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#cbd5e1' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#2c5282' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#747474' }] },
    { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },

    // These styles hide unnecessary labels in BOTH satellite and roadmap views
    {
        featureType: "poi", // Hides icons for all Points of Interest (shops, parks, etc.)
        elementType: "labels.icon",
        stylers: [{ visibility: "off" }],
    },
    {
        featureType: "transit", // Hides icons for transit stations (bus, train)
        elementType: "labels.icon",
        stylers: [{ visibility: "off" }],
    },
  ],
};

const MapView = ({ complaints }) => {
  const [activeMarker, setActiveMarker] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const handleMarkerClick = (complaintId) => {
    setActiveMarker(complaintId);
  };

  const getMarkerIcon = (priority) => {
    if (!window.google) return null;
    
    // Using our theme colors for markers
    const color = priority === 'High' ? '#ef4444' : priority === 'Medium' ? '#f97316' : '#22c55e';

    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#0f172a', // Corresponds to our 'background' color
      strokeWeight: 2,
      scale: 8,
    };
  };

  if (!isLoaded) return <MapSkeleton />;

  return (
    <div className="w-full h-full bg-primary border border-border rounded-lg overflow-hidden">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={{ lat: 18.5204, lng: 73.8567 }} // Pune Center
        zoom={12}
        options={mapOptions}
      >
        {complaints.map((complaint) => (
          <MarkerF
            key={complaint._id}
            position={{
              lat: complaint.location.coordinates[1], // Latitude
              lng: complaint.location.coordinates[0], // Longitude
            }}
            icon={getMarkerIcon(complaint.priority)}
            onClick={() => handleMarkerClick(complaint._id)}
          >
            {activeMarker === complaint._id && (
              <InfoWindowF
                onCloseClick={() => setActiveMarker(null)}
                options={{ pixelOffset: new window.google.maps.Size(0, -30) }}
              >
                <div className="bg-background text-text-primary p-2 rounded-md">
                  <h4 className="font-bold">{complaint.title}</h4>
                  <p className="text-sm">{complaint.category}</p>
                </div>
              </InfoWindowF>
            )}
          </MarkerF>
        ))}
      </GoogleMap>
    </div>
  );
};

export default React.memo(MapView);