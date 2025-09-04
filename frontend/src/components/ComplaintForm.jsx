import {React, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/api';
import { GoogleMap, useJsApiLoader, MarkerF, Autocomplete } from '@react-google-maps/api';
import { MapPin, Info, Image as ImageIcon, Mic, StopCircle, AlertTriangle, Loader2, X, Search } from 'lucide-react';

// Map styles for the dark theme
const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: true, // Allows switching map types
  mapTypeId: 'hybrid', // Default to satellite view
  styles: [
    // Styles for the ROADMAP view to keep it dark
    { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1e293b' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#cbd5e1' }],
    },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#2c5282" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca3af" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#747474" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3f4f6" }] },
    { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
    { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d0d0d0" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#505050" }] },
    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
    // Hide points of interest and business icons
    {
        featureType: "poi.business",
        elementType: "labels.icon",
        stylers: [{ visibility: "on" }],
    },
    {
        featureType: "transit",
        elementType: "labels.icon",
        stylers: [{ visibility: "on" }],
    },
  ],
};

// Data structure for category-specific issue titles
const issueTitlesByCategory = {
  'Water Supply & Sewage': ['Leaking Pipe', 'No Water Supply', 'Contaminated Water', 'Blocked Sewer Line', 'Overflowing Manhole'],
  'Roads & Potholes': ['Pothole Repair Request', 'Damaged Footpath/Sidewalk', 'Broken Speed Breaker', 'Faded Road Markings', 'Waterlogging on Road'],
  'Waste Management': ['Garbage Not Collected', 'Overflowing Public Dustbin', 'Street Sweeping Required', 'Dead Animal Removal', 'Illegal Dumping of Waste'],
  'Streetlights & Electricity': ['Streetlight Not Working', 'Exposed Electrical Wires', 'Damaged Electricity Pole', 'Frequent Power Cuts', 'Lights On During Daytime'],
  'Public Health & Sanitation': ['Mosquito Fogging Required', 'Unsanitary Public Toilet', 'Stagnant Water Accumulation', 'Need for Public Urinal'],
  'Illegal Construction & Encroachment': ['Encroachment on Footpath/Road', 'Illegal Construction Activity', 'Unauthorized Banner/Hoarding'],
};

const categories = Object.keys(issueTitlesByCategory).concat('Other');
const libraries = ['places'];

