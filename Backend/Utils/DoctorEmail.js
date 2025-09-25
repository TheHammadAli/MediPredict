const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * 📩 Send OTP via Email
 */
const sendOTPEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}. It expires in 1 minutes.`,
    });

    console.log(`✅ OTP sent via Email to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending OTP via Email:", error);
    return false;
  }
};

module.exports = { sendOTPEmail };
