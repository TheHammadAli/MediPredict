import React, { useEffect, useContext } from "react";
import AppointmentContext from "../../Context/AppointmentContext";
import { useNavigate } from "react-router-dom";
import AppContext from "../../Context/AppContext";

const Appointments = () => {
  const { appointments, loading, getDoctorAppointments } = useContext(AppointmentContext);
  const navigate = useNavigate();



  const { user } = useContext(AppContext);

  useEffect(() => {
    if (user && user._id) {
      getDoctorAppointments(user._id);
    }
  }, [user, getDoctorAppointments]);

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Loading appointments...</p>;
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-blue-700 mb-4">Appointments</h2>
      <div className="max-w-5xl mx-auto p-6">
        {appointments.length === 0 ? (
          <p className="text-gray-600">No appointments booked yet.</p>
        ) : (
          <div className="space-y-6">
            {appointments.map((appt) => (
              <div
                key={appt._id}
                className="flex items-center justify-between bg-white p-4 rounded-lg shadow-2xl transition"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-600">
                      {appt.patient?.username || "Unknown Patient"}
                    </h3>
                    <p className="text-sm text-blue-600">
                      Day: {appt.appointmentDate}
                    </p>
                    <p className="text-sm text-blue-600">
                      Time: {appt.appointmentTime}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {appt.paymentStatus === "pending" ? (
                    <span className="text-sm text-red-500 font-medium">Unpaid</span>
                  ) : (
                    <span className="text-sm text-green-600 font-medium">Paid</span>
                  )}
                  <button className="border text-sm px-4 py-1 rounded hover:bg-gray-100">
                    Cancel appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Appointments;