const ComplaintForm = ({ onComplaintSubmitted }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [mapCenter, setMapCenter] = useState({ lat: 18.5204, lng: 73.8567 }); // Pune
    const [markerPosition, setMarkerPosition] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [autocomplete, setAutocomplete] = useState(null);
    const [showCustomTitleInput, setShowCustomTitleInput] = useState(false);
    
    // New states for image capture and geotagging
    const [capturedImage, setCapturedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [geoTagData, setGeoTagData] = useState(null);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const currentLocation = { lat: latitude, lng: longitude };
                setMapCenter(currentLocation);
                setMarkerPosition(currentLocation); 
            },
            () => console.warn('Location access denied.')
        );
    }, []);

    // When category changes, reset the title and custom input visibility
    useEffect(() => {
        setTitle('');
        setShowCustomTitleInput(category === 'Other');
    }, [category]);

    const handleMapClick = useCallback((e) => {
        setMarkerPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    }, []);
    
    const onLoad = (autoC) => setAutocomplete(autoC);

    const onPlaceChanged = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
                const location = place.geometry.location;
                const newCenter = { lat: location.lat(), lng: location.lng() };
                setMapCenter(newCenter);
                setMarkerPosition(newCenter);
            }
        }
    };
    
    const handleTitleSelectChange = (e) => {
        const value = e.target.value;
        if (value === '_OTHER_') {
            setShowCustomTitleInput(true);
            setTitle(''); // Clear title to allow custom input
        } else {
            setShowCustomTitleInput(false);
            setTitle(value);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (event) => audioChunksRef.current.push(event.data);
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                audioChunksRef.current = [];
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            setError('Microphone access denied. Please allow access to record audio.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };
    
    // New function to handle image capture and geotagging
    const handleCaptureImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCapturedImage(file);
            setImagePreview(URL.createObjectURL(file));

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude, accuracy } = position.coords;
                        setGeoTagData({ latitude, longitude, accuracy });
                        setError('');
                    },
                    (error) => {
                        console.error('Geolocation error:', error);
                        setError('Unable to get your location. Please ensure location services are enabled.');
                    }
                );
            } else {
                setError('Geolocation is not supported by your browser.');
            }
        }
    };

    const handleRemoveAudio = () => {
        setAudioBlob(null);
    };

    const handleMicClick = () => {
        if (isRecording) stopRecording();
        else {
            setAudioBlob(null);
            startRecording();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!markerPosition || !capturedImage || !geoTagData || !category || !title || !description) {
            setError('Please fill out all required fields, place a pin on the map, and capture an image.');
            return;
        }
        setLoading(true);
        setError('');
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('latitude', markerPosition.lat);
        formData.append('longitude', markerPosition.lng);
        formData.append('image', capturedImage); // Append the captured image
        formData.append('category', category);
        if (audioBlob) formData.append('voiceNote', audioBlob, 'voice-note.webm');
        
        // Append geotag data
        formData.append('geotagLatitude', geoTagData.latitude);
        formData.append('geotagLongitude', geoTagData.longitude);
        formData.append('geotagAccuracy', geoTagData.accuracy);

        try {
            await api.post('/complaints', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            onComplaintSubmitted();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit complaint.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-primary border border-border rounded-lg p-4 sm:p-6 space-y-8">
            {/* Step 1: Location */}
            <div>
                <div className="flex gap-4 items-center mb-4">
                    <div className="bg-border h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center">
                        <MapPin className="text-accent" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary">Pinpoint the Location</h3>
                        <p className="text-text-secondary text-sm">Search for a place or click on the map to place a pin.</p>
                    </div>
                </div>
                
                {isLoaded && (
                    <div className="relative mb-4">
                        <label htmlFor="location-search" className="block text-sm font-medium text-text-secondary mb-2">Search Location</label>
                        <div className="relative">
                            <div className="absolute top-3 left-3 z-10">
                                 <Search className="text-text-secondary" />
                            </div>
                            <Autocomplete
                                onLoad={onLoad}
                                onPlaceChanged={onPlaceChanged}
                            >
                                <input
                                    id="location-search"
                                    type="text"
                                    placeholder="Search for a location..."
                                    className="w-full bg-background border border-border rounded-md py-3 pl-12 pr-4 text-text-primary focus:ring-2 focus:ring-accent focus:outline-none transition-shadow"
                                />
                            </Autocomplete>
                        </div>
                    </div>
                )}

                <div className="h-96 md:h-[500px] w-full rounded-md overflow-hidden bg-border">
                    {isLoaded ? (
                        <GoogleMap 
                            mapContainerStyle={mapContainerStyle} 
                            center={mapCenter} 
                            zoom={12} 
                            options={mapOptions}
                            onClick={handleMapClick}
                        >
                            {markerPosition && <MarkerF position={markerPosition} />}
                        </GoogleMap>
                    ) : <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-accent" /></div>}
                </div>
            </div>

            {/* Step 2: Details */}
            <div className="flex gap-4">
                <div className="bg-border h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center">
                    <Info className="text-accent" />
                </div>
                <div className="w-full">
                    <h3 className="text-lg font-semibold text-text-primary">Provide Details</h3>
                    <p className="text-text-secondary text-sm">Describe the issue and select a category.</p>
                    <div className="mt-4 space-y-4">
                        <div>
                            <label htmlFor="category-select" className="block text-sm font-medium text-text-secondary mb-2">Issue Category</label>
                            <select id="category-select" value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full bg-background border border-border rounded-md p-3 text-text-primary focus:ring-2 focus:ring-accent focus:outline-none transition-shadow">
                                <option value="" disabled>-- Select a Category --</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        
                        <div>
                            <label htmlFor="title-select" className="block text-sm font-medium text-text-secondary mb-2">Issue Title</label>
                            <select 
                                id="title-select"
                                value={showCustomTitleInput ? '_OTHER_' : title} 
                                onChange={handleTitleSelectChange} 
                                required 
                                disabled={!category || category === 'Other'}
                                className="w-full bg-background border border-border rounded-md p-3 text-text-primary focus:ring-2 focus:ring-accent focus:outline-none transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="" disabled>{!category ? 'Select a category first' : '-- Select an Issue Title --'}</option>
                                {category && issueTitlesByCategory[category]?.map(issueTitle => (
                                    <option key={issueTitle} value={issueTitle}>{issueTitle}</option>
                                ))}
                                {category && category !== 'Other' && <option value="_OTHER_">Other (please specify)</option>}
                            </select>
                        </div>
                        
                        {showCustomTitleInput && (
                            <div>
                                <label htmlFor="custom-title-input" className="block text-sm font-medium text-text-secondary mb-2">Custom Issue Title</label>
                                <input id="custom-title-input" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Please specify the issue title" required className="w-full bg-background border border-border rounded-md p-3 text-text-primary focus:ring-2 focus:ring-accent focus:outline-none transition-shadow" />
                            </div>
                        )}
                        
                        <div>
                            <label htmlFor="description-textarea" className="block text-sm font-medium text-text-secondary mb-2">Detailed Description</label>
                            <textarea id="description-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide as much detail as possible..." required rows="4" className="w-full bg-background border border-border rounded-md p-3 text-text-primary focus:ring-2 focus:ring-accent focus:outline-none transition-shadow" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Step 3: Evidence */}
            <div className="flex gap-4">
                <div className="bg-border h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center">
                    <ImageIcon className="text-accent" />
                </div>
                <div className="w-full">
                    <h3 className="text-lg font-semibold text-text-primary">Upload Evidence</h3>
                    <p className="text-text-secondary text-sm">An image is required. You can also record a voice note.</p>
                    <div className="mt-4 space-y-4">
                        <div>
                            <label htmlFor="image-capture" className="block text-sm font-medium text-text-secondary mb-2">Capture Image*</label>
                            {!imagePreview ? (
                                <input id="image-capture" type="file" onChange={handleCaptureImage} accept="image/*" capture="environment" required className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-border file:text-text-primary hover:file:bg-accent hover:file:text-background transition-colors" />
                            ) : (
                                <div className="relative w-full max-w-xs">
                                    <img src={imagePreview} alt="Complaint preview" className="rounded-md w-full h-auto object-cover" />
                                    <div className="mt-2 text-sm text-text-secondary">
                                        {geoTagData && (
                                            <p>Location captured: <span className="font-semibold">{geoTagData.latitude.toFixed(4)}</span>, <span className="font-semibold">{geoTagData.longitude.toFixed(4)}</span></p>
                                        )}
                                        {!geoTagData && (
                                            <p className="text-priority-high">Geotagging failed. Please check location permissions.</p>
                                        )}
                                    </div>
                                    <button type="button" onClick={() => { setCapturedImage(null); setImagePreview(null); setGeoTagData(null); }} className="absolute top-2 right-2 bg-background/50 text-white rounded-full p-1 hover:bg-background transition-colors">
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <div>
                           <label className="block text-sm font-medium text-text-secondary mb-2">Record Voice Note (Optional)</label>
                            <div className="flex items-center gap-4">
                                {!audioBlob && (
                                    <button type="button" onClick={handleMicClick} className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${isRecording} `? 'bg-priority-high/20 text-priority-high animate-pulse' : 'bg-border text-accent hover:bg-accent hover:text-background'}>
                                        {isRecording ? <StopCircle /> : <Mic />}
                                    </button>
                                )}
                                <div className="flex-grow">
                                    {isRecording && <p className="text-sm text-priority-high animate-pulse">Recording audio...</p>}
                                    {audioBlob && !isRecording && (
                                        <div className="flex items-center gap-2">
                                            <audio src={URL.createObjectURL(audioBlob)} controls className="w-full max-w-xs h-10" />
                                            <button type="button" onClick={handleRemoveAudio} className="text-text-secondary hover:text-priority-high transition-colors">
                                                <X size={20} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Submission Area */}
            <div className="pt-6 border-t border-border">
                {error && (
                    <div className="bg-priority-high/10 border border-priority-high/30 text-priority-high text-sm p-3 rounded-md flex items-center gap-3 mb-4">
                        <AlertTriangle size={20} />
                        <span>{error}</span>
                    </div>
                )}
                <button onClick={handleSubmit} disabled={loading} className="w-full bg-accent text-background font-bold py-3 px-6 rounded-md hover:bg-accent-dark disabled:bg-border disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors">
                    {loading ? <Loader2 className="animate-spin" /> : 'Submit Report'}
                </button>
            </div>
        </div>
    );
};

export default ComplaintForm;