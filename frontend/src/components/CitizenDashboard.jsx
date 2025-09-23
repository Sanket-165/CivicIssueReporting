import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import ComplaintForm from './ComplaintForm.jsx';
import ViewProofModal from './ViewProofModal';
import ViewComplaintModal from './ViewComplaintModal.jsx';
import { useAuth } from '../context/AuthContext';
import { Plus, List, AlertTriangle, CheckCircle, Clock, Loader, Eye , Camera} from 'lucide-react';

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

const ComplaintCard = ({ complaint, onViewProof, onComplaintImage }) => {
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
   <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row gap-4 hover:border-accent transition-all duration-300 shadow-sm hover:shadow-lg">
     {/* This thumbnail remains hidden on mobile, but visible on larger screens */}
     <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden hidden sm:block">
       <img src={complaint.imageUrl} alt={complaint.title} className="w-full h-full object-cover" />
     </div>
     <div className="flex-grow">
       <div className="flex justify-between items-start">
         <div>
           <p className="text-sm text-text-secondary-on-light">{complaint.category}</p>
           <h3 className="font-bold text-lg text-text-on-light">{complaint.title}</h3>
         </div>
         <div className={`flex items-center gap-2 text-sm font-medium text-${statusInfo.color}`}>
           {statusInfo.icon}
           <span className="capitalize">{complaint.status}</span>
         </div>
       </div>
       <p className="text-text-secondary-on-light text-sm mt-2">{complaint.description.substring(0, 120)}...</p>
       
       {/* Action Buttons Container */}
       <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-4">
        
        {/* ✨ NEW BUTTON: Only visible on mobile (screens smaller than sm) ✨ */}
        <button
            onClick={() => onComplaintImage(complaint.imageUrl)}
            className="inline-flex sm:hidden items-center gap-2 text-sm font-semibold text-accent hover:text-accent-dark transition-colors"
        >
            <Camera size={16} /> View Complaint Image
        </button>

        {/* Existing "View Proof" button */}
        {complaint.status === 'resolved' && complaint.proofUrl && (
            <button
              onClick={() => onViewProof(complaint.proofUrl)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-dark transition-colors"
            >
              <Eye size={16} /> View Resolution Proof
            </button>
        )}
       </div>
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
       <button
         onClick={() => setView('list')}
         className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-300 text-sm font-semibold ${view === 'list' ? 'bg-accent text-white' : 'text-text-secondary-on-light hover:bg-gray-100'}`}
       >
         <List size={16} /> My Reports
       </button>
       <button
         onClick={() => setView('form')}
         className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-300 text-sm font-semibold ${view === 'form' ? 'bg-accent text-white' : 'text-text-secondary-on-light hover:bg-gray-100'}`}
       >
         <Plus size={16} /> Report New Issue
       </button>
     </div>
     <div>
       {view === 'form' && <ComplaintForm onComplaintSubmitted={handleComplaintSubmitted} />}
       
       {view === 'list' && (
         error ? (
           <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg flex items-center gap-4">
             <AlertTriangle size={32} />
             <div>
               <h2 className="font-bold">Error</h2>
               <p>{error}</p>
             </div>
           </div>
         ) : complaints.length > 0 ? (
           <div className="space-y-4">
             {complaints.map(c => <ComplaintCard key={c._id} complaint={c} onViewProof={setViewingProof} onComplaintImage={setViewingComplaint} />)}
           </div>
         ) : (
           <div className="text-center py-16 px-6 bg-white rounded-lg border-2 border-dashed border-gray-200">
             <h2 className="text-xl font-semibold text-text-on-light">No Issues Reported Yet</h2>
             <p className="text-text-secondary-on-light mt-2 mb-4">Click "Report New Issue" to get started.</p>
             <button
               onClick={() => setView('form')}
               className="bg-accent text-white font-semibold px-6 py-2 rounded-md hover:bg-accent-dark transition-colors duration-300"
             >
               Submit Your First Report
             </button>
           </div>
         )
       )}
     </div>
     <ViewProofModal 
        imageUrl={viewingProof} 
        onClose={() => setViewingProof(null)} 
      />
      <ViewComplaintModal 
        imageUrl={viewingComplaint} 
        onClose={() => setViewingComplaint(null)} 
      />
   </div>
 );
};

export default CitizenDashboard;