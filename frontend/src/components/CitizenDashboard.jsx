import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import ComplaintForm from './ComplaintForm.jsx';
import { useAuth } from '../context/AuthContext';
import { Plus, List, AlertTriangle, CheckCircle, Clock, Loader } from 'lucide-react'; // Modern icons

// Skeleton loader for a better UX
const CitizenDashboardSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-10 bg-border rounded-md w-1/2"></div>
    <div className="flex gap-4">
      <div className="h-12 bg-primary rounded-md w-48"></div>
      <div className="h-12 bg-border rounded-md w-48"></div>
    </div>
    <div className="space-y-4 mt-6">
      <div className="h-24 bg-primary rounded-lg w-full"></div>
      <div className="h-24 bg-primary rounded-lg w-full"></div>
      <div className="h-24 bg-primary rounded-lg w-full"></div>
    </div>
  </div>
);

// A reusable component for displaying each complaint card
const ComplaintCard = ({ complaint }) => {
  const getStatusInfo = (status) => {
    switch (status) {
      case 'resolved':
        return { icon: <CheckCircle className="text-priority-low" />, color: 'priority-low' };
      case 'under consideration':
        return { icon: <Loader className="text-priority-medium animate-spin" />, color: 'priority-medium' };
      case 'pending':
      default:
        return { icon: <Clock className="text-priority-high" />, color: 'priority-high' };
    }
  };

  const statusInfo = getStatusInfo(complaint.status);

  return (
    <div className="bg-primary border border-border rounded-lg p-4 flex flex-col sm:flex-row gap-4 hover:border-accent transition-colors duration-300">
      <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden hidden sm:block">
        <img src={complaint.imageUrl} alt={complaint.title} className="w-full h-full object-cover" />
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-text-secondary">{complaint.category}</p>
            <h3 className="font-bold text-lg text-text-primary">{complaint.title}</h3>
          </div>
          <div className={`flex items-center gap-2 text-sm font-medium text-${statusInfo.color}`}>
            {statusInfo.icon}
            <span className="capitalize">{complaint.status}</span>
          </div>
        </div>
        <p className="text-text-secondary text-sm mt-2">{complaint.description.substring(0, 120)}...</p>
      </div>
       <div className="border-t sm:border-t-0 sm:border-l border-border mt-4 sm:mt-0 sm:ml-4 pt-4 sm:pt-0 sm:pl-4 flex-shrink-0 text-center">
          <p className="text-xs text-text-secondary">Reported On</p>
          <p className="font-semibold text-text-primary">{new Date(complaint.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
};


const CitizenDashboard = () => {
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
    fetchComplaints();
  }, [fetchComplaints]);

  const handleComplaintSubmitted = () => {
    fetchComplaints();
    setView('list'); // Switch back to the list view after submission
  };

  if (loading) return <CitizenDashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Welcome, {user?.name}!</h1>
        <p className="text-text-secondary mt-1">Here you can manage your reported issues and submit new ones.</p>
      </div>

      {/* View Toggle Buttons */}
      <div className="flex gap-4 border-b border-border pb-2">
        <button
          onClick={() => setView('list')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-300 ${view === 'list' ? 'bg-accent text-background' : 'text-text-secondary hover:bg-primary'}`}
        >
          <List size={20} /> My Reports
        </button>
        <button
          onClick={() => setView('form')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-300 ${view === 'form' ? 'bg-accent text-background' : 'text-text-secondary hover:bg-primary'}`}
        >
          <Plus size={20} /> Report New Issue
        </button>
      </div>

      {/* Conditional Content */}
      <div>
        {view === 'form' && <ComplaintForm onComplaintSubmitted={handleComplaintSubmitted} />}
        
        {view === 'list' && (
          error ? (
            <div className="bg-primary border border-priority-high/30 text-priority-high p-6 rounded-lg flex items-center gap-4">
              <AlertTriangle size={32} />
              <div>
                <h2 className="font-bold">Error</h2>
                <p>{error}</p>
              </div>
            </div>
          ) : complaints.length > 0 ? (
            <div className="space-y-4">
              {complaints.map(c => <ComplaintCard key={c._id} complaint={c} />)}
            </div>
          ) : (
            <div className="text-center py-16 px-6 bg-primary rounded-lg border-2 border-dashed border-border">
              <h2 className="text-xl font-semibold text-text-primary">No Issues Reported Yet</h2>
              <p className="text-text-secondary mt-2 mb-4">Click "Report New Issue" to get started.</p>
              <button
                onClick={() => setView('form')}
                className="bg-accent text-background font-semibold px-6 py-2 rounded-md hover:bg-accent-dark transition-colors duration-300"
              >
                Submit Your First Report
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;
