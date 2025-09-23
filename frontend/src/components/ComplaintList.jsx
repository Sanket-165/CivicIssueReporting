import React, { useState } from 'react';
import api from '../api/api';
import ProofUploadModal from './ProofUploadModal';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Check, CheckCircle, ChevronRight, Clock, Inbox, Loader, MapPin, X, RefreshCw, Star, ThumbsUp, ThumbsDown } from 'lucide-react';

const getStatusInfo = (status) => {
    switch (status) {
      case 'resolved': return { icon: <CheckCircle size={16} />, color: 'text-green-600', text: 'Resolved' };
      case 'under consideration': return { icon: <Loader size={16} className="animate-spin" />, color: 'text-orange-500', text: 'In Progress' };
      case 'reopened': return { icon: <RefreshCw size={16} />, color: 'text-yellow-500', text: 'Reopened' };
      case 'reassigned': return { icon: <RefreshCw size={16} />, color: 'text-yellow-600', text: 'Reassigned' };
      case 'closed': return { icon: <CheckCircle size={16} />, color: 'text-gray-500', text: 'Closed' };
      case 'pending': default: return { icon: <Clock size={16} />, color: 'text-red-500', text: 'Pending' };
    }
};

const getPriorityInfo = (priority) => {
    switch(priority) {
        case 'High': return 'text-priority-high';
        case 'Medium': return 'text-priority-medium';
        case 'Low': return 'text-priority-low';
        default: return 'text-text-secondary-on-light';
    }
};

const StarRatingDisplay = ({ rating }) => (
    <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (<Star key={star} className={`transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`} fill={rating >= star ? 'currentColor' : 'none'}/>))}
    </div>
);

