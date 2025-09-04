import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import MapView from './MapView.jsx';
import ComplaintList from './ComplaintList.jsx';
import { Shield, BarChart2, CheckCircle, Clock, AlertTriangle, MapPin, List, Loader, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

// A dedicated skeleton loader for the dashboard
const DashboardSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="h-44 bg-primary rounded-lg"></div>
    <div className="h-96 bg-primary rounded-lg"></div>
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
    
    // --- Data Processing for Analytics ---
    const totalComplaints = complaints.length;
    const pendingCount = complaints.filter(c => c.status === 'pending').length;
    const underConsiderationCount = complaints.filter(c => c.status === 'under consideration').length;
    const resolvedCount = complaints.filter(c => c.status === 'resolved').length;

    // Data for Grouped Bar Chart
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

    // Data for Pie Chart
    const priorityData = [
        { name: 'High', value: complaints.filter(c => c.priority === 'High').length },
        { name: 'Medium', value: complaints.filter(c => c.priority === 'Medium').length },
        { name: 'Low', value: complaints.filter(c => c.priority === 'Low').length },
    ];
    const PRIORITY_COLORS = ['var(--color-priority-high)', 'var(--color-priority-medium)', 'var(--color-priority-low)'];

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
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
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
              <Loader className="mx-auto text-priority-medium" size={24} />
              <p className="text-2xl font-bold text-text-primary mt-2">{underConsiderationCount}</p>
              <p className="text-sm text-text-secondary">In Progress</p>
            </div>
            <div className="bg-border p-4 rounded-md">
              <CheckCircle className="mx-auto text-priority-low" size={24} />
              <p className="text-2xl font-bold text-text-primary mt-2">{resolvedCount}</p>
              <p className="text-sm text-text-secondary">Resolved</p>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 bg-primary border border-border rounded-lg p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                    <BarChart2 className="text-accent" size={24} />
                    <h2 className="text-xl font-semibold text-text-primary">Departmental Workload</h2>
                </div>
                <div className="w-full h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                            <XAxis dataKey="name" tick={{ fill: 'var(--color-text-secondary)' }} tickLine={{ stroke: 'var(--color-text-secondary)' }} />
                            <YAxis tick={{ fill: 'var(--color-text-secondary)' }} tickLine={{ stroke: 'var(--color-text-secondary)' }} />
                            <Tooltip 
                                cursor={{fill: 'var(--color-border)'}} 
                                contentStyle={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)'}} 
                                itemStyle={{ color: 'var(--color-text-primary)' }}
                                labelStyle={{ color: 'var(--color-text-secondary)' }}
                                labelFormatter={(value) => barChartData.find(d => d.name === value)?.fullName} 
                            />
                            <Legend wrapperStyle={{ color: 'var(--color-text-secondary)' }} />
                            <Bar dataKey="Pending" fill="var(--color-priority-high)" />
                            <Bar dataKey="In Progress" fill="var(--color-priority-medium)" />
                            <Bar dataKey="Resolved" fill="var(--color-priority-low)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="lg:col-span-2 bg-primary border border-border rounded-lg p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                    <PieChartIcon className="text-accent" size={24} />
                    <h2 className="text-xl font-semibold text-text-primary">Priority Breakdown</h2>
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
                                cursor={{fill: 'var(--color-border)'}} 
                                contentStyle={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)'}} 
                                itemStyle={{ color: 'var(--color-text-primary)' }}
                                labelStyle={{ color: 'var(--color-text-secondary)' }}
                            />
                            <Legend wrapperStyle={{ color: 'var(--color-text-secondary)' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Map View Card */}
        <div className="bg-primary border border-border rounded-lg p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
                <MapPin className="text-accent" size={24} />
                <h2 className="text-xl font-semibold text-text-primary">Report Locations by Department</h2>
            </div>
            <div className="h-96 md:h-[500px] w-full rounded-md overflow-hidden">
                <MapView complaints={complaints} colorBy="category" />
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