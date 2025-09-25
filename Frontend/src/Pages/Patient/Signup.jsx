import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AppContext from "../../Context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser, faEnvelope, faLock, faEye, faEyeSlash,
  faStethoscope, faPen
} from "@fortawesome/free-solid-svg-icons";
import Spinner from "../../Components/Spinner"; 

const Signup = () => {
  const { signup, loading } = useContext(AppContext);
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("patient");
  const [focusedField, setFocusedField] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

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

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z][a-zA-Z0-9._]*@gmail\.com$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z]+[0-9]*$/;
    return usernameRegex.test(username);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword } = formData;

    if (!username || !email || !password || !confirmPassword) {
      return toast.error("All fields are required.");
    }

    if (!validateUsername(username)) {
      return toast.error("Username must start with letters and may include optional numbers.");
    }

    if (!validateEmail(email)) {
      return toast.error("Email must start with letters, may include numbers, and end with @gmail.com.");
    }

    if (password !== confirmPassword) return toast.error("Passwords do not match.");
    if (passwordStrength === "Weak") return toast.error("Password is too weak.");

    const tempUser = {
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: selectedRole,
    };

    localStorage.setItem("pendingSignup", JSON.stringify(tempUser));
    localStorage.setItem("pendingEmail", tempUser.email);

    const result = await signup(tempUser);

    if (result?.msg?.toLowerCase().includes("otp")) {
      toast.success("OTP sent to your email!");
      navigate("/verify-otp", { state: { email: tempUser.email } });
    } else {
      toast.error(result?.error || result?.msg || "Signup failed.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-white px-4">
      <div className="w-full max-w-md p-8 bg-white border border-gray-300 rounded-xl shadow-xl">
        
        {/* Role Selector */}
        <div className="flex justify-center gap-6 mb-6">
          <div
            className={`flex flex-col items-center cursor-pointer transition ${selectedRole === "patient" ? "text-blue-600" : "text-gray-400 hover:text-blue-500"}`}
            onClick={() => setSelectedRole("patient")}
          >
            <FontAwesomeIcon icon={faUser} size="2x" />
            <p className="text-sm font-medium mt-1">Patient</p>
          </div>
          <div
            className="flex flex-col items-center cursor-pointer text-gray-400 hover:text-blue-500 transition"
            onClick={() => navigate("/doctor-signup")}
          >
            <FontAwesomeIcon icon={faStethoscope} size="2x" />
            <p className="text-sm font-medium mt-1">Doctor</p>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Patient Signup</h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="relative">
            <FontAwesomeIcon icon={faUser} className="absolute left-3 top-3 text-gray-400" />
            <input
              name="username"
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              onFocus={() => setFocusedField("username")}
              onBlur={() => setFocusedField("")}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
            {focusedField === "username" && (
              <FontAwesomeIcon icon={faPen} className="absolute right-3 top-3 text-blue-500" />
            )}
          </div>

          {/* Email */}
          <div className="relative">
            <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-3 text-gray-400" />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField("")}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
            {focusedField === "email" && (
              <FontAwesomeIcon icon={faPen} className="absolute right-3 top-3 text-blue-500" />
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <FontAwesomeIcon icon={faLock} className="absolute left-3 top-3 text-gray-400" />
            <input
              name="password"
              type={passwordVisible ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField("")}
              className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
            <FontAwesomeIcon
              icon={passwordVisible ? faEyeSlash : faEye}
              className="absolute right-3 top-3 text-gray-500 cursor-pointer"
              onClick={() => setPasswordVisible(!passwordVisible)}
            />
          </div>

          {/* Password Strength */}
          {formData.password && (
            <p className={`text-sm font-medium mt-1 ${
              passwordStrength === "Weak" ? "text-red-500" :
              passwordStrength === "Medium" ? "text-yellow-500" : "text-green-600"
            }`}>
              Password Strength: {passwordStrength}
            </p>
          )}

          {/* Confirm Password */}
          <div className="relative">
            <FontAwesomeIcon icon={faLock} className="absolute left-3 top-3 text-gray-400" />
            <input
              name="confirmPassword"
              type={confirmPasswordVisible ? "text" : "password"}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onFocus={() => setFocusedField("confirmPassword")}
              onBlur={() => setFocusedField("")}
              className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
            <FontAwesomeIcon
              icon={confirmPasswordVisible ? faEyeSlash : faEye}
              className="absolute right-3 top-3 text-gray-500 cursor-pointer"
              onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        {/* Switch to Login */}
        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{" "}
          <span
            className="text-blue-500 font-medium hover:underline cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Log In
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
