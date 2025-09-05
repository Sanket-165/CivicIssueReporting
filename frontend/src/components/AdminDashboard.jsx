import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import MapView from './MapView.jsx';
import ComplaintList from './ComplaintList.jsx';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, MapPin, List, Clock } from 'lucide-react'; // Icons for clarity

// A Skeleton Loader for a better UX while data is fetching, adapted for a light theme
const DashboardSkeleton = () => (
  <div className="animate-pulse space-y-8">
    <div className="h-24 bg-white rounded-lg shadow-sm"></div>
    <div className="h-[600px] bg-white rounded-lg shadow-sm"></div>
    <div className="h-96 bg-white rounded-lg shadow-sm"></div>
  </div>
);

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/complaints');
      setComplaints(data);
    } catch (err) {
      setError('Failed to fetch complaints from the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleStatusUpdate = async (id, status) => {
    try {
      const { data } = await api.put(`/complaints/${id}/status`, { status });
      setComplaints(complaints.map(c => c._id === id ? data : c));
    } catch (err) {
      // In a real app, you'd use a Snackbar for this, but alert is fine for now.
      alert('Failed to update status. Please try again.');
    }
  };

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg flex flex-col items-center justify-center h-64 text-center">
        <AlertTriangle size={48} className="mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error Fetching Data</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-on-light">
            {`${user?.department} Department`}
          </h1>
          <p className="text-text-secondary-on-light mt-1">
            Viewing {complaints.length} total reported issue{complaints.length !== 1 && 's'}.
          </p>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-lg text-center shadow-sm flex items-center gap-4">
          <Clock className="text-accent" size={32} />
          <div>
            <p className="text-3xl font-bold text-accent">
              {complaints.filter(c => c.status === 'pending').length}
            </p>
            <p className="text-sm text-text-secondary-on-light">Pending Issues</p>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="text-accent" size={24} />
          <h2 className="text-xl font-semibold text-text-on-light">Live Issues Map</h2>
        </div>
        <div className="h-96 md:h-[500px] w-full rounded-md overflow-hidden">
          <MapView complaints={complaints} />
        </div>
      </div>

      {/* Complaint List Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <List className="text-accent" size={24} />
          <h2 className="text-xl font-semibold text-text-on-light">All Complaints</h2>
        </div>
        <ComplaintList complaints={complaints} onStatusUpdate={handleStatusUpdate} />
      </div>
    </div>
  );
};

export default AdminDashboard;