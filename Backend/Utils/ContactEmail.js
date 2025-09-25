const nodemailer = require("nodemailer");
require("dotenv").config();

// ✅ Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // You can use any email provider
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

// ✅ Send Email Function
const sendEmail = async ({ name, email, message }) => {
  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER, // Your email address to receive messages
    subject: `Hey this is ${name} and i need a help!`,
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "Email sent successfully!" };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return { success: false, message: "Failed to send email." };
  }
};

module.exports = sendEmail;
