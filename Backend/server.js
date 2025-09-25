require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./Config/db");
const http = require("http");
const { setupSocket } = require("./Socket/socketServer");

const authRoutes = require("./Routes/authPatient");
const testimonialRoutes = require("./Routes/testimonialRoutes");
const doctorRoutes = require("./Routes/doctorRoutes");
const doctorProfileRoutes = require("./Routes/docProfileRoutes");
const appointmentRoutes = require("./Routes/appointmentRoutes");
const newsletterRoutes = require("./Routes/subscriberRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const feedbackRoutes = require("./Routes/feedbackRoutes");
const announcementRoutes = require("./Routes/announcementRoutes");
const chatRoutes = require("./Routes/chatRoutes");
const callRoutes = require("./Routes/callRoutes");
const blogRoutes = require("./Routes/blogRoutes");
const prescriptionRoutes = require("./Routes/prescriptionRoutes");

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];
      // allow requests with no origin like mobile apps or curl
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);


// Register API routes
app.use("/api/auth", authRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/doctor-profile", doctorProfileRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/announcement", announcementRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/prescriptions", prescriptionRoutes);

// Start server after successful DB connection
let isServerRunning = false;
const startServer = async () => {
  if (isServerRunning) {
    console.log("[Server] Server is already running, skipping initialization.");
    return;
  }
  try {
    console.log(`[Server] Starting server initialization...`);
    await connectDB();
    console.log(
      `[Server] Database connection established, setting up Socket.IO`
    );
    setupSocket(server);

    const PORT = process.env.PORT;
    server.listen(PORT, () => {
      console.log(`✅ [Server] Running with Socket.IO on port ${PORT}`);
      isServerRunning = true;
    });
  } catch (error) {
    console.error(`❌ [Server] Failed to start server: ${error.message}`);
    console.error(`[Server] Error stack:`, error.stack);
    process.exit(1);
  }
};

startServer();
