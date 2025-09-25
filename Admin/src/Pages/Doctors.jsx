import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);

  // ✅ Fetch all doctors
  const fetchDoctors = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/doctor-profile/all");
      setDoctors(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch doctors:", err);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // ✅ Delete doctor
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/doctor-profile/${id}`);
      toast.success("Doctor removed successfully!");
      setDoctors(doctors.filter((doc) => doc._id !== id));
    } catch (err) {
      toast.error("Failed to remove doctor");
      console.error(err);
    }
  };

  return (
    <>
    <h2 className="text-2xl font-bold text-blue-700 mb-4">All Doctor</h2>
    <p className="text-gray-600">List of all registered doctors are here.</p>
    <div className="p-8">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 auto-rows-min">
  {doctors.map((doctor) => (
    <div
      key={doctor._id}
      className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
    >
      {/* Full-width image with no padding */}
      <div className="h-40 overflow-hidden">
        <img
          src={doctor.imageUrl}
          alt={doctor.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Padding only for content below image */}
      <div className="p-3">
        <h3 className="text-base font-bold text-gray-800">{doctor.name}</h3>
        <p className="text-sm text-gray-500 mb-2">{doctor.speciality}</p>
        <button
          onClick={() => handleDelete(doctor._id)}
          className="mt-2 bg-red-500 text-white text-sm px-4 py-1 rounded hover:bg-red-600"
        >
          Remove
        </button>
      </div>
    </div>
  ))}
</div>

    </div>
    </>
    
  );
};

export default Doctors;
