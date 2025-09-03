import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import MapView from './MapView.jsx';
import ComplaintList from './ComplaintList.jsx';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, MapPin, List } from 'lucide-react'; // Icons for clarity

// A Skeleton Loader for a better UX while data is fetching
const DashboardSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-border rounded-md w-1/3 mb-2"></div>
    <div className="h-6 bg-border rounded-md w-1/2 mb-8"></div>
    <div className="h-96 bg-primary rounded-lg w-full mb-8"></div>
    <div className="h-96 bg-primary rounded-lg w-full"></div>
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
      <div className="bg-primary border border-priority-high/30 text-priority-high p-6 rounded-lg flex flex-col items-center justify-center h-64 text-center">
        <AlertTriangle size={48} className="mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error Fetching Data</h2>
        <p className="text-text-secondary">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            {user?.role === 'superadmin' ? 'Super Admin Dashboard' : `${user?.department} Department`}
          </h1>
          <p className="text-text-secondary mt-1">
            Viewing {complaints.length} total reported issue{complaints.length !== 1 && 's'}.
          </p>
        </div>
        <div className="bg-primary border border-border p-4 rounded-lg text-center">
          <p className="text-3xl font-bold text-accent">
            {complaints.filter(c => c.status === 'pending').length}
          </p>
          <p className="text-sm text-text-secondary">Pending Issues</p>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-primary border border-border rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="text-accent" size={24} />
          <h2 className="text-xl font-semibold text-text-primary">Live Issues Map</h2>
        </div>
        <div className="h-96 md:h-[500px] w-full rounded-md overflow-hidden">
          <MapView complaints={complaints} />
        </div>
      </div>

      {/* Complaint List Section */}
      <div className="bg-primary border border-border rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <List className="text-accent" size={24} />
          <h2 className="text-xl font-semibold text-text-primary">All Complaints</h2>
        </div>
        <ComplaintList complaints={complaints} onStatusUpdate={handleStatusUpdate} />
      </div>
    </div>
  );
};

export default AdminDashboard;
