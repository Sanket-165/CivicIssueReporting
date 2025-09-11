import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/api';
import MapView from './MapView.jsx';
import ComplaintList from './ComplaintList.jsx';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, MapPin, List, Clock, Search } from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

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
      alert('Failed to update status. Please try again.');
    }
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter(complaint => {
        const statusMatch = selectedStatus === 'all' || complaint.status === selectedStatus;
        const searchTermMatch = searchTerm.trim() === '' || 
            complaint.title.toLowerCase().includes(searchTerm.toLowerCase());
        
        return statusMatch && searchTermMatch;
    });
  }, [complaints, searchTerm, selectedStatus]);

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
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-on-light">
            {`${user?.department || 'Admin'} Department`}
          </h1>
          <p className="text-text-secondary-on-light mt-1">
            Viewing {filteredComplaints.length} of {complaints.length} total reported issue{complaints.length !== 1 && 's'}.
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
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="text-accent" size={24} />
          <h2 className="text-xl font-semibold text-text-on-light">Live Issues Map</h2>
        </div>
        <div className="h-96 md:h-[500px] w-full rounded-md overflow-hidden">
          <MapView complaints={filteredComplaints} />
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-md">
        {/* ✨ UI Restored to match Superadmin layout ✨ */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
                <List className="text-accent" size={24} />
                <h2 className="text-xl font-semibold text-text-on-light">All Complaints</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by complaint title..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:ring-2 focus:ring-accent focus:outline-none"
                    />
                </div>
                <div className="w-full sm:w-48">
                    <select
                        value={selectedStatus}
                        onChange={e => setSelectedStatus(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-accent focus:outline-none"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="under consideration">Under Consideration</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>
            </div>
        </div>
        <ComplaintList
            complaints={filteredComplaints}
            onStatusUpdate={handleStatusUpdate}
            onRefresh={fetchComplaints}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;