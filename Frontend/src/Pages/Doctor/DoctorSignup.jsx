import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AppContext from "../../Context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faStethoscope,
  faPen,
} from "@fortawesome/free-solid-svg-icons";

const DoctorSignup = () => {
  const { doctorSignup, loading } = useContext(AppContext);
  const navigate = useNavigate();

  const [focusedField, setFocusedField] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [errors, setErrors] = useState({});

  // Relaxed validation to align with common backend requirements
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateUsername = (username) => /^[a-zA-Z0-9_]{3,}$/.test(username);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "password") {
      const strength = checkPasswordStrength(e.target.value);
      setPasswordStrength(strength);
    }
  };

  const checkPasswordStrength = (password) => {
    if (!password) return "";
    if (password.length < 6) return "Weak";
    if (password.match(/[A-Z]/) && password.match(/[0-9]/) && password.length >= 8) return "Strong";
    return "Medium";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.username || !validateUsername(formData.username)) {
      newErrors.username = "Username must be at least 3 characters (letters, numbers, underscores).";
    }

    if (!formData.email || !validateEmail(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.password || passwordStrength === "Weak") {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const signupData = {
      username: formData.username,
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      specialization: "general", // Adjust if backend requires specific values
    };

    console.log("📤 Doctor Signup Data:", signupData);
    const result = await doctorSignup(signupData);

    if (result?.success) {
      toast.success("Signup successful! OTP sent to your email.");
      localStorage.setItem("pendingDoctorSignup", JSON.stringify(signupData));
      navigate("/docverify-otp");
    } else {
      console.error("Signup Result Error:", result.error);
      if (result.error.includes("Email already exists")) {
        setErrors({ ...errors, email: "This email is already registered." });
      } else if (result.error.includes("Username taken")) {
        setErrors({ ...errors, username: "This username is already taken." });
      } else {
        toast.error(result.error || "Signup failed. Please try again.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-white px-4">
      <div className="w-full max-w-md p-8 bg-white border border-gray-300 rounded-xl shadow-xl">
        <div className="flex justify-center gap-6 mb-6">
          <div
            className="flex flex-col items-center cursor-pointer text-gray-400 hover:text-blue-500"
            onClick={() => navigate("/signup")}
          >
            <FontAwesomeIcon icon={faUser} size="2x" />
            <p className="text-sm font-medium mt-1">Patient</p>
          </div>
          <div className="flex flex-col items-center text-blue-600 cursor-pointer">
            <FontAwesomeIcon icon={faStethoscope} size="2x" />
            <p className="text-sm font-medium mt-1">Doctor</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Doctor Signup</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="relative">
            <FontAwesomeIcon icon={faUser} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              onFocus={() => setFocusedField("username")}
              onBlur={() => setFocusedField("")}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
            {focusedField === "username" && (
              <FontAwesomeIcon icon={faPen} className="absolute right-3 top-3 text-blue-500" />
            )}
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
          </div>

          {/* Email */}
          <div className="relative">
            <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField("")}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
            {focusedField === "email" && (
              <FontAwesomeIcon icon={faPen} className="absolute right-3 top-3 text-blue-500" />
            )}
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="relative">
            <FontAwesomeIcon icon={faLock} className="absolute left-3 top-3 text-gray-400" />
            <input
              type={passwordVisible ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField("")}
              className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
            <FontAwesomeIcon
              icon={passwordVisible ? faEyeSlash : faEye}
              className="absolute right-3 top-3 cursor-pointer text-gray-600"
              onClick={() => setPasswordVisible(!passwordVisible)}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Password Strength */}
          {formData.password && (
            <p
              className={`text-sm font-medium mt-1 ${
                passwordStrength === "Weak"
                  ? "text-red-500"
                  : passwordStrength === "Medium"
                  ? "text-yellow-500"
                  : "text-green-600"
              }`}
            >
              Password Strength: {passwordStrength}
            </p>
          )}

          {/* Confirm Password */}
          <div className="relative">
            <FontAwesomeIcon icon={faLock} className="absolute left-3 top-3 text-gray-400" />
            <input
              type={confirmPasswordVisible ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onFocus={() => setFocusedField("confirmPassword")}
              onBlur={() => setFocusedField("")}
              className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
            <FontAwesomeIcon
              icon={confirmPasswordVisible ? faEyeSlash : faEye}
              className="absolute right-3 top-3 cursor-pointer text-gray-600"
              onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/doctor-login")}
            className="text-blue-500 font-medium hover:underline cursor-pointer"
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
};

export default DoctorSignup;