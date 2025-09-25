const express = require("express");
const router = express.Router();
const {
  addDoctor,
  getAllDoctorProfiles,
  getDoctorProfileByEmail,
  updateDoctorProfile,
  deleteProfile,
} = require("../Controllers/DocProfileController");

const { upload } = require("../Middleware/Multer"); // ✅ FIXED HERE

router.post("/add", upload.single("image"), addDoctor);
router.get("/all", getAllDoctorProfiles);
router.get("/:email", getDoctorProfileByEmail);
router.put("/update/:email", upload.single("image"), updateDoctorProfile);
router.delete("/:id", deleteProfile);

module.exports = router;
