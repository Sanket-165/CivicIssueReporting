
import { X } from 'lucide-react';

const ViewComplaintModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-4 relative" onClick={e => e.stopPropagation()}>
        <div className="p-2 border-b border-gray-200 mb-4">
          <h2 className="text-xl font-bold text-text-on-light">Complaint Image</h2>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors bg-white/50 rounded-full p-1">
            <X size={24} />
        </button>
        <div className="w-full max-h-[80vh] overflow-auto">
          <img src={imageUrl} alt="Proof of resolution" className="w-full h-auto object-contain rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default ViewComplaintModal;