import React, { useState } from 'react';
import { AlertTriangle, Check, CheckCircle, ChevronRight, Clock, Inbox, Loader, MapPin, X } from 'lucide-react';

// Helper function to calculate distance between two lat/lng points (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // in metres
}

// Helper function to get status-specific styling and icons
const getStatusInfo = (status) => {
    switch (status) {
      case 'resolved':
        return { icon: <CheckCircle size={16} />, color: 'text-priority-low', text: 'Resolved' };
      case 'under consideration':
        return { icon: <Loader size={16} className="animate-spin" />, color: 'text-priority-medium', text: 'In Progress' };
      case 'pending':
      default:
        return { icon: <Clock size={16} />, color: 'text-priority-high', text: 'Pending' };
    }
};

// Helper function to get priority-specific styling
const getPriorityInfo = (priority) => {
    switch(priority) {
        case 'High': return 'text-priority-high';
        case 'Medium': return 'text-priority-medium';
        case 'Low': return 'text-priority-low';
        default: return 'text-text-secondary-on-light';
    }
}

// Modal component for showing full complaint details - Light Theme
const ComplaintModal = ({ complaint, onClose }) => {
  if (!complaint) return null;

  const statusInfo = getStatusInfo(complaint.status);
  const priorityColor = getPriorityInfo(complaint.priority);
  
  let distance = null;
  if (complaint.geotag && complaint.geotag.latitude && complaint.location) {
      distance = calculateDistance(
          complaint.location.coordinates[1],
          complaint.location.coordinates[0],
          complaint.geotag.latitude,
          complaint.geotag.longitude
      );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-text-on-light">Complaint Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="rounded-lg overflow-hidden border border-gray-200">
            <img src={complaint.imageUrl} alt={complaint.title} className="w-full h-auto object-cover" />
          </div>
          <div>
            <p className="text-sm text-text-secondary-on-light">{complaint.category}</p>
            <h3 className="text-2xl font-bold text-text-on-light mt-1">{complaint.title}</h3>
            {complaint.locationName && (
                <p className="text-sm text-text-secondary-on-light mt-2 flex items-center gap-2">
                    <MapPin size={14} /> {complaint.locationName}
                </p>
            )}
            <p className="text-text-secondary-on-light mt-4">{complaint.description}</p>
          </div>
          {complaint.voiceNoteUrl && (
            <div>
              <h4 className="font-semibold text-text-on-light mb-2">Recorded Voice Note</h4>
              <audio src={complaint.voiceNoteUrl} controls className="w-full h-12" />
            </div>
          )}

          {/* --- NEW GEOTAG VERIFICATION SECTION --- */}
          <div className="pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-text-on-light mb-3 flex items-center gap-2">
                <MapPin size={16} /> Location Verification
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-100 p-3 rounded-md">
                      <p className="text-text-secondary-on-light">User's Live Location</p>
                      <p className="font-mono text-text-on-light text-xs mt-1">
                          {complaint.location.coordinates[1].toFixed(5)}, {complaint.location.coordinates[0].toFixed(5)}
                      </p>
                  </div>
                   <div className="bg-gray-100 p-3 rounded-md">
                      <p className="text-text-secondary-on-light">Photo's Geotag Location</p>
                      {complaint.geotag && complaint.geotag.latitude ? (
                         <p className="font-mono text-text-on-light text-xs mt-1">
                             {complaint.geotag.latitude.toFixed(5)}, {complaint.geotag.longitude.toFixed(5)}
                         </p>
                      ) : (
                         <p className="font-mono text-text-secondary-on-light text-xs mt-1">No GPS data in photo</p>
                      )}
                  </div>
              </div>
              <div className="mt-3">
                  {distance !== null && distance < 100 ? ( // 100 meters threshold
                      <div className="inline-flex items-center gap-2 text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs font-semibold">
                          <Check size={14} /> Verified (Distance: {distance.toFixed(1)}m)
                      </div>
                  ) : distance !== null ? (
                      <div className="inline-flex items-center gap-2 text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full text-xs font-semibold">
                          <AlertTriangle size={14} /> Mismatch (Distance: {distance.toFixed(1)}m)
                      </div>
                  ) : (
                      <div className="inline-flex items-center gap-2 text-gray-700 bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold">
                          <AlertTriangle size={14} /> Unverifiable
                      </div>
                  )}
              </div>
            </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm pt-4 border-t border-gray-200">
            <div>
              <p className="text-text-secondary-on-light">Priority</p>
              <p className={`font-bold text-base ${priorityColor}`}>{complaint.priority}</p>
            </div>
            <div>
              <p className="text-text-secondary-on-light">Status</p>
              <div className={`flex items-center gap-2 font-semibold text-base ${statusInfo.color}`}>
                {statusInfo.icon}
                <span className="capitalize">{complaint.status}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-gray-200">
            <div>
              <p className="text-text-secondary-on-light">Reported By</p>
              <p className="font-semibold text-text-on-light">{complaint.reportedBy?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-text-secondary-on-light">Reported On</p>
              <p className="font-semibold text-text-on-light">{new Date(complaint.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Complaint List Component - Light Theme
const ComplaintList = ({ complaints, onStatusUpdate, controls }) => {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  
  if (!complaints) {
      return (
          <div className="text-center py-16 px-6 bg-white rounded-lg border-2 border-dashed border-gray-200">
              <Loader size={48} className="mx-auto text-gray-400 animate-spin" />
              <h2 className="mt-4 text-xl font-semibold text-text-on-light">Loading Complaints...</h2>
          </div>
      );
  }

  if (complaints.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-white rounded-lg border-2 border-dashed border-gray-200">
        <Inbox size={48} className="mx-auto text-gray-400" />
        <h2 className="mt-4 text-xl font-semibold text-text-on-light">No Issues Found</h2>
        <p className="text-text-secondary-on-light mt-2">There are currently no complaints matching your filter.</p>
      </div>
    );
  }

  return (
    <>
        {controls && <div className="mb-6">{controls}</div>}

        <div className="space-y-4">
            {/* Table Header for Desktop */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-sm font-semibold text-text-secondary-on-light border-b border-gray-200">
              <div className="col-span-4">Title</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Priority</div>
              <div className="col-span-3">Status</div>
              <div className="col-span-1"></div>
            </div>

            {/* Complaint Items */}
            {complaints.map(c => {
              const statusInfo = getStatusInfo(c.status);
              const priorityColor = getPriorityInfo(c.priority);
              return (
                <div key={c._id} className="bg-white border border-gray-200 rounded-lg transition-shadow hover:shadow-lg hover:border-accent shadow-sm">
                  <div className="grid grid-cols-12 gap-4 items-center p-4">
                    
                    <div className="col-span-11 md:col-span-4 block md:hidden">
                        <p className="font-bold text-text-on-light">{c.title}</p>
                        <p className="text-sm text-text-secondary-on-light">{c.category}</p>
                    </div>
                     <button onClick={() => setSelectedComplaint(c)} className="col-span-1 flex justify-end items-center md:hidden text-text-secondary-on-light hover:text-accent transition-colors">
                        <ChevronRight size={20} />
                    </button>

                    <div className="hidden md:block col-span-4">
                      <p className="font-bold text-text-on-light truncate">{c.title}</p>
                    </div>

                     <div className="hidden md:block col-span-2">
                      <p className="text-sm text-text-secondary-on-light">{c.category}</p>
                    </div>
                    
                    <div className="col-span-6 md:col-span-2">
                       <p className={`inline-flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-full ring-1 ring-gray-200 ${priorityColor}`}>
                         <span className="font-bold">{c.priority}</span>
                       </p>
                    </div>

                    <div className="col-span-6 md:col-span-3">
                       <select 
                        value={c.status} 
                        onChange={(e) => onStatusUpdate(c._id, e.target.value)}
                        className={`w-full bg-gray-50 border border-gray-300 rounded-md p-2 text-sm font-semibold focus:ring-2 focus:ring-accent focus:outline-none transition-shadow shadow-sm ${statusInfo.color}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="under consideration">Under Consideration</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>

                    <button onClick={() => setSelectedComplaint(c)} className="hidden md:flex col-span-1 justify-end items-center text-text-secondary-on-light hover:text-accent font-semibold text-sm transition-colors">
                      View <ChevronRight size={16} className="ml-1" />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      <ComplaintModal complaint={selectedComplaint} onClose={() => setSelectedComplaint(null)} />
    </>
  );
};

export default ComplaintList;

