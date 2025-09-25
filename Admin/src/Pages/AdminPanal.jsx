import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminPanal = () => {
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [totalSubscribers, setTotalSubscribers] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [patientsRes, doctorsRes, subsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/auth/patients/count"),
          axios.get("http://localhost:5000/api/doctors/count"),
          axios.get("http://localhost:5000/api/newsletter/subscribers/count"),
        ]);

        setTotalPatients(patientsRes.data.count || 0);
        setTotalDoctors(doctorsRes.data.count || 0);
        setTotalSubscribers(subsRes.data.count || 0);
      } catch (err) {
        console.error("❌ Error fetching counts:", err);
      }
    };

    fetchCounts();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-700 mb-4">Admin Panel</h2>
      <p className="text-gray-600 mb-8">Overview of platform statistics.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300">
          <h3 className="text-xl font-semibold text-blue-600 mb-2">Total Patients</h3>
          <p className="text-gray-500">
            There are currently <strong>{totalPatients}</strong> registered patients.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300">
          <h3 className="text-xl font-semibold text-blue-600 mb-2">Total Doctors</h3>
          <p className="text-gray-500">
            There are currently <strong>{totalDoctors}</strong> registered doctors.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300">
          <h3 className="text-xl font-semibold text-blue-600 mb-2">Total Subscribers</h3>
          <p className="text-gray-500">
            <strong>{totalSubscribers}</strong> users subscribed to the newsletter.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanal;
