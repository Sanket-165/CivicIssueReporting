import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import ComplaintForm from './ComplaintForm.jsx';
import ViewProofModal from './ViewProofModal';
import ViewComplaintModal from './ViewComplaintModal.jsx';
import { useAuth } from '../context/AuthContext';
import { Plus, List, AlertTriangle, CheckCircle, Clock, Loader, Eye, Camera, Star, Send, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react';

const CitizenDashboardSkeleton = () => (
 <div className="animate-pulse space-y-6">
   <div className="h-10 bg-gray-200 rounded-md w-1/2"></div>
   <div className="flex gap-4">
     <div className="h-12 bg-gray-100 rounded-md w-48"></div>
     <div className="h-12 bg-gray-100 rounded-md w-48"></div>
   </div>
   <div className="space-y-4 mt-6">
     <div className="h-24 bg-white shadow-sm rounded-lg w-full"></div>
     <div className="h-24 bg-white shadow-sm rounded-lg w-full"></div>
     <div className="h-24 bg-white shadow-sm rounded-lg w-full"></div>
   </div>
 </div>
);

const StarRating = ({ rating, setRating, disabled = false }) => {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`${disabled ? '' : 'cursor-pointer'} transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill={rating >= star ? 'currentColor' : 'none'}
                    onClick={() => !disabled && setRating(star)}
                />
            ))}
        </div>
    );
};

const FeedbackComponent = ({ complaint, onRefresh }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleFinalSubmit = async (wantsToReopen) => {
        if (rating === 0) {
            alert("Please provide a star rating before submitting.");
            return;
        }
        setLoading(true);
        try {
            await api.post(`/complaints/${complaint._id}/feedback`, { rating, comment, wantsToReopen });
            setIsSubmitted(true);
            setTimeout(onRefresh, 1500);
        } catch (err) {
            alert('Failed to process feedback.');
            setLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                <p className="font-semibold text-green-800">Thank you for your feedback!</p>
            </div>
        );
    }
    
    return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border space-y-3">
            <h4 className="font-semibold text-text-on-light">How would you rate the resolution?</h4>
            <StarRating rating={rating} setRating={setRating} />
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add an optional comment..."
                rows="2"
                className="w-full bg-white border border-gray-300 rounded-md p-2 text-sm"
            />
            {rating > 0 && (
                <div className="pt-3 border-t">
                    <p className="font-semibold text-sm mb-2">Are you satisfied with this resolution?</p>
                    <div className="flex flex-wrap gap-4">
                        <button disabled={loading} onClick={() => handleFinalSubmit(false)} className="flex items-center gap-2 text-sm font-semibold bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400">
                            {loading ? <Loader size={16} className="animate-spin" /> : <ThumbsUp size={16} />}
                             Yes, Close This Issue
                        </button>
                        <button disabled={loading} onClick={() => handleFinalSubmit(true)} className="flex items-center gap-2 text-sm font-semibold bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400">
                            {loading ? <Loader size={16} className="animate-spin" /> : <ThumbsDown size={16} />}
                             No, Reopen for Review
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


const ComplaintCard = ({ complaint, onViewProof, onComplaintImage, onRefresh }) => {
    const getStatusInfo = (status) => {
        switch (status) {
            case 'resolved': return { icon: <CheckCircle className="text-green-600" />, color: 'text-green-600' };
            case 'under consideration': return { icon: <Loader className="text-orange-500 animate-spin" />, color: 'text-orange-500' };
            case 'reopened': return { icon: <RefreshCw className="text-yellow-500" />, color: 'text-yellow-500' };
            case 'reassigned': return { icon: <RefreshCw className="text-yellow-600" />, color: 'text-yellow-600' };
            case 'closed': return { icon: <CheckCircle className="text-gray-500" />, color: 'text-gray-500' };
            case 'pending': default: return { icon: <Clock className="text-red-500" />, color: 'text-red-500' };
        }
    };
    const statusInfo = getStatusInfo(complaint.status);

    const latestFeedback = complaint.feedbackHistory?.length > 0 ? complaint.feedbackHistory[complaint.feedbackHistory.length - 1] : null;

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row gap-4 hover:border-accent transition-all duration-300 shadow-sm hover:shadow-lg">
            <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden hidden sm:block">
                <img src={complaint.imageUrl} alt={complaint.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-text-secondary-on-light">{complaint.category}</p>
                        <h3 className="font-bold text-lg text-text-on-light">{complaint.title}</h3>
                    </div>
                    <div className={`flex items-center gap-2 text-sm font-medium ${statusInfo.color}`}>
                        {statusInfo.icon}
                        <span className="capitalize">{complaint.status}</span>
                    </div>
                </div>
                <p className="text-text-secondary-on-light text-sm mt-2">{complaint.description.substring(0, 120)}...</p>
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-4">
                    <button onClick={() => onComplaintImage(complaint.imageUrl)} className="inline-flex sm:hidden items-center gap-2 text-sm font-semibold text-accent hover:text-accent-dark transition-colors">
                        <Camera size={16} /> View Complaint Image
                    </button>
                    {latestFeedback?.proofUrl && (
                        <button onClick={() => onViewProof(latestFeedback.proofUrl)} className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-dark transition-colors">
                            <Eye size={16} /> View Latest Proof
                        </button>
                    )}
                </div>

                {complaint.status === 'resolved' && !complaint.isFinal && (
                    <FeedbackComponent complaint={complaint} onRefresh={onRefresh} />
                )}

                {complaint.status === 'resolved' && complaint.isFinal && (
                    <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-lg border border-red-200 text-sm">
                        <p className="font-bold">A superadmin has reviewed and rejected your reconsideration request. This issue is now permanently closed.</p>
                    </div>
                )}
                 {complaint.status === 'closed' && (
                    <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-lg border border-green-200 text-sm">
                        <p className="font-bold">You have marked this issue as satisfactorily resolved. Thank you for your feedback!</p>
                    </div>
                )}
            </div>
            <div className="border-t sm:border-t-0 sm:border-l border-gray-200 mt-4 sm:mt-0 sm:ml-4 pt-4 sm:pt-0 sm:pl-4 flex-shrink-0 text-center">
                <p className="text-xs text-text-secondary-on-light">Reported On</p>
                <p className="font-semibold text-text-on-light">{new Date(complaint.createdAt).toLocaleDateString()}</p>
            </div>
        </div>
    );
};

const CitizenDashboard = () => {
    const [view, setView] = useState('list');
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewingProof, setViewingProof] = useState(null);
    const [viewingComplaint, setViewingComplaint] = useState(null);
    const { user } = useAuth();

    const fetchComplaints = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/complaints/mycomplaints');
            setComplaints(data);
        } catch (err) {
            setError('Failed to fetch your reported issues.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (view === 'list') {
            fetchComplaints();
        }
    }, [view, fetchComplaints]);

    const handleComplaintSubmitted = () => {
        fetchComplaints();
        setView('list');
    };

    if (loading) return <CitizenDashboardSkeleton />;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-text-on-light">Welcome, {user?.name}!</h1>
                <p className="text-text-secondary-on-light mt-1">Here you can manage your reported issues and submit new ones.</p>
            </div>
            <div className="flex gap-2 border-b border-gray-200 pb-2">
                <button onClick={() => setView('list')} className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-300 text-sm font-semibold ${view === 'list' ? 'bg-accent text-white' : 'text-text-secondary-on-light hover:bg-gray-100'}`}>
                    <List size={16} /> My Reports
                </button>
                <button onClick={() => setView('form')} className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-300 text-sm font-semibold ${view === 'form' ? 'bg-accent text-white' : 'text-text-secondary-on-light hover:bg-gray-100'}`}>
                    <Plus size={16} /> Report New Issue
                </button>
            </div>
            <div>
                {view === 'form' && <ComplaintForm onComplaintSubmitted={handleComplaintSubmitted} />}
                {view === 'list' && (
                    error ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg flex items-center gap-4">
                            <AlertTriangle size={32} />
                            <div><h2 className="font-bold">Error</h2><p>{error}</p></div>
                        </div>
                    ) : complaints.length > 0 ? (
                        <div className="space-y-4">
                            {complaints.map(c => 
                                <ComplaintCard 
                                    key={c._id} 
                                    complaint={c} 
                                    onViewProof={setViewingProof} 
                                    onComplaintImage={setViewingComplaint} 
                                    onRefresh={fetchComplaints}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-16 px-6 bg-white rounded-lg border-2 border-dashed border-gray-200">
                            <h2 className="text-xl font-semibold text-text-on-light">No Issues Reported Yet</h2>
                            <p className="text-text-secondary-on-light mt-2 mb-4">Click "Report New Issue" to get started.</p>
                            <button onClick={() => setView('form')} className="bg-accent text-white font-semibold px-6 py-2 rounded-md hover:bg-accent-dark transition-colors duration-300">
                                Submit Your First Report
                            </button>
                        </div>
                    )
                )}
            </div>
            <ViewProofModal imageUrl={viewingProof} onClose={() => setViewingProof(null)} />
            <ViewComplaintModal imageUrl={viewingComplaint} onClose={() => setViewingComplaint(null)} />
        </div>
    );
};

export default CitizenDashboard;