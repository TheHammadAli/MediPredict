const nodemailer = require("nodemailer");
const Subscriber = require("../models/Subscriber");

const sendNewsletter = async (subject, htmlContent) => {
  const subscribers = await Subscriber.find();
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  for (let sub of subscribers) {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: sub.email,
      subject,
      html: htmlContent,
    });
  }

  console.log("✅ Newsletter sent to", subscribers.length, "subscribers.");
};

module.exports = sendNewsletter;
