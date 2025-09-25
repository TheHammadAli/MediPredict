import React, { useState, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faComments,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import AppContext from "../Context/AppContext";

const ContactUs = () => {
  const { sendContactMessage, loading } = useContext(AppContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await sendContactMessage(formData);
    if (response.error) {
      toast.error(response.error);
    } else {
      toast.success("✅ Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    }
  };

  return (
    <div className="max-w-6xl mx-auto my-10 px-4 sm:px-6 lg:px-8">
      {/* Heading */}
      <section className="text-center mb-16">
        <h2 className="text-4xl font-bold text-blue-600">Contact Us</h2>
        <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-base">
          Have questions or need assistance? Reach out through the info below or send us a message directly.
        </p>
      </section>

      {/* Info + Form */}
      <section className="flex flex-col lg:flex-row gap-10">
        {/* Contact Info */}
        <div className="w-full lg:w-2/5 bg-white p-8 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">Contact Information</h3>
          <div className="space-y-5 text-left">
            <div className="flex items-start gap-4">
              <FontAwesomeIcon icon={faPhone} className="text-blue-500 text-xl mt-1" />
              <p className="text-gray-700 text-base">+1 234 567 890</p>
            </div>
            <div className="flex items-start gap-4">
              <FontAwesomeIcon icon={faEnvelope} className="text-blue-500 text-xl mt-1" />
              <p className="text-gray-700 text-base">support@example.com</p>
            </div>
            <div className="flex items-start gap-4">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500 text-xl mt-1" />
              <p className="text-gray-700 text-base">123 Street Name, City, Country</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="w-full lg:w-3/5 bg-white p-8 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">Send a Message</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Your Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Type your message..."
                rows="5"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300"
            >
              {loading ? "Sending..." : "Submit"}
            </button>
          </form>
        </div>
      </section>

      {/* Help Box */}
      <section className="bg-gray-100 text-center py-12 px-6 rounded-lg mt-20">
  <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">We’re Here to Help</h3>
  <p className="text-gray-600 mt-3 max-w-2xl mx-auto text-sm sm:text-base">
    Our support team is available 24/7 to assist you. Whether it's guidance, technical help, or general queries —
    we’re just one click away.
  </p>
  <button
    className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium text-sm transition"
  >
    Chat with Support
  </button>
</section>

    </div>
  );
};

export default ContactUs;
