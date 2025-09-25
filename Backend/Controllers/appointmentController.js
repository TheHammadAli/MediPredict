const Appointment = require("../Model/Appointments");
const mongoose = require("mongoose");
const DoctorProfile = require("../Model/DocProfile");
const Patient = require("../Model/Patient");
const Chat = require("../Model/Chat");
const { getIO } = require("../Socket/socketServer");

const bookAppointment = async (req, res) => {
  const { doctorId, patientId, appointmentDate, appointmentTime } = req.body;

  try {
    // Fetch doctor and patient from DB
    const doctor = await DoctorProfile.findById(doctorId);
    const patient = await Patient.findById(patientId);



    // Validation
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    // Save appointment
    const appointment = await Appointment.create({
      doctor: doctor._id,
      patient: patient._id,
      appointmentDate,
      appointmentTime,
    });

    console.log("📌 Appointment saved:", appointment);

    // Create welcome message
    const welcomeMessage = {
      senderId: doctor._id,
      senderModel: "DocProfile",
      text: `Hello ${
        patient?.username || "Guest"
      }, your appointment on ${appointmentDate} at ${appointmentTime} has been successfully confirmed. We will notify you closer to the scheduled time you selected. Thank you for choosing our services.`,
      timestamp: new Date(),
    };

    // Create or update chat thread
    let chat = await Chat.findOne({ doctorId, patientId });

    if (!chat) {
      chat = await Chat.create({
        doctorId,
        patientId,
        messages: [welcomeMessage],
      });
    } else {
      chat.messages.push(welcomeMessage);
      await chat.save();
    }

    // Emit real-time message
    const roomId = [doctorId.toString(), patientId.toString()].sort().join("_");
    console.log("📢 Emitting welcome message to room:", roomId);
    getIO().to(roomId).emit("receive-message", welcomeMessage);

    return res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    console.error("❌ Booking Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getAppointmentsForDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!doctorId || doctorId === "undefined" || !mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ success: false, message: "Invalid or missing doctor ID." });
    }

    const appointments = await Appointment.find({ doctor: doctorId })
      .populate("patient", "username email")
      .sort({ appointmentDate: 1 });

    console.log("📋 Appointments fetched:", appointments);
    return res.status(200).json(appointments);
  } catch (error) {
    console.error("❌ Error fetching appointments:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch appointments." });
  }
};

const getBookedSlots = async (req, res) => {
  const { doctorId } = req.params;
  const { date } = req.query;

  try {
    const query = { doctor: doctorId };
    if (date) {
      query.appointmentDate = date;
    }

    const appointments = await Appointment.find(query).select("appointmentDate appointmentTime");
    res.status(200).json(appointments);
  } catch (err) {
    console.error("❌ Fetch Booked Slots Error:", err);
    res.status(500).json({ message: "Failed to fetch booked slots" });
  }
};

const getAppointmentsForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const appointments = await Appointment.find({ patient: patientId })
      .populate("doctor", "name imageUrl speciality")
      .sort({ appointmentDate: 1 });

    console.log("✅ Appointments found:", appointments);
    res.status(200).json(appointments);
  } catch (error) {
    console.error("❌ Fetch Patient Appointments Error:", error);
    res.status(500).json({ message: "Failed to fetch patient appointments" });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Appointment.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    res.json({
      success: true,
      message: "Appointment deleted successfully",
      appointment: deleted,
    });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};

const getDoctorsForPatientChat = async (req, res) => {
  try {
    const { patientId } = req.params;

    const appointments = await Appointment.find({
      patient: patientId,
      status: { $ne: "cancelled" },
    }).populate("doctor", "name speciality imageUrl");

    const doctorMap = new Map();
    appointments.forEach((appt) => {
      const doc = appt.doctor;
      if (doc && !doctorMap.has(doc._id.toString())) {
        doctorMap.set(doc._id.toString(), doc);
      }
    });

    const uniqueDoctors = Array.from(doctorMap.values());
    res.status(200).json({ success: true, doctors: uniqueDoctors });
  } catch (error) {
    console.error("❌ Error fetching doctors for chat:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  bookAppointment,
  getAppointmentsForDoctor,
  getBookedSlots,
  getAppointmentsForPatient,
  cancelAppointment,
  getDoctorsForPatientChat,
};