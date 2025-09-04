import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import MapView from './MapView.jsx';
import ComplaintList from './ComplaintList.jsx';
import { Shield, BarChart2, CheckCircle, Clock, AlertTriangle, MapPin, List } from 'lucide-react';

// A dedicated skeleton loader for the dashboard for a better UX
const DashboardSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="h-40 bg-primary rounded-lg"></div>
    <div className="h-[600px] bg-primary rounded-lg"></div>
    <div className="h-96 bg-primary rounded-lg"></div>
  </div>
);

const SuperadminDashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
            // A more user-friendly error notification could be implemented here
            console.error('Failed to update status:', err);
            alert('Failed to update status. Please try again.');
        }
    };

    if (loading) return <DashboardSkeleton />;

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-primary border-2 border-dashed border-border rounded-lg">
          <AlertTriangle className="text-priority-high" size={48} />
          <h2 className="mt-4 text-xl font-semibold text-text-primary">Failed to Load Data</h2>
          <p className="text-text-secondary mt-2">{error}</p>
        </div>
      );
    }
    
    // Calculate stats for the header
    const totalComplaints = complaints.length;
    const pendingCount = complaints.filter(c => c.status === 'pending').length;
    const resolvedCount = complaints.filter(c => c.status === 'resolved').length;

    return (
      <div className="space-y-8">
        {/* Dashboard Header */}
        <div className="bg-primary border border-border rounded-lg p-6">
          <div className="flex items-center gap-4">
            <Shield className="w-10 h-10 text-accent" />
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Super Admin Dashboard</h1>
              <p className="text-text-secondary">Global overview of all reported civic issues.</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-border p-4 rounded-md">
              <BarChart2 className="mx-auto text-text-secondary" size={24} />
              <p className="text-2xl font-bold text-text-primary mt-2">{totalComplaints}</p>
              <p className="text-sm text-text-secondary">Total Reports</p>
            </div>
            <div className="bg-border p-4 rounded-md">
              <Clock className="mx-auto text-priority-high" size={24} />
              <p className="text-2xl font-bold text-text-primary mt-2">{pendingCount}</p>
              <p className="text-sm text-text-secondary">Pending</p>
            </div>
            <div className="bg-border p-4 rounded-md">
              <CheckCircle className="mx-auto text-priority-low" size={24} />
              <p className="text-2xl font-bold text-text-primary mt-2">{resolvedCount}</p>
              <p className="text-sm text-text-secondary">Resolved</p>
            </div>
          </div>
        </div>

        {/* Map View Card */}
        <div className="bg-primary border border-border rounded-lg p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
                <MapPin className="text-accent" size={24} />
                <h2 className="text-xl font-semibold text-text-primary">Report Locations</h2>
            </div>
            <div className="h-96 md:h-[500px] w-full rounded-md overflow-hidden">
                <MapView complaints={complaints} />
            </div>
        </div>
        
        {/* Complaint List Card */}
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

export default SuperadminDashboard;

