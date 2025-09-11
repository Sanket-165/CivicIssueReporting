import React, { useState } from 'react';
import { X, UploadCloud, Loader2, AlertTriangle } from 'lucide-react';

const ProofUploadModal = ({ complaint, onClose, onProofSubmit }) => {
  const [proofFile, setProofFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB.');
        return;
      }
      setError('');
      setProofFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proofFile) {
      setError('Please select an image to upload.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onProofSubmit(complaint._id, proofFile);
      onClose(); // Close modal on success
    } catch (err) {
      setError(err.message || 'Failed to upload proof. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-text-on-light">Upload Resolution Proof</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-text-secondary-on-light">
            Upload an image as proof for resolving the complaint: <span className="font-semibold text-text-on-light">{complaint.title}</span>
          </p>
          <div>
            <label htmlFor="proof-upload" className="block text-sm font-medium text-text-secondary-on-light mb-2">Proof Image</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {preview ? (
                  <img src={preview} alt="Proof preview" className="mx-auto h-32 w-auto rounded-md" />
                ) : (
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="proof-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-accent hover:text-accent-dark focus-within:outline-none">
                    <span>Upload a file</span>
                    <input id="proof-upload" name="proof-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            </div>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-md flex items-center gap-3">
              <AlertTriangle size={20} />
              <span>{error}</span>
            </div>
          )}
          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-gray-100 text-text-secondary-on-light font-bold py-2 px-4 rounded-md hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading || !proofFile} className="bg-accent text-white font-bold py-2 px-4 rounded-md hover:bg-accent-dark disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : 'Submit Proof & Resolve'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProofUploadModal;