import React from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineRobot, AiOutlineClockCircle, AiOutlineLock } from "react-icons/ai";
import { MdOutlineEventAvailable, MdInsights, MdVerified } from "react-icons/md";

const features = [
  {
    icon: <AiOutlineRobot className="inline-block text-blue-500 mr-2" size={20} />,
    title: "AI-Powered Diagnosis",
    description: "Our advanced AI models provide highly accurate disease predictions.",
  },
  {
    icon: <AiOutlineClockCircle className="inline-block text-blue-500 mr-2" size={20} />,
    title: "Real-Time Consultations",
    description: "Consult with expert doctors through chat and video calls.",
  },
  {
    icon: <AiOutlineLock className="inline-block text-blue-500 mr-2" size={20} />,
    title: "Data Security",
    description: "We use secure encryption and strict privacy measures for user safety.",
  },
  {
    icon: <MdOutlineEventAvailable className="inline-block text-blue-500 mr-2" size={20} />,
    title: "Easy Appointment Booking",
    description: "Easily book, reschedule, and manage doctor appointments.",
  },
  {
    icon: <MdInsights className="inline-block text-blue-500 mr-2" size={20} />,
    title: "Health Insights",
    description: "Get personalized health recommendations based on AI analysis.",
  },
  {
    icon: <MdVerified className="inline-block text-blue-500 mr-2" size={20} />,
    title: "Trusted by Experts",
    description: "Our AI is trained with medical data and verified by health professionals.",
  },
];

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto my-12 px-6 sm:px-10 md:px-14">
      
      {/* About Us Section */}
      <section className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-blue-500">About Us</h2>
        <p className="text-gray-600 mt-6 max-w-2xl mx-auto text-sm sm:text-base">
          Welcome to MediPredict, an AI-powered healthcare platform revolutionizing disease prediction and medical consultations.
        </p>
      </section>

      {/* Why Choose Us */}
      <section className="text-center mb-12">

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
          {features.map(({ icon, title, description }, index) => (
            <div
              key={index}
              className="p-6 bg-white rounded-lg shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg text-left"
            >
              <h4 className="font-semibold text-gray-800 flex items-center">
                {icon} {title}
              </h4>
              <p className="text-gray-600 text-sm mt-2">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Join Our Mission Section */}
      <section className="bg-gray-100 text-center py-12 px-6 rounded-lg">
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">Join Our Mission</h3>
        <p className="text-gray-600 mt-3 max-w-2xl mx-auto text-sm sm:text-base">
          Be part of our journey in transforming healthcare with AI-driven solutions. Join us as a doctor and help improve patient outcomes with innovative technology.
        </p>
        <button
          onClick={() => navigate("/doctor-signup")}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium text-sm transition"
        >
          Join as Doctor
        </button>
      </section>
    </div>
  );
};

export default About;
