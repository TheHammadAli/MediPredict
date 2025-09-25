const Patient = require("../Model/Patient");
const Doctor = require("../Model/Doctor");
const OTP = require("../Model/OTP");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOTPEmail } = require("../Utils/Email");
const sendEmail = require("../Utils/ContactEmail");

// Generate 6-digit OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// 📌 Register (send OTP)
const register = async (req, res) => {
  try {
    let { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    email = email.trim().toLowerCase();

    const existingDoctor = await Doctor.findOne({ email });
    const existingPatient = await Patient.findOne({ email });

    if (existingDoctor || existingPatient) {
      return res.status(400).json({ msg: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes

    const tempUser = {
      username,
      password: hashedPassword,
      role,
    };

    // ✅ Ensure only one OTP per email
    await OTP.deleteMany({ email });

    await OTP.create({
      email,
      otp,
      expiresAt: otpExpires,
      tempUser,
    });

    await sendOTPEmail(email, otp);
    res.status(200).json({ msg: "OTP sent to email. Please verify." });
  } catch (error) {
    console.error("❌ Error in Register API:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// 📌 Verify OTP and finalize registration
const verifyOTP = async (req, res) => {
  let { email, otp } = req.body;
  email = email?.trim().toLowerCase();

  try {
    console.log("📩 Verifying OTP for:", email, otp);

    const otpRecord = await OTP.findOne({ email });
    console.log("📥 Found OTP record:", otpRecord);

    if (!otpRecord) {
      console.log("❌ No OTP record found");
      return res
        .status(400)
        .json({ msg: "No OTP found for this email. Try signing up again." });
    }

    if (otpRecord.otp.toString().trim() !== otp.toString().trim()) {
      console.log("❌ OTP mismatch", otpRecord.otp, otp);
      return res.status(400).json({ msg: "Invalid OTP. Please try again." });
    }

    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ email });
      return res.status(400).json({ msg: "OTP expired. Request a new one." });
    }

    if (!otpRecord.tempUser) {
      return res
        .status(400)
        .json({ msg: "Temp user data missing in OTP record." });
    }

    const { username, password, role } = otpRecord.tempUser;

    const newUser = await Patient.create({
      username,
      email,
      password,
      role: role || "patient",
      isVerified: true,
    });

    await OTP.deleteOne({ email });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      msg: "OTP verified. Registration complete.",
      token,
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("❌ OTP Verification Error:", error);
    res.status(500).json({ msg: "OTP verification failed. Please try again." });
  }
};

// 📌 Resend OTP
const resendOTP = async (req, res) => {
  try {
    let { email } = req.body;
    email = email.trim().toLowerCase();

    const existingOTP = await OTP.findOne({ email });
    if (!existingOTP || !existingOTP.tempUser) {
      return res
        .status(400)
        .json({ msg: "No pending registration. Please sign up again." });
    }

    await OTP.deleteMany({ email });

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 20 * 60 * 1000);

    await OTP.create({
      email,
      otp,
      expiresAt: otpExpires,
      tempUser: existingOTP.tempUser,
    });

    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      return res.status(500).json({ msg: "Failed to send OTP" });
    }

    res.status(200).json({ msg: "OTP resent to your email." });
  } catch (err) {
    console.error("❌ Resend OTP Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// 📌 Login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Patient.findOne({ email });

    if (!user) {
      return res.status(401).json({ msg: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// 📌 Contact Us
const contactUs = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ msg: "All fields are required." });
    }

    const response = await sendEmail({ name, email, message });

    if (!response.success) {
      return res
        .status(500)
        .json({ msg: "Failed to send message. Try again." });
    }

    res.status(200).json({ msg: "Message sent successfully!" });
  } catch (error) {
    console.error("❌ Error in Contact Form API:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// 📌 Get Logged-in Profile (Doctor or Patient)
const getProfile = async (req, res) => {
  try {
    let user = await Patient.findById(req.user.id).select("-password");
    if (!user) {
      user = await Doctor.findById(req.user.id).select("-password");
    }

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    console.error("❌ Get Profile Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// 📌 Count Patients
const countPatient = async (req, res) => {
  try {
    const count = await Patient.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error("Error getting patient count:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  register,
  verifyOTP,
  login,
  resendOTP,
  contactUs,
  getProfile,
  countPatient,
};
