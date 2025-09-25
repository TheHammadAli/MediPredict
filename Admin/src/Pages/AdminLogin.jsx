import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faUser, faPen } from "@fortawesome/free-solid-svg-icons";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focusedField, setFocusedField] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Admin logged in successfully!");
        localStorage.setItem("adminToken", data.token);
        navigate("/Admin");
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-white px-4">
      <div className="bg-white p-8 rounded-xl border border-gray-300  shadow-xl w-full max-w-md">
        {/* Heading */}
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6 flex items-center justify-center gap-2">
          <FontAwesomeIcon icon={faLock} className="text-blue-600" />
          Admin Login
        </h2>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">

          {/* Email Input */}
          <div className="relative">
            <FontAwesomeIcon icon={faUser} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField("")}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
            {focusedField === "email" && (
              <FontAwesomeIcon icon={faPen} className="absolute right-3 top-3 text-blue-500" />
            )}
          </div>

          {/* Password Input */}
          <div className="relative">
            <FontAwesomeIcon icon={faLock} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField("")}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
            {focusedField === "password" && (
              <FontAwesomeIcon icon={faPen} className="absolute right-3 top-3 text-blue-500" />
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
