import React, { useState, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faStethoscope, faPen } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AppContext from "../../Context/AppContext";
import Spinner from "../../Components/Spinner";

const DoctorLogin = () => {
  
  const { doctorLogin, loading } = useContext(AppContext);
  
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  const response = await doctorLogin({
    email: formData.email.trim().toLowerCase(),
    password: formData.password,
  });

  if (response?.success) {
    // ✅ Save MongoDB doctor ID
    localStorage.setItem("doctorId", response.doctor._id);

    toast.success("Doctor logged in successfully");
    setTimeout(() => navigate("/docDashboard"), 2000);
  } else {
    toast.error(response?.error || "Invalid email or password!");
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-white px-4">
      <div className="w-full max-w-md p-8 bg-white border border-gray-300 rounded-xl shadow-xl">

        {/* Heading */}
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
          <FontAwesomeIcon icon={faStethoscope} className="mr-2 text-blue-500" />
          Doctor Login
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email Field */}
          <div className="relative">
            <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
            {focusedField === "email" && (
              <FontAwesomeIcon icon={faPen} className="absolute right-3 top-3 text-blue-500" />
            )}
          </div>

          {/* Password Field */}
          <div className="relative">
            <FontAwesomeIcon icon={faLock} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
            {focusedField === "password" && (
              <FontAwesomeIcon icon={faPen} className="absolute right-3 top-3 text-blue-500" />
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <div className="text-right -mt-3 mb-4">
            <span
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-blue-500 hover:underline cursor-pointer"
            >
               Forgot Password?
            </span>
          </div>
        </form>

        {/* Footer CTA */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Not a doctor?{" "}
          <span
            onClick={() => navigate("/doctor-signup")}
            className="text-blue-500 font-medium hover:underline cursor-pointer"
          >
            Sign up as Doctor
          </span>
        </p>
      </div>
    </div>
  );
};

export default DoctorLogin;
