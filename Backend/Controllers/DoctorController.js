const Doctor = require("../Model/Doctor");
const OTP = require("../Model/OTP");
const jwt = require("jsonwebtoken");
const DocProfile = require("../Model/DocProfile");
const { sendOTPEmail } = require("../Utils/DoctorEmail");

// JWT Generator
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Register Doctor
const registerDoctor = async (req, res) => {
  let { email } = req.body;
  email = email.trim().toLowerCase();

  try {
    const existing = await Doctor.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Doctor already exists" });

    await OTP.deleteMany({ email });
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 20 * 60 * 1000);
    await OTP.create({ email, otp, expiresAt: otpExpires });

    console.log(`📨 OTP for ${email}: ${otp}`);
    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      return res.status(500).json({ msg: "Failed to send OTP email." });
    }

    return res
      .status(200)
      .json({ msg: "OTP sent to email. Complete signup by verifying OTP." });
  } catch (err) {
    console.error("❌ Register Doctor Error:", err);
    return res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

const DoctorVerifyOTP = async (req, res) => {
  let { email, otp, username, password, specialization } = req.body;
  email = email.trim().toLowerCase();

  try {
    const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ msg: "No OTP record found." });
    }

    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ email });
      return res
        .status(400)
        .json({ msg: "OTP expired. Please request a new one." });
    }

    if (String(otpRecord.otp).trim() !== String(otp).trim()) {
      return res.status(400).json({ msg: "Invalid OTP. Please try again." });
    }

    // ✅ Create Doctor (now)
    const existing = await Doctor.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "Doctor already registered." });
    }

    const doctor = await Doctor.create({
      username,
      email,
      password,
      specialization,
      isVerified: true,
    });

    await DocProfile.create({
      doctorRefId: doctor._id,
      name: username,
      email,
      speciality: specialization,
    });

    await OTP.deleteOne({ email });

    const token = generateToken(doctor._id);
    return res.status(200).json({
      msg: "OTP verified. Registration complete. You can now log in.",
      token,
      user: {
        id: doctor._id,
        username: doctor.username,
        email: doctor.email,
        role: "doctor",
      },
    });
  } catch (error) {
    console.error("❌ OTP Verification Error:", error);
    return res.status(500).json({ msg: "Server error" });
  }
};
// Resend OTP
const DoctorResendOTP = async (req, res) => {
  let { email } = req.body;
  email = email.trim().toLowerCase();

  try {
    const doctor = await Doctor.findOne({ email });
    if (!doctor) return res.status(400).json({ msg: "User not found" });

    await OTP.deleteMany({ email });

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 20 * 60 * 1000);
    const otpDoc = await OTP.create({ email, otp, expiresAt: otpExpires });

    console.log("✅ OTP Saved:", otpDoc);
    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) return res.status(500).json({ msg: "Error sending OTP." });

    res.status(200).json({ msg: "New OTP sent successfully to your email." });
  } catch (error) {
    console.error("❌ Resend OTP Error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};
const loginDoctor = async (req, res) => {
  let { email, password } = req.body;
  email = email.trim().toLowerCase();

  try {
    const doctor = await Doctor.findOne({ email });

    if (!doctor) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await doctor.matchPassword(password);
    console.log("🧪 Comparing:", password, "with", doctor.password);
    console.log("✅ Match result:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // ✅ Enforce OTP verification before allowing login
    if (!doctor.isVerified) {
      return res
        .status(403)
        .json({ msg: "Please verify your account via OTP before logging in." });
    }

    // ✅ Send token and doctor object
    res.status(200).json({
      msg: "Login successful",
      token: generateToken(doctor._id),
      doctor: {
        id: doctor._id,
        username: doctor.username,
        email: doctor.email,
        specialization: doctor.specialization,
      },
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

const countDoctor = async (req, res) => {
  try {
    const count = await Doctor.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error("Error getting doctor count:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// 📌 Get All Doctors
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.status(200).json(doctors);
  } catch (err) {
    console.error("❌ Error fetching doctors:", err);
    res.status(500).json({ message: "Failed to fetch doctors" });
  }
};

module.exports = {
  registerDoctor,
  DoctorVerifyOTP,
  loginDoctor,
  DoctorResendOTP,
  countDoctor,
  getAllDoctors,
};
