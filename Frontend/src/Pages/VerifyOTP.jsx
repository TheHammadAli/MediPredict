import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import AppContext from "../Context/AppContext"; // ✅ import context

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useContext(AppContext); // ✅ grab setUser

  const storedEmail = localStorage.getItem("pendingEmail");
  const email = location.state?.email || storedEmail || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error("Session expired. Please sign up again.");
      navigate("/signup");
    }
  }, [email]);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email,
        otp,
      });

      if (res.data?.token) {
        // ✅ Set token and user
        localStorage.removeItem("pendingSignup");
        localStorage.removeItem("pendingEmail");
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user); // ✅ THIS FIXES THE NAVBAR ISSUE

        toast.success("OTP Verified! Account created.");
        navigate("/dashboard");
      } else {
        toast.error(res?.data?.msg || "OTP verification failed.");
      }
    } catch (err) {
      console.error("❌ OTP Error:", err.response?.data || err.message);
      toast.error(err.response?.data?.msg || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/resend-otp", {
        email,
      });
      toast.success(res.data?.msg || "OTP resent.");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
   <div className="flex items-center justify-center min-h-screen bg-white px-4">
  <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-lg p-6">
    <h2 className="text-center text-2xl font-semibold text-gray-800 mb-2">Enter OTP</h2>
    <p className="text-center text-sm text-gray-500 mb-6">
      We sent a 6-digit code to your email
    </p>

    <form onSubmit={handleVerifyOTP} className="space-y-5">
      {/* OTP Input */}
      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value.trim())}
        maxLength={6}
        inputMode="numeric"
        pattern="\d{6}"
        placeholder="------"
        className="w-full text-center tracking-[0.5em] text-2xl font-semibold text-gray-700 bg-gray-100 rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Verify Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-base font-medium py-3 rounded-md transition disabled:opacity-50"
      >
        {loading ? "Verifying..." : "Verify"}
      </button>

      {/* Resend Button */}
      <button
        type="button"
        onClick={handleResendOTP}
        disabled={resending}
        className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium transition disabled:opacity-40"
      >
        {resending ? "Resending..." : "Resend OTP"}
      </button>
    </form>

    <p className="text-center text-xs text-gray-400 mt-6">
      Didn’t receive the code? Check spam or try resending.
    </p>
  </div>
</div>

  );
};

export default VerifyOTP;
