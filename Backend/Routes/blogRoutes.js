const express = require("express");
const router = express.Router();
const { upload } = require("../Middleware/Multer"); 
const protect = require("../Middleware/authDoctor");
const {
  uploadBlog,
  getAllBlogs,
  getBlogsByDoctor,
  getBlogById,
  deleteBlog,
} = require("../Controllers/blogController");

// Protected: Upload and delete
router.post("/upload", protect, upload.single("bannerImage"), uploadBlog);
router.delete("/:blogId", protect, deleteBlog);

// Public
router.get("/", getAllBlogs);
router.get("/doctor/:doctorId", getBlogsByDoctor);
router.get("/:blogId", getBlogById);

module.exports = router;
