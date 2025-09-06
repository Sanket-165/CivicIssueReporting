import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/api';
import MapView from './MapView.jsx';
import ComplaintList from './ComplaintList.jsx';
import { Shield, BarChart2, CheckCircle, Clock, AlertTriangle, MapPin, List, Loader, PieChart as PieChartIcon, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

// A dedicated skeleton loader for the dashboard, adapted for a light theme
const DashboardSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="h-44 bg-white shadow-sm rounded-lg"></div>
    <div className="h-96 bg-white shadow-sm rounded-lg"></div>
    <div className="h-[600px] bg-white shadow-sm rounded-lg"></div>
    <div className="h-96 bg-white shadow-sm rounded-lg"></div>
  </div>
);

const SuperadminDashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all'); // ✨ NEW: State for the status filter

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
            console.error('Failed to update status:', err);
            alert('Failed to update status. Please try again.');
        }
    };

    const filteredComplaints = useMemo(() => {
        return complaints.filter(complaint => {
            const categoryMatch = selectedCategory === 'all' || complaint.category === selectedCategory;
            const statusMatch = selectedStatus === 'all' || complaint.status === selectedStatus; // ✨ NEW: Status filter logic
            const searchTermMatch = searchTerm.trim() === '' || 
                complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (complaint.reportedBy?.name && complaint.reportedBy.name.toLowerCase().includes(searchTerm.toLowerCase()));
            
            return categoryMatch && searchTermMatch && statusMatch; // ✨ MODIFIED: Combined all filters
        });
    }, [complaints, searchTerm, selectedCategory, selectedStatus]); // ✨ MODIFIED: Added dependency

    const complaintCategories = useMemo(() => {
        const categories = new Set(complaints.map(c => c.category));
        return ['all', ...Array.from(categories)];
    }, [complaints]);

    if (loading) return <DashboardSkeleton />;

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-red-50 border-2 border-dashed border-red-200 rounded-lg">
          <AlertTriangle className="text-priority-high" size={48} />
          <h2 className="mt-4 text-xl font-semibold text-red-800">Failed to Load Data</h2>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>
      );
    }
    
    // --- Data Processing for Analytics ---
    const totalComplaints = complaints.length;
    const pendingCount = complaints.filter(c => c.status === 'pending').length;
    const underConsiderationCount = complaints.filter(c => c.status === 'under consideration').length;
    const resolvedCount = complaints.filter(c => c.status === 'resolved').length;

    const departmentData = complaints.reduce((acc, complaint) => {
        const dept = complaint.category;
        if (!acc[dept]) {
            acc[dept] = { pending: 0, 'under consideration': 0, resolved: 0 };
        }
        acc[dept][complaint.status]++;
        return acc;
    }, {});
    const barChartData = Object.keys(departmentData).map(dept => ({
        name: dept.split(' ')[0],
        fullName: dept,
        Pending: departmentData[dept].pending,
        'In Progress': departmentData[dept]['under consideration'],
        Resolved: departmentData[dept].resolved,
    })).sort((a, b) => (b.Pending + b['In Progress'] + b.Resolved) - (a.Pending + a['In Progress'] + a.Resolved));

    const priorityData = [
        { name: 'High', value: complaints.filter(c => c.priority === 'High').length },
        { name: 'Medium', value: complaints.filter(c => c.priority === 'Medium').length },
        { name: 'Low', value: complaints.filter(c => c.priority === 'Low').length },
    ];
    const PRIORITY_COLORS = ['#ef4444', '#f97316', '#22c55e'];

    return (
      <div className="space-y-8">
        {/* Dashboard Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
          <div className="flex items-center gap-4">
            <Shield className="w-10 h-10 text-accent" />
            <div>
              <h1 className="text-2xl font-bold text-text-on-light">Super Admin Dashboard</h1>
              <p className="text-text-secondary-on-light">Global overview of all reported civic issues.</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-gray-100 p-4 rounded-md border border-gray-200">
              <BarChart2 className="mx-auto text-gray-500" size={24} />
              <p className="text-2xl font-bold text-text-on-light mt-2">{totalComplaints}</p>
              <p className="text-sm text-text-secondary-on-light">Total Reports</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-md border border-gray-200">
              <Clock className="mx-auto text-priority-high" size={24} />
              <p className="text-2xl font-bold text-text-on-light mt-2">{pendingCount}</p>
              <p className="text-sm text-text-secondary-on-light">Pending</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-md border border-gray-200">
              <Loader className="mx-auto text-priority-medium" size={24} />
              <p className="text-2xl font-bold text-text-on-light mt-2">{underConsiderationCount}</p>
              <p className="text-sm text-text-secondary-on-light">In Progress</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-md border border-gray-200">
              <CheckCircle className="mx-auto text-priority-low" size={24} />
              <p className="text-2xl font-bold text-text-on-light mt-2">{resolvedCount}</p>
              <p className="text-sm text-text-secondary-on-light">Resolved</p>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                    <BarChart2 className="text-accent" size={24} />
                    <h2 className="text-xl font-semibold text-text-on-light">Departmental Workload</h2>
                </div>
                <div className="w-full h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" tick={{ fill: '#4b5563' }} tickLine={{ stroke: '#d1d5db' }} />
                            <YAxis tick={{ fill: '#4b5563' }} tickLine={{ stroke: '#d1d5db' }} />
                            <Tooltip 
                                                // This is the line to change. Let's make the grey darker.
                                                cursor={{fill: '#d3d3d3'}} // Changed from '#f3f4f6'
                                                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb'}} 
                                                itemStyle={{ color: '#111827' }}
                                                labelStyle={{ color: '#4b5563' }}
                                                labelFormatter={(value) => barChartData.find(d => d.name === value)?.fullName} 
                            />
                            <Legend wrapperStyle={{ color: '#4b5563' }} />
                            <Bar dataKey="Pending" fill="#ef4444" />
                            <Bar dataKey="In Progress" fill="#f97316" />
                            <Bar dataKey="Resolved" fill="#22c55e" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                    <PieChartIcon className="text-accent" size={24} />
                    <h2 className="text-xl font-semibold text-text-on-light">Priority Breakdown</h2>
                </div>
                <div className="w-full h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {priorityData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                cursor={{fill: '#f3f4f6'}} 
                                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb'}} 
                                itemStyle={{ color: '#111827' }}
                                labelStyle={{ color: '#4b5563' }}
                            />
                            <Legend wrapperStyle={{ color: '#4b5563' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Map View Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
                <MapPin className="text-accent" size={24} />
                <h2 className="text-xl font-semibold text-text-on-light">Report Locations</h2>
            </div>
            <div className="h-96 md:h-[500px] w-full rounded-md overflow-hidden">
                <MapView complaints={filteredComplaints} />
            </div>
        </div>
        
        {/* Complaint List Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
                <List className="text-accent" size={24} />
                <h2 className="text-xl font-semibold text-text-on-light">All Complaints</h2>
            </div>
            <ComplaintList 
                complaints={filteredComplaints} 
                onStatusUpdate={handleStatusUpdate}
                controls={
                    // ✨ MODIFIED: Changed grid layout to accommodate the new filter
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by title or name..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:ring-2 focus:ring-accent focus:outline-none"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <select
                                value={selectedCategory}
                                onChange={e => setSelectedCategory(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-accent focus:outline-none"
                            >
                                {complaintCategories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat === 'all' ? 'All Departments' : cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* ✨ NEW: Status filter dropdown */}
                        <div className="md:col-span-1">
                            <select
                                value={selectedStatus}
                                onChange={e => setSelectedStatus(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-accent focus:outline-none"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="under consideration">In Progress</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>
                    </div>
                }
            />
        </div>
      </div>
    );
};

export default SuperadminDashboard;