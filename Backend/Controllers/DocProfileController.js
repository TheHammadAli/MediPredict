const Doctor = require("../Model/DocProfile");
const cloudinary = require("../Config/cloudinary");

// ✅ Add Doctor with Cloudinary image upload
const addDoctor = async (req, res) => {
  try {
    let imageUrl = "";

    if (req.file) {
      const result = cloudinary.uploader.upload_stream(
        { resource_type: "image", folder: "doctor_profiles" },
        async (error, result) => {
          if (error)
            return res.status(500).json({ msg: "Cloudinary Error", error });

          imageUrl = result.secure_url;

          const doctorData = {
            ...req.body,
            imageUrl,
          };

          const doctor = new Doctor(doctorData);
          await doctor.save();

          res.status(201).json({ msg: "Doctor added successfully", doctor });
        }
      );

      result.end(req.file.buffer);
    } else {
      return res.status(400).json({ msg: "Image is required" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// ✅ Fetch All Doctor Profiles
const getAllDoctorProfiles = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.status(200).json(doctors);
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Failed to fetch doctors", error: error.message });
  }
};
// ✅ Get Profile by Email (or user ID if preferred)
const getDoctorProfileByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const doctor = await Doctor.findOne({ email });
    if (!doctor) return res.status(404).json({ msg: "Doctor not found" });
    res.status(200).json(doctor);
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error fetching profile", error: error.message });
  }
};

// ✅ Update Doctor Profile
const updateDoctorProfile = async (req, res) => {
  try {
    const { email } = req.params;

    const updatedData = {
      ...req.body,
    };

    if (req.file) {
      const result = await new Promise((resolve, reject) =>
        cloudinary.uploader
          .upload_stream(
            { resource_type: "image", folder: "doctor_profiles" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          )
          .end(req.file.buffer)
      );
      updatedData.imageUrl = result.secure_url;
    }

    const updated = await Doctor.findOneAndUpdate({ email }, updatedData, {
      new: true,
    });

    if (!updated) return res.status(404).json({ msg: "Doctor not found" });
    res.status(200).json({ msg: "Profile updated", doctor: updated });
  } catch (error) {
    res.status(500).json({ msg: "Update failed", error: error.message });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const result = await Doctor.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: "Doctor not found" });
    res.json({ message: "Doctor deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addDoctor,
  getAllDoctorProfiles,
  getDoctorProfileByEmail,
  updateDoctorProfile,
  deleteProfile,
};
