const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "DocProfile", required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  appointmentDate: { type: Date, required: true },
  appointmentTime: { type: String, required: true }, 
  status: {
    type: String,
    enum: ["active", "cancelled"],
    default: "active"
  },
  cancelledAt: Date
}, { timestamps: true });

module.exports = mongoose.model("Appointment", AppointmentSchema);
