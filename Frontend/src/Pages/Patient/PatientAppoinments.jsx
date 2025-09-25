import React, { useContext, useEffect, useState } from "react";
import AppointmentContext from "../../Context/AppointmentContext";
import AppContext from "../../Context/AppContext";
import { toast } from "sonner";

const PatientAppointments = () => {
  const {
    appointments,
    setAppointments,
    getPatientAppointments,
    cancelAppointment,
    loading,
  } = useContext(AppointmentContext);
  const { user } = useContext(AppContext);

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedApptId, setSelectedApptId] = useState(null);

  useEffect(() => {
    if (user?._id) {
      getPatientAppointments(user._id);
    }
  }, [user]);

  const handlePay = (appointmentId) => {
    toast("💳 Payment functionality coming soon!");
  };

  const confirmCancel = (appointmentId) => {
    setSelectedApptId(appointmentId);
    setShowConfirm(true);
  };

  const handleCancelConfirmed = async () => {
    setShowConfirm(false);
    try {
      const result = await cancelAppointment(selectedApptId);
      if (result.success) {
        setAppointments((prev) =>
          prev.filter((appt) => appt._id !== selectedApptId)
        );
        toast.success("✅ Appointment cancelled successfully.");
      } else {
        toast.error("❌ Failed to cancel the appointment.");
      }
    } catch (err) {
      toast.error("⚠️ Unexpected error occurred while cancelling.");
    }
  };

  const visibleAppointments = appointments.filter(
    (appt) => appt?.doctor && appt.status !== "cancelled"
  );

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <h2 className="text-3xl font-bold text-blue-500 text-center mb-10">
        My Appointments
      </h2>

      {loading ? (
        <p className="text-center text-gray-500 italic">Loading appointments...</p>
      ) : visibleAppointments.length === 0 ? (
        <p className="text-center text-gray-400 italic">No appointments booked yet.</p>
      ) : (
        <div className="grid gap-6">
          {visibleAppointments.map((appt) => (
            <div
              key={appt._id}
              className="relative flex flex-col sm:flex-row bg-white rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden border-l-4"
              style={{
                borderColor:
                  appt.paymentStatus === "paid" ? "#16a34a" : "#3B82F6", // green or amber
              }}
            >
              {/* Doctor Image */}
              <div className="flex-shrink-0 p-5 flex items-center justify-center">
                <img
                  src={appt.doctor.imageUrl || "https://via.placeholder.com/100"}
                  alt="Doctor"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                />
              </div>

              {/* Content */}
              <div className="flex-1 p-5">
                <h3 className="text-xl font-semibold text-gray-900">
                  Dr. {appt.doctor.name}
                </h3>
                <p className="text-sm text-teal-600">{appt.doctor.speciality}</p>

                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-700">
                  <p>
                    <span className="font-semibold">📅 Date:</span>{" "}
                    {new Date(appt.appointmentDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p>
                    <span className="font-semibold">⏰ Time:</span>{" "}
                    {appt.appointmentTime}
                  </p>
                </div>

                {/* Status Badges */}
                <div className="mt-4 flex gap-2">
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      appt.paymentStatus === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {appt.paymentStatus === "paid" ? "Paid" : "Pending Payment"}
                  </span>
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      appt.status === "confirmed"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {appt.status}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="p-5 flex flex-col gap-2 sm:items-end sm:justify-center">
                {appt.paymentStatus !== "paid" && (
                  <button
                    onClick={() => handlePay(appt._id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
                  >
                    Pay Now
                  </button>
                )}
                <button
                  onClick={() => confirmCancel(appt._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center animate-fadeIn">
            <h3 className="text-xl font-bold text-red-600 mb-3">
              Cancel Appointment?
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Are you sure you want to cancel this appointment? This action
              cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleCancelConfirmed}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
              >
                Yes, Cancel
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
              >
                No, Keep
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;
