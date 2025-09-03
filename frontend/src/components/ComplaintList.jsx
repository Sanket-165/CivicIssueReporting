import React, { useState } from 'react';
import { Image as ImageIcon, Mic, X, ChevronRight, Inbox, Clock, CheckCircle, Loader } from 'lucide-react';

// Modal component for showing full complaint details
const ComplaintModal = ({ complaint, onClose }) => {
  if (!complaint) return null;

  return (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-primary border border-border rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-primary/95 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-text-primary">Complaint Details</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="rounded-lg overflow-hidden border border-border">
            <img src={complaint.imageUrl} alt={complaint.title} className="w-full h-auto object-cover" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">{complaint.category}</p>
            <h3 className="text-2xl font-bold text-text-primary mt-1">{complaint.title}</h3>
            <p className="text-text-secondary mt-2">{complaint.description}</p>
          </div>
          {complaint.voiceNoteUrl && (
            <div>
              <h4 className="font-semibold text-text-primary mb-2">Recorded Voice Note</h4>
              <audio src={complaint.voiceNoteUrl} controls className="w-full h-12" />
            </div>
          )}
           <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-border">
            <div>
              <p className="text-text-secondary">Reported By</p>
              <p className="font-semibold text-text-primary">{complaint.reportedBy?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-text-secondary">Reported On</p>
              <p className="font-semibold text-text-primary">{new Date(complaint.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Complaint List Component
const ComplaintList = ({ complaints, onStatusUpdate }) => {
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'resolved':
        return { icon: <CheckCircle size={16} />, color: 'text-priority-low', ring: 'ring-priority-low/30' };
      case 'under consideration':
        return { icon: <Loader size={16} className="animate-spin" />, color: 'text-priority-medium', ring: 'ring-priority-medium/30' };
      case 'pending':
      default:
        return { icon: <Clock size={16} />, color: 'text-priority-high', ring: 'ring-priority-high/30' };
    }
  };
  
  if (complaints.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-primary rounded-lg border-2 border-dashed border-border">
        <Inbox size={48} className="mx-auto text-text-secondary" />
        <h2 className="mt-4 text-xl font-semibold text-text-primary">No Issues Found</h2>
        <p className="text-text-secondary mt-2">There are currently no complaints matching your filter.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Table Header for Desktop */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-sm font-semibold text-text-secondary border-b border-border">
          <div className="col-span-4">Title</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Priority</div>
          <div className="col-span-3">Status</div>
          <div className="col-span-1"></div>
        </div>

        {/* Complaint Items */}
        {complaints.map(c => {
          const statusInfo = getStatusInfo(c.status);
          return (
            <div key={c._id} className="bg-primary border border-border rounded-lg transition-shadow hover:shadow-lg hover:border-accent/50">
              <div className="grid grid-cols-12 gap-4 items-center p-4">
                
                {/* Mobile Title & View Button */}
                <div className="col-span-11 md:col-span-4 block md:hidden">
                    <p className="font-bold text-text-primary">{c.title}</p>
                    <p className="text-sm text-text-secondary">{c.category}</p>
                </div>
                 <button onClick={() => setSelectedComplaint(c)} className="col-span-1 flex justify-end items-center md:hidden text-text-secondary hover:text-accent transition-colors">
                    <ChevronRight size={20} />
                </button>

                {/* Desktop Title */}
                <div className="hidden md:block col-span-4">
                  <p className="font-bold text-text-primary truncate">{c.title}</p>
                </div>

                {/* Category */}
                 <div className="hidden md:block col-span-2">
                  <p className="text-sm text-text-secondary">{c.category}</p>
                </div>
                
                {/* Priority */}
                <div className="col-span-6 md:col-span-2">
                   <p className={`inline-flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-full ring-1 ${statusInfo.ring} ${statusInfo.color}`}>
                     <span className="font-bold">{c.priority}</span>
                   </p>
                </div>

                {/* Status Dropdown */}
                <div className="col-span-6 md:col-span-3">
                   <select 
                    value={c.status} 
                    onChange={(e) => onStatusUpdate(c._id, e.target.value)}
                    className={`w-full bg-background border border-border rounded-md p-2 text-sm font-semibold focus:ring-2 focus:ring-accent focus:outline-none transition-shadow ${statusInfo.color}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="under consideration">Under Consideration</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                {/* Desktop View Button */}
                <button onClick={() => setSelectedComplaint(c)} className="hidden md:flex col-span-1 justify-end items-center text-text-secondary hover:text-accent font-semibold text-sm transition-colors">
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
