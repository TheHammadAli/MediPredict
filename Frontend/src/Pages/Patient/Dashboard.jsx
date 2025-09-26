import React, { useState, useCallback, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppContext from "../../Context/AppContext";
import headerImage from "../../assets/Header.jpeg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "sonner";
import axios from "axios";
import { FaUserPlus, FaComments, FaVideo, FaArrowRight, FaLock, FaGlobe, FaDollarSign, FaStethoscope, FaHeartbeat, FaShieldAlt, FaStar, FaCheckCircle } from "react-icons/fa";

import SlideInOnScroll from "../../Components/SlideInOnScroll";

const Dashboard = () => {
  const [medicalConcern, setMedicalConcern] = useState("");
  const [error, setError] = useState("");
  const { user } = useContext(AppContext);
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testimonials, setTestimonials] = useState([]);
  const [showBanner, setShowBanner] = useState(() => {
  return !sessionStorage.getItem("announcementDismissed");
});


useEffect(() => {
  const fetchTestimonials = async () => {
    try {
      const res = await axios.get("https://backend-z2yb.onrender.com/api/testimonials");
      setTestimonials(res.data || []);
    } catch (err) {
      console.error("Failed to load testimonials:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchTestimonials();
}, []);



  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const res = await axios.get("https://backend-z2yb.onrender.com/api/announcement/latest");
        if (res.data?.message) {
          setAnnouncement(res.data.message);
          setTimeout(() => setAnnouncement(null), 3000);
        }
      } catch (err) {
        console.error("Failed to load announcement:", err);
      }
    };

    fetchAnnouncement();
  }, []);

  const navigate = useNavigate();

  const handleInputChange = useCallback(
    (event) => {
      setMedicalConcern(event.target.value);
      if (error) setError("");
    },
    [error]
  );

  const handleFindDoctor = () => {
    if (medicalConcern.trim() === "") {
      setError("Please enter your medical concern.");
      return;
    }
    navigate(`/doctors?concern=${encodeURIComponent(medicalConcern.trim().toLowerCase())}`);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      checkAccess(handleFindDoctor);
    }
  };

  const checkAccess = (callback) => {
    if (!user) {
      navigate("/signup");
      return;
    }
    callback();
  };

  const handleSubscribe = async () => {
    if (!subscriberEmail.trim()) {
      toast.warning("Please enter a valid email.");
      return;
    }

    try {
      const res = await fetch("https://backend-z2yb.onrender.com/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subscriberEmail }),
      });

      const data = await res.json();
      toast.success(data.message || "Subscribed successfully!");
      setSubscriberEmail("");
      setIsSubscribed(true);
    } catch (err) {
      console.error("❌ Error subscribing:", err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleUnsubscribe = async () => {
    try {
      const res = await fetch("https://backend-z2yb.onrender.com/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subscriberEmail }),
      });

      const data = await res.json();
      toast.success(data.message || "Unsubscribed successfully!");
      setIsSubscribed(false);
      setSubscriberEmail("");
    } catch (err) {
      console.error("❌ Error unsubscribing:", err);
      toast.error("Failed to unsubscribe.");
    }
  };

  return (
    <div className="overflow-x-hidden">
      {announcement && showBanner && (
        <div className="max-w-6xl mx-auto my-8 px-6">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white rounded-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center justify-between gap-6 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span className="text-2xl">📢</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Important Announcement</h3>
                  <p className="text-blue-100">{announcement}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowBanner(false);
                  sessionStorage.setItem("announcementDismissed", "true");
                }}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          </div>
        </div>
      )}



      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="relative bg-cover bg-center bg-no-repeat rounded-3xl p-12 border border-gray-200 shadow-2xl overflow-hidden"
            style={{ backgroundImage: `url(${headerImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-indigo-900/70 to-purple-900/60 rounded-3xl"></div>
            <div className="absolute inset-0 bg-black/30 rounded-3xl"></div>
            <div className="relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <SlideInOnScroll direction="left" className="text-center lg:text-left">
                  <div className="mb-8">
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                      Your Health,<br />
                      <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Our Priority
                      </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-blue-100 leading-relaxed max-w-2xl">
                      Experience cutting-edge AI-powered healthcare with personalized consultations from expert doctors worldwide.
                    </p>
                  </div>

                  {/* Search Section */}
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
                    <h3 className="text-2xl font-bold text-white mb-4">Find Your Doctor</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input
                        id="medicalConcern"
                        type="text"
                        placeholder="Describe your symptoms..."
                        value={medicalConcern}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        className="flex-1 px-6 py-4 rounded-xl border-0 bg-white/90 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                      />
                      <button
                        onClick={() => checkAccess(handleFindDoctor)}
                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <FaStethoscope />
                        Find Doctor
                      </button>
                    </div>
                    {error && <p className="text-red-300 mt-3 text-sm">{error}</p>}
                  </div>
                </SlideInOnScroll>

                <SlideInOnScroll direction="right" className="relative">
                  {/* Stats Card */}
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl mb-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex -space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full border-2 border-white flex items-center justify-center text-white font-bold">A</div>
                        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full border-2 border-white flex items-center justify-center text-white font-bold">B</div>
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full border-2 border-white flex items-center justify-center text-white font-bold">C</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">150K+</div>
                        <div className="text-blue-200 text-sm">Patients Recovered</div>
                      </div>
                      <div className="ml-auto">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                          <FaCheckCircle className="text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { number: "20+", label: "Years Experience" },
                      { number: "95%", label: "Satisfaction Rate" },
                      { number: "5K+", label: "Patients Served" },
                      { number: "50+", label: "Expert Doctors" }
                    ].map((stat, index) => (
                      <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 shadow-lg text-center">
                        <div className="text-2xl font-bold text-white mb-1">{stat.number}</div>
                        <div className="text-blue-200 text-sm">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </SlideInOnScroll>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get the care you need in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-24 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200"></div>

            {[
              { icon: FaUserPlus, title: "Create Account", desc: "Sign up as a patient or healthcare professional in minutes.", step: "01" },
              { icon: FaComments, title: "Describe Symptoms", desc: "Share your medical concerns and get matched with the right specialist.", step: "02" },
              { icon: FaVideo, title: "Get Consultation", desc: "Receive expert medical advice through secure video or chat sessions.", step: "03" },
            ].map((step, i) => (
              <SlideInOnScroll
                key={i}
                direction={i % 2 === 0 ? "up" : "up"}
                className="relative group"
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                  <div className="absolute -top-4 left-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      {step.step}
                    </div>
                  </div>
                  <div className="pt-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <step.icon className="text-3xl text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </SlideInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="py-24 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive healthcare solutions powered by AI and expert medical professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: FaHeartbeat,
                title: "AI Disease Prediction",
                desc: "Advanced machine learning algorithms analyze your symptoms to provide accurate disease predictions and early warnings.",
                color: "from-red-500 to-pink-600"
              },
              {
                icon: FaStethoscope,
                title: "Specialist Referrals",
                desc: "Get connected with board-certified specialists for complex medical conditions and personalized treatment plans.",
                color: "from-blue-500 to-indigo-600"
              },
            ].map((service, i) => (
              <SlideInOnScroll
                key={i}
                direction={i % 2 === 0 ? "left" : "right"}
                className="group"
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 h-full">
                  <div className="flex items-start gap-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <service.icon className="text-3xl text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                      <p className="text-gray-600 leading-relaxed mb-6">{service.desc}</p>
                      <button
                        onClick={() => checkAccess(() => navigate("/services"))}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      >
                        Learn More
                        <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                      </button>
                    </div>
                  </div>
                </div>
              </SlideInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real stories from patients and doctors who trust MediPredict
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {loading ? (
              <div className="col-span-3 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : testimonials.length === 0 ? (
              <div className="col-span-3 text-center">
                <p className="text-gray-600 text-lg">No testimonials available yet.</p>
              </div>
            ) : (
              testimonials.slice(0, 3).map(({ _id, name, status, comment, message }, i) => (
                <SlideInOnScroll
                  key={i}
                  direction={i % 2 === 0 ? "up" : "up"}
                  className="group"
                >
                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 h-full">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{name}</h3>
                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                          status?.toLowerCase() === "doctor"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}>
                          {status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase() || "Patient"}
                        </span>
                      </div>
                    </div>

                    <div className="relative">
                      <FaStar className="absolute -top-2 -left-2 text-yellow-400 text-xl" />
                      <p className="text-gray-700 text-base leading-relaxed italic pl-6">
                        "{message || comment}"
                      </p>
                    </div>
                  </div>
                </SlideInOnScroll>
              ))
            )}
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button
              onClick={() => navigate("/testimonial")}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              View All Testimonials
              <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>


      {/* Why Choose Us Section */}
      <section className="py-24 bg-gradient-to-r from-indigo-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose MediPredict?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience healthcare innovation that puts patients first
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: FaShieldAlt,
                title: "Enterprise Security",
                desc: "Bank-level encryption and HIPAA compliance ensure your medical data stays completely secure and private.",
                color: "from-green-500 to-emerald-600"
              },
              {
                icon: FaGlobe,
                title: "Global Accessibility",
                desc: "Break language barriers with real-time translation powered by advanced NLP for seamless international consultations.",
                color: "from-blue-500 to-cyan-600"
              },
              {
                icon: FaDollarSign,
                title: "Affordable Care",
                desc: "Quality healthcare consultations at a fraction of traditional costs, making expert medical advice accessible to all.",
                color: "from-purple-500 to-pink-600"
              },
            ].map((why, i) => (
              <SlideInOnScroll
                key={i}
                direction={i % 2 === 0 ? "up" : "up"}
                className="group"
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 text-center h-full">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <why.icon className="text-4xl text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{why.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{why.desc}</p>
                </div>
              </SlideInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 backdrop-blur-lg rounded-3xl p-12 border border-white/20 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Stay Connected</h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                Get the latest health insights, medical breakthroughs, and expert tips delivered straight to your inbox.
              </p>
            </div>

            {!isSubscribed ? (
              <div className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={subscriberEmail}
                    onChange={(e) => setSubscriberEmail(e.target.value)}
                    className="flex-1 px-6 py-4 rounded-xl border-0 bg-white/90 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg shadow-lg"
                  />
                  <button
                    onClick={handleSubscribe}
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <FaCheckCircle />
                    Subscribe
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-lg mx-auto">
                <div className="bg-green-500/20 backdrop-blur-lg rounded-2xl p-8 border border-green-400/30">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                      <FaCheckCircle className="text-white text-2xl" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">You're Subscribed!</h3>
                  <p className="text-green-100 mb-6 leading-relaxed">
                    Thank you for joining our community. You'll receive exclusive health insights and updates in your inbox.
                  </p>
                  <button
                    onClick={handleUnsubscribe}
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/30"
                  >
                    Unsubscribe
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