const ComplaintModal = ({ complaint, onClose, onRefresh, onStatusUpdate }) => {
    const { user } = useAuth();
    const [proofModalComplaint, setProofModalComplaint] = useState(null);

    if (!complaint) return null;
    
    const statusInfo = getStatusInfo(complaint.status);
    const priorityColor = getPriorityInfo(complaint.priority);
    const latestFeedback = complaint.feedbackHistory?.length > 0 ? complaint.feedbackHistory[complaint.feedbackHistory.length - 1] : null;

    const handleForward = async () => {
        if (window.confirm('Are you sure you want to accept and forward this issue back to the department?')) {
            try {
                await api.put(`/complaints/${complaint._id}/forward`);
                onRefresh();
                onClose();
            } catch (err) {
                alert('Failed to forward issue.');
            }
        }
    };
    const handleReject = async () => {
        if (window.confirm('Are you sure you want to reject this reconsideration request? The issue will be permanently closed.')) {
            try {
                await api.put(`/complaints/${complaint._id}/reject`);
                onRefresh();
                onClose();
            } catch (err) {
                alert('Failed to reject issue.');
            }
        }
    };

    const handleReassignedStatusChange = (newStatus) => {
        if (newStatus === 'resolved') {
            setProofModalComplaint(complaint);
            onClose();
        } else {
            onStatusUpdate(complaint._id, newStatus);
            onClose();
        }
    };

    const handleProofSubmit = async (complaintId, proofFile) => {
        const formData = new FormData();
        formData.append('complaintId', complaintId);
        formData.append('proof', proofFile);
        await api.post('/complaints/sendProof', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        onRefresh();
    };

    const renderFooter = () => {
        if (complaint.status === 'reopened' && user?.role === 'superadmin') {
            return (
                <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 rounded-b-lg border-t">
                    <button onClick={handleReject} className="flex items-center gap-2 bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700"><ThumbsDown size={16}/> Reject Request</button>
                    <button onClick={handleForward} className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700"><ThumbsUp size={16}/> Accept & Forward</button>
                </div>
            );
        }
        if (complaint.status === 'reassigned') {
            return (
                <div className="bg-gray-50 px-6 py-3 flex items-center justify-between rounded-b-lg border-t">
                    <p className="text-sm font-semibold text-gray-600">This issue requires your immediate attention.</p>
                    <select onChange={(e) => handleReassignedStatusChange(e.target.value)} defaultValue={complaint.status} className="bg-white border border-gray-300 rounded-md p-2 text-sm font-semibold focus:ring-accent focus:border-accent">
                        <option value="reassigned" disabled>Reassigned</option>
                        <option value="under consideration">Set to In Progress</option>
                        <option value="resolved">Mark as Resolved</option>
                    </select>
                </div>
            );
        }
        return null;
    };

    const renderReopenedContent = () => (
        <>
            <div className="p-6 bg-yellow-50 border-b border-yellow-200">
                <h4 className="font-bold text-lg text-yellow-800">Citizen Feedback</h4>
                <div className="flex items-center gap-4 mt-2">
                    <StarRatingDisplay rating={latestFeedback?.rating || 0} />
                    {latestFeedback?.comment && (
                        <p className="text-sm italic text-gray-700">"{latestFeedback.comment}"</p>
                    )}
                </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-semibold text-text-on-light mb-2">Original Complaint Image</h4>
                    <img src={complaint.imageUrl} alt="Original complaint" className="w-full h-auto object-cover rounded-md border" />
                </div>
                <div>
                    <h4 className="font-semibold text-text-on-light mb-2">Disputed Resolution Proof</h4>
                    {latestFeedback?.proofUrl ? (
                         <img src={latestFeedback.proofUrl} alt="Resolution proof" className="w-full h-auto object-cover rounded-md border" />
                    ) : <p className="text-sm text-gray-500">No proof was provided for this resolution attempt.</p> }
                </div>
            </div>
        </>
    );

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                      <h2 className="text-xl font-bold text-text-on-light">
                          {complaint.status === 'reopened' ? 'Reconsideration Request' : complaint.status === 'reassigned' ? 'Reassigned Complaint' : 'Complaint Details'}
                      </h2>
                      <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors"><X size={24} /></button>
                    </div>
                    
                    <div className="overflow-y-auto">
                        { (complaint.status === 'reopened' || complaint.status === 'reassigned') ? renderReopenedContent() : (
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
                                {latestFeedback?.proofUrl && (
                                    <div className="pt-4 border-t border-gray-200">
                                        <h4 className="font-semibold text-text-on-light mb-2">Latest Resolution Proof</h4>
                                        <div className="rounded-lg overflow-hidden border border-gray-200">
                                            <img src={latestFeedback.proofUrl} alt="Resolution proof" className="w-full h-auto object-cover" />
                                        </div>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm pt-4 border-t border-gray-200">
                                    <div><p className="text-text-secondary-on-light">Priority</p><p className={`font-bold text-base ${priorityColor}`}>{complaint.priority}</p></div>
                                    <div><p className="text-text-secondary-on-light">Status</p><div className={`flex items-center gap-2 font-semibold text-base ${statusInfo.color}`}>{statusInfo.icon}<span className="capitalize">{complaint.status}</span></div></div>
                                    <div><p className="text-text-secondary-on-light">Coordinates</p><p className="font-semibold text-base text-text-on-light">{complaint.location.coordinates[1].toFixed(4)}, {complaint.location.coordinates[0].toFixed(4)}</p></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-gray-200">
                                    <div><p className="text-text-secondary-on-light">Reported By</p><p className="font-semibold text-text-on-light">{complaint.reportedBy?.name || 'N/A'}</p></div>
                                    <div><p className="text-text-secondary-on-light">Reported On</p><p className="font-semibold text-text-on-light">{new Date(complaint.createdAt).toLocaleString()}</p></div>
                                </div>
                            </div>
                        )}
                    </div>
                    {renderFooter()}
                </div>
            </div>
             {proofModalComplaint && (
                <ProofUploadModal
                    complaint={proofModalComplaint}
                    onClose={() => setProofModalComplaint(null)}
                    onProofSubmit={handleProofSubmit}
                />
            )}
        </>
    );
};

const ComplaintList = ({ complaints, onStatusUpdate, onRefresh, controls }) => {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [proofModalComplaint, setProofModalComplaint] = useState(null);

  const handleStatusChange = (complaint, newStatus) => {
    if (newStatus === 'resolved') {
      setProofModalComplaint(complaint);
    } else {
      onStatusUpdate(complaint._id, newStatus);
    }
  };

  const handleProofSubmit = async (complaintId, proofFile) => {
    const formData = new FormData();
    formData.append('complaintId', complaintId);
    formData.append('proof', proofFile);
    
    await api.post('/complaints/sendProof', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    onRefresh();
  };
  
  if (!complaints) {
    return null;
  }

  if (complaints.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-white rounded-lg border-2 border-dashed border-gray-200">
        <Inbox size={48} className="mx-auto text-gray-400" />
        <h2 className="mt-4 text-xl font-semibold text-text-on-light">No Issues Found</h2>
        <p className="text-text-secondary-on-light mt-2">There are currently no complaints in this queue.</p>
      </div>
    );
  }

  return (
    <>
      {controls && <div className="mb-6">{controls}</div>}
      <div className="space-y-4">
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-sm font-semibold text-text-secondary-on-light border-b border-gray-200">
          <div className="col-span-4">Title</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Priority</div>
          <div className="col-span-3">Status</div>
          <div className="col-span-1"></div>
        </div>
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
                    onChange={(e) => handleStatusChange(c, e.target.value)}
                    disabled={['reopened', 'reassigned', 'closed'].includes(c.status)}
                    className={`w-full bg-gray-50 border border-gray-300 rounded-md p-2 text-sm font-semibold focus:ring-2 focus:ring-accent focus:outline-none transition-shadow shadow-sm ${statusInfo.color} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <option value="pending">Pending</option>
                    <option value="under consideration">In Progress</option>
                    <option value="resolved">Resolved</option>
                    {c.status === 'reopened' && <option value="reopened">Reopened</option>}
                    {c.status === 'reassigned' && <option value="reassigned">Reassigned</option>}
                    {c.status === 'closed' && <option value="closed">Closed</option>}
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
      <ComplaintModal complaint={selectedComplaint} onClose={() => setSelectedComplaint(null)} onRefresh={onRefresh} onStatusUpdate={onStatusUpdate} />
      {proofModalComplaint && (
        <ProofUploadModal
          complaint={proofModalComplaint}
          onClose={() => setProofModalComplaint(null)}
          onProofSubmit={handleProofSubmit}
        />
      )}
    </>
  );
};

export default ComplaintList;