import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/api';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { MapPin, Info, Image as ImageIcon, Mic, StopCircle, AlertTriangle, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

// Map styles for the light theme (default)
const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: true,
  mapTypeId: 'hybrid', 
  draggable: false, 
  scrollwheel: false, 
  disableDoubleClickZoom: true
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
const libraries = ['geocoding']; // Only geocoding is needed now

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
    const [showCustomTitleInput, setShowCustomTitleInput] = useState(false);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [locationName, setLocationName] = useState('Fetching location...');

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const imageInputRef = useRef(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    useEffect(() => {
        if (isLoaded) {
            const geocoder = new window.google.maps.Geocoder();
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const currentLocation = { lat: latitude, lng: longitude };
                    setMapCenter(currentLocation);
                    setMarkerPosition(currentLocation);

                    // Reverse geocode to get address
                    geocoder.geocode({ location: currentLocation }, (results, status) => {
                        if (status === 'OK' && results[0]) {
                            setLocationName(results[0].formatted_address);
                        } else {
                            setLocationName('Address not found');
                        }
                    });
                },
                () => {
                    setError('Unable to get your location. Please enable location services.');
                    setLocationName('Location access denied');
                }
            );
        }
    }, [isLoaded]);

    useEffect(() => {
        setTitle('');
        setShowCustomTitleInput(category === 'Other');
    }, [category]);

    const handleTitleSelectChange = (e) => {
        const value = e.target.value;
        if (value === '_OTHER_') {
            setShowCustomTitleInput(true);
            setTitle('');
        } else {
            setShowCustomTitleInput(false);
            setTitle(value);
        }
    };
    
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setImagePreview(null);
        if (imageInputRef.current) {
            imageInputRef.current.value = "";
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!markerPosition || !image || !category || !title || !description) {
            setError('Please fill out all required fields.');
            return;
        }
        setLoading(true);
        setError('');
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('latitude', markerPosition.lat);
        formData.append('longitude', markerPosition.lng);
        formData.append('image', image);
        formData.append('category', category);
        formData.append('locationName', locationName); // Send the location name
        if (audioBlob) formData.append('voiceNote', audioBlob, 'voice-note.webm');

        try {
            await api.post('/complaints', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            onComplaintSubmitted();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit complaint.');
            toast.error('Failed to submit complaint.');
        } finally {
            setLoading(false);
            toast.success('Complaint submitted successfully!');
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 space-y-8 shadow-lg">
            {/* Step 1: Location */}
            <div>
                <div className="flex gap-4 items-center mb-4">
                    <div className="bg-gray-100 h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center">
                        <MapPin className="text-accent" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-text-on-light">Issue Location</h3>
                        <p className="text-text-secondary-on-light text-sm">Your live location is automatically captured.</p>
                    </div>
                </div>
                
                <div className="mb-4">
                    <label htmlFor="location-name" className="block text-sm font-medium text-text-secondary-on-light mb-2">Captured Address</label>
                    <input
                        id="location-name"
                        type="text"
                        value={locationName}
                        disabled
                        className="w-full bg-gray-100 border border-gray-300 rounded-md py-3 px-4 text-text-secondary-on-light cursor-not-allowed"
                    />
                </div>

                <div className="h-96 md:h-[500px] w-full rounded-md overflow-hidden bg-gray-200">
                    {isLoaded ? (
                        <GoogleMap 
                            mapContainerStyle={mapContainerStyle} 
                            center={mapCenter} 
                            zoom={15}
                            options={mapOptions}
                        >
                            {markerPosition && <MarkerF position={markerPosition} />}
                        </GoogleMap>
                    ) : <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-accent" /></div>}
                </div>
            </div>

            {/* Step 2: Details & Evidence */}
            <div className="flex gap-4">
                <div className="bg-gray-100 h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center">
                    <Info className="text-accent" />
                </div>
                <div className="w-full">
                    <h3 className="text-lg font-semibold text-text-on-light">Provide Details & Evidence</h3>
                    <div className="mt-4 space-y-4">
                        <div>
                            <label htmlFor="category-select" className="block text-sm font-medium text-text-secondary-on-light mb-2">Issue Category</label>
                            <select id="category-select" value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-text-on-light focus:ring-2 focus:ring-accent focus:outline-none transition-shadow shadow-sm">
                                <option value="" disabled>-- Select a Category --</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        
                        <div>
                            <label htmlFor="title-select" className="block text-sm font-medium text-text-secondary-on-light mb-2">Issue Title</label>
                            <select 
                                id="title-select"
                                value={showCustomTitleInput ? '_OTHER_' : title} 
                                onChange={handleTitleSelectChange} 
                                required 
                                disabled={!category || category === 'Other'}
                                className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-text-on-light focus:ring-2 focus:ring-accent focus:outline-none transition-shadow shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                                <label htmlFor="custom-title-input" className="block text-sm font-medium text-text-secondary-on-light mb-2">Custom Issue Title</label>
                                <input id="custom-title-input" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Please specify the issue title" required className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-text-on-light focus:ring-2 focus:ring-accent focus:outline-none transition-shadow shadow-sm" />
                            </div>
                        )}
                        
                        <div>
                            <label htmlFor="description-textarea" className="block text-sm font-medium text-text-secondary-on-light mb-2">Detailed Description</label>
                            <textarea id="description-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide as much detail as possible..." required rows="4" className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-text-on-light focus:ring-2 focus:ring-accent focus:outline-none transition-shadow shadow-sm" />
                        </div>

                        <div>
  <label className="block text-sm font-medium text-text-secondary-on-light mb-2">
    Capture Image*
  </label>

  {!imagePreview ? (
    <>
      <button
        type="button"
        onClick={() => imageInputRef.current.click()}
        className="w-28  bg-accent text-white font-bold py-1 px-1 rounded-md hover:bg-accent-dark transition-colors shadow-md"
      >
        Take Photo
      </button>
      <input
        id="image-input"
        ref={imageInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageChange}
        required
        className="hidden"
      />
    </>
  ) : (
    <div className="relative w-full max-w-xs">
      <img
        src={imagePreview}
        alt="Complaint preview"
        className="rounded-md w-full h-auto object-cover shadow-md"
      />
      <button
        type="button"
        onClick={handleRemoveImage}
        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black transition-colors"
      >
        <X size={16} />
      </button>
      <div className='mt-2 text-sm text-gray-700'>Geotag Captured <span>({markerPosition.lat}, {markerPosition.lng})</span></div>
    </div>
    
  )}
</div>
                        
                        <div>
                           <label className="block text-sm font-medium text-text-secondary-on-light mb-2">Record Voice Note (Optional)</label>
                            <div className="flex items-center gap-4">
                                {!audioBlob && (
                                    <button type="button" onClick={handleMicClick} className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${isRecording ? 'bg-red-100 text-priority-high animate-pulse' : 'bg-gray-100 text-accent hover:bg-accent hover:text-white'}`}>
                                        {isRecording ? <StopCircle /> : <Mic />}
                                    </button>
                                )}
                                <div className="flex-grow">
                                    {isRecording && <p className="text-sm text-priority-high animate-pulse">Recording audio...</p>}
                                    {audioBlob && !isRecording && (
                                        <div className="flex items-center gap-2">
                                            <audio src={URL.createObjectURL(audioBlob)} controls className="w-full max-w-xs h-10" />
                                            <button type="button" onClick={handleRemoveAudio} className="text-text-secondary-on-light hover:text-priority-high transition-colors">
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
            <div className="pt-6 border-t border-gray-200">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-md flex items-center gap-3 mb-4">
                        <AlertTriangle size={20} />
                        <span>{error}</span>
                    </div>
                )}
                <button onClick={handleSubmit} disabled={loading} className="w-full bg-accent text-white font-bold py-3 px-6 rounded-md hover:bg-accent-dark disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors shadow-md">
                    {loading ? <Loader2 className="animate-spin" /> : 'Submit Report'}
                </button>
            </div>
        </div>
    );
};

export default ComplaintForm;
