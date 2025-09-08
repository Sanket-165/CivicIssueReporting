import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../api/api';
import { Users, AlertTriangle, Loader2, Search } from 'lucide-react';

// A dedicated skeleton loader for the user list
const UserListSkeleton = () => (
    <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-gray-200 rounded-md w-full max-w-sm"></div>
        <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-lg w-full"></div>
            ))}
        </div>
    </div>
);

// This is the main component
const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const departments = [
        'Water Supply & Sewage',
        'Roads & Potholes',
        'Waste Management',
        'Streetlights & Electricity',
        'Public Health & Sanitation',
        'Illegal Construction & Encroachment',
        'Other'
    ];

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (err) {
            setError('Failed to fetch user data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRoleChange = async (userId, newRole, currentDepartment) => {
        let department = newRole === 'admin' ? (currentDepartment || departments[0]) : undefined;

        try {
            const { data } = await api.put(`/users/${userId}`, { role: newRole, department });
            setUsers(users.map(u => u._id === userId ? { ...u, role: data.role, department: data.department } : u));
        } catch (err) {
            alert('Failed to update user role.');
        }
    };

    const handleDepartmentChange = async (userId, newDepartment) => {
        try {
            const { data } = await api.put(`/users/${userId}`, { department: newDepartment });
            setUsers(users.map(u => u._id === userId ? { ...u, department: data.department } : u));
        } catch (err) {
            alert('Failed to update user department.');
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    if (loading) return <UserListSkeleton />;

    if (error) {
        return (
            <div className="text-center py-10 text-red-600">
                <AlertTriangle size={48} className="mx-auto" />
                <p className="mt-4">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 pl-10 pr-3 text-text-on-light focus:ring-2 focus:ring-accent focus:outline-none transition-shadow shadow-sm"
                />
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                    {/* Header */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 font-semibold text-left text-sm text-text-secondary-on-light border-b border-gray-200 bg-gray-50 rounded-t-lg">
                        <div className="col-span-4">User</div>
                        <div className="col-span-3">Role</div>
                        <div className="col-span-5">Department</div>
                    </div>

                    {/* Body */}
                    {filteredUsers.map(user => (
                        <div key={user._id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 last:border-b-0 items-center">
                            {/* User Info */}
                            <div className="col-span-12 md:col-span-4">
                                <p className="font-bold text-text-on-light">{user.name}</p>
                                <p className="text-sm text-text-secondary-on-light">{user.email}</p>
                            </div>
                            
                            {/* Role Selector */}
                            <div className="col-span-12 md:col-span-3">
                                <select 
                                    value={user.role} 
                                    onChange={(e) => handleRoleChange(user._id, e.target.value, user.department)}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-md p-2 text-sm font-semibold focus:ring-2 focus:ring-accent focus:outline-none transition-shadow shadow-sm"
                                >
                                    <option value="citizen">Citizen</option>
                                    <option value="admin">Admin</option>
                                    <option value="superadmin">Superadmin</option>
                                </select>
                            </div>
                            
                            {/* Department Selector */}
                            <div className="col-span-12 md:col-span-5">
                                {user.role === 'admin' && (
                                    <select 
                                        value={user.department} 
                                        onChange={(e) => handleDepartmentChange(user._id, e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-accent focus:outline-none transition-shadow shadow-sm"
                                    >
                                        {departments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserManagement;

