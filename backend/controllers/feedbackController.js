const { supabase } = require('../config/db');
const { uploadToSupabase } = require('../middleware/uploadMiddleware');

exports.sendProof = async (req, res) => {
  try {
    const { complaintId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No proof file uploaded.' });
    }

    // Check if complaint exists
    const { data: complaint, error: complaintError } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', complaintId)
      .single();

    if (complaintError || !complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Upload proof to Supabase Storage
    const proofUrl = await uploadToSupabase(req.file, 'proofs');

    // Insert new feedback entry with proof
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback_history')
      .insert([{ complaint_id: complaintId, proof_url: proofUrl }])
      .select()
      .single();

    if (feedbackError) return res.status(400).json({ message: feedbackError.message });

    // Update complaint status and allow citizen feedback
    const { data: updatedComplaint, error: updateError } = await supabase
      .from('complaints')
      .update({ status: 'resolved', is_final: false })
      .eq('id', complaintId)
      .select()
      .single();

    if (updateError) return res.status(400).json({ message: updateError.message });

    res.status(200).json({
      message: 'Proof sent successfully',
      complaint: updatedComplaint,
      feedback,
    });
  } catch (err) {
    console.error('ERROR UPLOADING PROOF:', err);
    return res.status(500).json({ message: 'Server Error', error: err.message });
  }
};
