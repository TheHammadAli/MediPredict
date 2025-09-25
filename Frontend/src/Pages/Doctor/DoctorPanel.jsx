import React, { useContext, useEffect, useState } from "react";
import AppContext from "../../Context/AppContext";
import ProfileContext from "../../Context/ProfileContext";
import AppointmentContext from "../../Context/AppointmentContext";

const DoctorPanel = () => {
  const { user } = useContext(AppContext);
  const { getProfileByEmail } = useContext(ProfileContext);
  const { getDoctorAppointments } = useContext(AppointmentContext);

  const [completion, setCompletion] = useState(0);
  const [todayAppointments, setTodayAppointments] = useState(0);

  useEffect(() => {
    const calculateProfileCompletion = async () => {
      if (user?.email) {
        const profile = await getProfileByEmail(user.email);

        if (profile) {
          const requiredFields = [
            "name",
            "email",
            "speciality",
            "education",
            "experience",
            "fees",
            "address1",
            "about",
            "timing",
            "daysAvailable",
            "imageUrl"
          ];

          const filledCount = requiredFields.filter(
            (field) =>
              Array.isArray(profile[field])
                ? profile[field].length > 0
                : !!profile[field]?.toString().trim()
          ).length;

          const percent = Math.round((filledCount / requiredFields.length) * 100);
          setCompletion(percent);
        }
      }
    };

    const fetchTodayAppointments = async () => {
      if (user?._id) {
        const res = await getDoctorAppointments(user._id);
        const today = new Date().toISOString().split("T")[0]; // Format: yyyy-mm-dd

        const todayCount = res?.filter((appt) =>
          appt.date?.startsWith(today)
        ).length;

        setTodayAppointments(todayCount || 0);
      }
    };

    calculateProfileCompletion();
    fetchTodayAppointments();
  }, [user]);

  return (
    <>
      <h2 className="text-2xl font-bold text-blue-700 mb-4">Doctor Panel</h2>
      <p className="text-gray-600 text-lg mb-2">
        Welcome, Dr. {user?.username}
      </p>
      <p className="text-gray-500 mb-8">
        Manage your daily appointments, check messages, and keep your profile up to date.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300">
          <h3 className="text-xl font-semibold text-blue-600 mb-2">Appointments Today</h3>
          <p className="text-gray-500">
            You have <strong>{todayAppointments}</strong> Appointments scheduled today.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300">
          <h3 className="text-xl font-semibold text-blue-600 mb-2">Profile Completion</h3>
          <p className="text-gray-500">Your profile is <strong>{completion}%</strong> complete.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300">
          <h3 className="text-xl font-semibold text-blue-600 mb-2">Patient Messages</h3>
          <p className="text-gray-500">You have <strong>2</strong> unread messages.</p>
        </div>
      </div>
    </>
  );
};

export default DoctorPanel;
