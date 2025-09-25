import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp, faEnvelope, faUserPlus, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const navigate = useNavigate();

  // ✅ FAQ Data
  const faqs = [
    {
      question: "How does MediPredict AI work?",
      answer: "Users enter symptoms, AI predicts possible diseases, and they can consult doctors via chat, video calls, or book appointments.",
    },
    {
      question: "Which diseases can MediPredict AI predict?",
      answer: "The system predicts Diabetes, Heart Disease, and Parkinson’s Disease using AI models like Logistic Regression and SVM Classifier.",
    },
    {
      question: "How does the AI-based disease prediction work?",
      answer: "The AI analyzes user-entered symptoms and provides disease predictions based on trained medical datasets.",
    },
    {
      question: "Is my personal medical data secure?",
      answer: "Yes, MediPredict AI uses encryption, access controls, and secure authentication to protect user data.",
    },
    {
      question: "Can I consult a doctor in real-time?",
      answer: "Yes, the platform offers real-time chat and video consultations with doctors.",
    },
    {
      question: "How do I book an appointment?",
      answer: "Patients can book, reschedule, or cancel appointments through the platform’s scheduling system.",
    },
  ];

  // ✅ Handle Toggle for FAQ
  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto my-12 px-4 sm:px-6 md:px-8">
      
      <section className="text-center mb-10">
        <h2 className="text-4xl sm:text-3xl font-bold text-blue-500">Frequently Asked Questions</h2>
        <p className="text-gray-600 mt-3 max-w-xl mx-auto text-sm sm:text-base">
          Find answers to common questions about MediPredict AI, our services, and how our platform works.
        </p>
      </section>

      {/* ✅ FAQ Section */}
      <section className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className="border border-gray-300 rounded-md shadow-sm transition duration-200"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex justify-between items-center px-4 py-3 text-left text-base font-medium text-gray-800 bg-white hover:bg-gray-100 transition-all"
            >
              {faq.question}
              <FontAwesomeIcon 
                icon={openIndex === index ? faChevronUp : faChevronDown} 
                className="text-blue-500 text-sm"
              />
            </button>
            {openIndex === index && (
              <div className="px-4 py-2 bg-gray-50 text-gray-700 border-t text-sm">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* ✅ Still Have Questions Section */}
      <section className="bg-gray-100 mt-16 py-12 text-center rounded-lg">
        <h3 className="text-2xl font-semibold text-gray-800">Still Have Questions?</h3>
        <p className="text-gray-600 mt-3 max-w-lg mx-auto text-sm sm:text-base">
          If you have any more questions or need further assistance, feel free to reach out to our support team.
        </p>

        <button 
          onClick={() => navigate("/contact")}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-medium text-sm flex items-center mx-auto transition"
        >
          <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
          Contact Us
        </button>
      </section>

      
      <section className="mt-16 py-12 text-center bg-white-500 shadow-lg rounded-lg">
        <h3 className="text-2xl font-semibold text-gray-800">Are You Ready To Get Started!</h3>
        <p className="mt-3 max-w-lg mx-auto text-sm sm:text-base text-gray-700">
          Join MediPredict today and take control of your health with AI-powered disease prediction and expert medical advice.
        </p>

        <div className="mt-6 flex justify-center space-x-4">
          
          <button 
            onClick={() => navigate("/signup")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-medium text-xs sm:text-sm flex items-center transition"
          >
            <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
            Sign Up
          </button>

          
          <button 
            onClick={() => navigate("/about")}
            className="bg-transparent border border-gray-500 text-gray-700 px-5 py-2 rounded-md font-medium text-xs sm:text-sm flex items-center hover:bg-gray-200 transition"
          >
            <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
            Learn More
          </button>
        </div>
      </section>

    </div>
  );
};

export default FAQs;
