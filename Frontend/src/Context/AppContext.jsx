import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

// Create Context
const AppContext = createContext();

// Backend URLs
const BASE_URL = "http://localhost:5000/api/auth";
const BASE_URL1 = "http://localhost:5000/api";

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [testimonials, setTestimonials] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);

  // Log BASE_URL for debugging
  console.log("🔍 BASE_URL:", BASE_URL);
  console.log("🔍 BASE_URL1:", BASE_URL1);

  // Fetch user profile on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get(`${BASE_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUser(res.data))
        .catch((err) => {
          console.error("❌ Profile Fetch Error:", {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status,
          });
          logout(); // Clear token if invalid
        })
        .finally(() => setLoadingUser(false));
    } else {
      setLoadingUser(false);
    }
  }, []);

  // Patient Signup
  const signup = async (userData) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${BASE_URL}/register`, userData);
      setLoading(false);
      return res.data;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Signup failed! Try again.";
      console.error("❌ Patient Signup Error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setLoading(false);
      setError(errorMsg);
      return { error: errorMsg };
    }
  };

  // Patient Login
  const login = async (credentials) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${BASE_URL}/login`, credentials);
      const token = res.data.token;
      if (token) {
        localStorage.setItem("token", token);
        setUser(res.data.user);
        setLoading(false);
        return true;
      } else {
        throw new Error("Token not found in response");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Invalid login credentials";
      console.error("❌ Patient Login Error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setLoading(false);
      setError(errorMsg);
      return false;
    }
  };

  // Patient OTP Verification
  const verifyOTP = async (otpData) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${BASE_URL}/verify-otp`, otpData);
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      setLoading(false);
      return res.data;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Invalid OTP. Try again.";
      console.error("❌ OTP Verification Error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setLoading(false);
      setError(errorMsg);
      return { error: errorMsg };
    }
  };

  // Resend OTP
  const resendOTP = async (email, phoneNumber) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${BASE_URL}/resend-otp`, { email, phoneNumber });
      setLoading(false);
      return res.data;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Failed to resend OTP.";
      console.error("❌ Resend OTP Error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setLoading(false);
      setError(errorMsg);
      return { error: errorMsg };
    }
  };

  // Forgot Password
  const forgotPassword = async (data) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${BASE_URL}/forgot-password`, data);
      setLoading(false);
      return { success: true, data: res.data };
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Failed to send reset link.";
      console.error("❌ Forgot Password Error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setLoading(false);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Change Password
  const changePassword = async (data) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${BASE_URL}/change-password`, data);
      setLoading(false);
      return { success: true, data: res.data };
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Failed to change password.";
      console.error("❌ Change Password Error:", errorMsg, {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setLoading(false);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Doctor Signup
  const doctorSignup = async (doctorData) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${BASE_URL1}/doctors/register`, doctorData);
      console.log("🔄 Doctor Signup Response:", res.data);

      // Check if signup was successful (OTP sent)
      if (res.data.msg && res.data.msg.includes("OTP sent")) {
        setLoading(false);
        return { success: true, data: res.data };
      } else {
        throw new Error("Unexpected response: OTP not sent");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Doctor signup failed.";
      console.error("❌ Doctor Signup Error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setLoading(false);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Doctor OTP Verification
  const doctorVerifyOTP = async (otpData) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${BASE_URL1}/doctors/verify-otp`, otpData);
      console.log("🔄 Doctor OTP Verification Response:", res.data);

      const { token, doctor } = res.data;

      if (doctor?.id && token) {
        localStorage.setItem("doctorId", doctor.id);
        localStorage.setItem("token", token);
        setUser({
          id: doctor.id,
          username: doctor.username,
          email: doctor.email,
          role: "doctor",
        });
        setLoading(false);
        return { success: true, doctor, token };
      } else {
        throw new Error("Missing doctor ID or token in response");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Invalid OTP. Try again.";
      console.error("❌ Doctor OTP Verification Error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setLoading(false);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Doctor Login
  const doctorLogin = async (credentials) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${BASE_URL1}/doctors/login`, credentials);
      const { token, doctor } = res.data;

      if (token && doctor?.id) {
        localStorage.setItem("token", token);
        localStorage.setItem("doctorId", doctor.id);
        setUser({
          id: doctor.id,
          username: doctor.username,
          email: doctor.email,
          role: "doctor",
        });
        setLoading(false);
        return { success: true, doctor, token };
      } else {
        throw new Error("Invalid server response: Missing token or doctor data");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Invalid doctor login credentials.";
      console.error("❌ Doctor Login Error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setLoading(false);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Contact Message
  const sendContactMessage = async (contactData) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${BASE_URL}/contact`, contactData);
      setLoading(false);
      return res.data;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Failed to send message.";
      console.error("❌ Contact Message Error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setLoading(false);
      setError(errorMsg);
      return { error: errorMsg };
    }
  };

  // Add Testimonial
  const addTestimonial = async (testimonialData) => {
    try {
      const res = await axios.post(`${BASE_URL1}/testimonials`, testimonialData);
      setTestimonials((prev) => [res.data, ...prev]);
      return res.data;
    } catch (err) {
      console.error("❌ Add Testimonial Error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      return { error: "Failed to submit testimonial." };
    }
  };

  // Fetch Testimonials
  const fetchTestimonials = async () => {
    try {
      const res = await axios.get(`${BASE_URL1}/testimonials`);
      setTestimonials(res.data);
    } catch (err) {
      console.error("❌ Fetch Testimonials Error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("doctorId");
    setUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        loadingUser,
        user,
        setUser,
        signup,
        login,
        logout,
        verifyOTP,
        resendOTP,
        forgotPassword,
        changePassword,
        doctorSignup,
        doctorLogin,
        doctorVerifyOTP,
        sendContactMessage,
        testimonials,
        addTestimonial,
        fetchTestimonials,
        loading,
        error,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;