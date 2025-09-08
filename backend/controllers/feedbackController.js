const Complaint = require("../models/Complaint")
const cloudinary = require('cloudinary');
const streamifier = require('streamifier');

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const streamUpload = (buffer, folder, resource_type) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream({ folder, resource_type }, (error, result) => {
            if (result) resolve(result);
            else reject(error);
        });
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

exports.sendProof = async(req,res) =>{
    try{
        //Admin sends the proof of resolving the complaint to the user
        const {complaintId, proof} = req.body;
        const complaint = await Complaint.findById(complaintId);
        if(!complaint){
            return res.status(404).json({message: "Complaint not found"});
        }
        const files = req.files;
        const proofResult = await streamUpload(files.buffer, 'civic_issues/proofs', 'image');

        complaint.proofUrl = proofResult.secure_url;
        complaint.status = "Resolved";
        await complaint.save();
        res.status(200).json({message: "Proof sent successfully"});
    }
    catch(err){
        return res.status(500).json({message: "Server Error", error: err.message});
    }   
}