const jwt = require("jsonwebtoken");
const Doctor = require("../Model/Doctor");
const Patient = require("../Model/Patient");
const Pharmacist = require("../Model/Pharmacist");

// Enhanced authentication middleware that identifies user role
const authenticate = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
      success: false, 
      error: {
        code: "MISSING_TOKEN",
        message: "Access denied. No token provided."
      }
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Try to find user in different collections based on token data
    let user = null;
    let userType = null;

    // Check if token has userType field
    if (decoded.userType) {
      userType = decoded.userType;
      switch (userType) {
        case 'doctor':
          user = await Doctor.findById(decoded.id).select("-password");
          break;
        case 'patient':
          user = await Patient.findById(decoded.id).select("-password");
          break;
        case 'pharmacist':
          user = await Pharmacist.findById(decoded.id).select("-password");
          break;
      }
    } else {
      // Fallback: try to find user in all collections
      user = await Doctor.findById(decoded.id).select("-password");
      if (user) {
        userType = 'doctor';
      } else {
        user = await Patient.findById(decoded.id).select("-password");
        if (user) {
          userType = 'patient';
        } else {
          user = await Pharmacist.findById(decoded.id).select("-password");
          if (user) {
            userType = 'pharmacist';
          }
        }
      }
    }

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: {
          code: "INVALID_TOKEN",
          message: "Token is not valid or user not found."
        }
      });
    }

    req.user = user;
    req.userType = userType;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ 
      success: false, 
      error: {
        code: "INVALID_TOKEN",
        message: "Token is not valid."
      }
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.userType || !roles.includes(req.userType)) {
      return res.status(403).json({ 
        success: false, 
        error: {
          code: "INSUFFICIENT_PERMISSIONS",
          message: `Access denied. Required roles: ${roles.join(', ')}`
        }
      });
    }
    next();
  };
};

// Specific role middlewares for convenience
const requireDoctor = [authenticate, authorize('doctor')];
const requirePatient = [authenticate, authorize('patient')];
const requirePharmacist = [authenticate, authorize('pharmacist')];
const requireDoctorOrPatient = [authenticate, authorize('doctor', 'patient')];
const requireDoctorOrPharmacist = [authenticate, authorize('doctor', 'pharmacist')];

module.exports = {
  authenticate,
  authorize,
  requireDoctor,
  requirePatient,
  requirePharmacist,
  requireDoctorOrPatient,
  requireDoctorOrPharmacist
};