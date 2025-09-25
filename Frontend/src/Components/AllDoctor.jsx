import React, { useContext, useEffect, useState } from "react";
import ProfileContext from "../Context/ProfileContext";
import AppointmentContext from "../Context/AppointmentContext";
import AppContext from "../Context/AppContext";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";

// 🔹 Helper function to get remaining dates grouped by weekday
const getRemainingDatesGroupedByWeekday = (daysArray) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const todayDate = today.getDate();

  const dayNameToIndex = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const result = {};

  for (const dayName of daysArray) {
    const targetDay = dayNameToIndex[dayName];
    const matchedDates = [];

    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let d = todayDate + 1; d <= lastDay; d++) {
      const localDate = new Date(currentYear, currentMonth, d);
      if (localDate.getDay() === targetDay) {
        const yyyy = localDate.getFullYear();
        const mm = String(localDate.getMonth() + 1).padStart(2, "0");
        const dd = String(localDate.getDate()).padStart(2, "0");
        matchedDates.push(`${yyyy}-${mm}-${dd}`);
      }
    }

    result[dayName] = matchedDates;
  }

  return result;
};

const AllDoctor = () => {
  const { profiles, fetchProfiles } = useContext(ProfileContext);
  const { bookAppointment, getBookedSlots } = useContext(AppointmentContext);
  const { user } = useContext(AppContext);

  const [selectedSpeciality, setSelectedSpeciality] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [activeDay, setActiveDay] = useState(null);
  const [activeTime, setActiveTime] = useState(null);
  const [bookedTimes, setBookedTimes] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const concernQuery = queryParams.get("concern");

  const navigate = useNavigate();

  // Handle concern query for speciality
  useEffect(() => {
    if (concernQuery) {
      const concernToSpecialityMap = {
        heart: "Cardiologist",
        fever: "General physician",
        skin: "Dermatologist",
        brain: "Neurologist",
        child: "Pediatrician",
        stomach: "Gastroenterologist",
        pregnancy: "Gynecologist",
        cough: "General physician",
      };
      const matched = Object.keys(concernToSpecialityMap).find((keyword) =>
        concernQuery.toLowerCase().includes(keyword)
      );
      if (matched) setSelectedSpeciality(concernToSpecialityMap[matched]);
    }
  }, [concernQuery]);

  // Fetch doctor profiles
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // Fetch booked times when doctor, day, or date changes
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      const fetchBookedTimes = async () => {
        try {
          const slots = await getBookedSlots(selectedDoctor._id, selectedDate);
          setBookedTimes(slots);
          setActiveTime(null); // Reset time when slots update
        } catch (err) {
          console.error("Error fetching booked times:", err);
          toast.error("Failed to load booked times");
        }
      };
      fetchBookedTimes();
    }
  }, [selectedDoctor, selectedDate, getBookedSlots]);

  const specialties = [
    "All",
    "General physician",
    "Gynecologist",
    "Dermatologist",
    "Pediatrician",
    "Neurologist",
    "Gastroenterologist",
    "Cardiologist",
  ];

  const isProfileComplete = (profile) => {
    const requiredFields = [
      "name",
      "email",
      "speciality",
      "education",
      "experience",
      "fees",
      "address1",
      "timing",
      "daysAvailable",
      "about",
      "imageUrl",
    ];
    return requiredFields.every((field) => {
      const value = profile[field];
      return Array.isArray(value) ? value.length > 0 : value?.toString().trim();
    });
  };

  const filteredDoctors =
    profiles?.filter(isProfileComplete)?.filter((doc) =>
      selectedSpeciality === "All" ? true : doc.speciality === selectedSpeciality
    ) || [];

  const getNextDay = (day) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const index = days.indexOf(day);
    return days[(index + 1) % 7];
  };

  const isDoctorAvailableNow = (doc) => {
    if (!doc?.timing || !doc?.daysAvailable?.length) return false;

    const now = new Date();
    const currentDay = now.toLocaleDateString("en-US", { weekday: "long" });
    const nowTime = now.getHours() + now.getMinutes() / 60;

    const parseTime = (str) => {
      str = str.trim().toUpperCase();
      let hours, minutes;

      const match = str.match(/^(\d+)(?::(\d+))?(?:\.(\d+))?\s*(AM|PM)?$/);
      if (!match) {
        console.warn("Invalid time format:", str);
        return NaN;
      }

      hours = Number(match[1]);
      minutes = Number(match[2] || match[3] || 0);
      const modifier = match[4];

      if (isNaN(minutes)) minutes = 0;

      if (modifier === "PM" && hours !== 12) {
        hours += 12;
      } else if (modifier === "AM" && hours === 12) {
        hours = 0;
      }

      // If the hour is already 13 or greater, and a modifier was present,
      // it implies the modifier was redundant or the input is mixed.
      // In this case, assume it's already 24-hour and ignore the modifier's effect.
      if (hours >= 24) {
        hours -= 12;
      }

      return hours + minutes / 60;
    };

    try {
      const [startStr, endStr] = doc.timing.split(" - ");
      const start = parseTime(startStr);
      const end = parseTime(endStr);

      const isToday = doc.daysAvailable.some(
        (day) => day.toLowerCase() === currentDay.toLowerCase()
      );
      const nextDay = getNextDay(currentDay);
      const isNext = doc.daysAvailable.some(
        (day) => day.toLowerCase() === nextDay.toLowerCase()
      );

      if (start < end) {
        return isToday && nowTime >= start && nowTime <= end;
      }

      return (isToday && nowTime >= start) || (isNext && nowTime <= end);
    } catch {
      return false;
    }
  };

  const handleDaySelection = async (day) => {
    const available = isDoctorAvailableNow(selectedDoctor);
    if (!available) {
      toast.error("Doctor is not available now");
      return;
    }
    setActiveDay(day);
    setActiveTime(null);
    setSelectedDate("");
    const grouped = getRemainingDatesGroupedByWeekday([day]);
    setAvailableDates(grouped[day] || []);
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    setActiveTime(null);
  };

  const handleBook = async () => {
    if (!user || !user._id) {
      toast.error("Please login to book an appointment.");
      navigate("/signup");
      return;
    }
    if (!selectedDoctor || !activeDay || !activeTime || !selectedDate) {
      toast.error("Please select day, date, and time to book.");
      return;
    }

    const formData = {
      doctorId: selectedDoctor._id,
      patientId: user._id,
      appointmentDate: selectedDate,
      appointmentTime: activeTime,
    };

    try {
      const result = await bookAppointment(formData);
      if (result.success) {
        toast.success("Appointment booked successfully!");
        // Fetch updated booked times
        const slots = await getBookedSlots(selectedDoctor._id, selectedDate);
        setBookedTimes(slots);
        setActiveTime(null);
        setShowModal(false);
        setActiveDay(null);
        setSelectedDate("");
      } else {
        toast.error(result.message || "Booking failed.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      toast.error("Failed to book appointment.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 overflow-x-hidden">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full lg:w-48 shrink-0 mb-4 lg:mb-0">
          <ul className="space-y-3">
            {specialties.map((spec) => (
              <li key={spec}>
                <button
                  onClick={() => setSelectedSpeciality(spec)}
                  className={`w-full px-3 py-2 rounded-full border transition text-left text-sm ${
                    selectedSpeciality === spec
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                  }`}
                >
                  {spec}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Doctor Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doc) => (
              <div
                key={doc._id}
                onClick={() => {
                  if (!user || !user._id) {
                    toast.error("Please sign up to book a doctor.");
                    navigate("/signup");
                    return;
                  }
                  setSelectedDoctor(doc);
                  setShowModal(true);
                }}
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:scale-[1.02] transition-transform duration-300 ease-in-out cursor-pointer overflow-hidden h-[260px]"
              >
                <div className="w-full h-40 overflow-hidden">
                  <img
                    src={doc.imageUrl}
                    alt={doc.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="px-3 py-2">
                  <p
                    className={`text-xs font-medium mb-1 ${
                      isDoctorAvailableNow(doc)
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    ● {isDoctorAvailableNow(doc) ? "Available Now" : "Not Available"}
                  </p>
                  <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                    Dr. {doc.name}
                  </h3>
                  <p className="text-xs text-gray-500">{doc.speciality}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full text-gray-500 text-center">
              No doctors found.
            </p>
          )}
        </section>
      </div>

      {/* Main Doctor Modal */}
      {showModal && selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md overflow-y-auto scrollbar-hide px-4 py-10">
          <div className="bg-white rounded-2xl max-w-4xl mx-auto shadow-xl relative">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold"
            >
              ×
            </button>

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center gap-4 border-b p-6 bg-gradient-to-r from-blue-50 to-white rounded-t-2xl">
              <img
                src={selectedDoctor.imageUrl}
                alt={selectedDoctor.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-blue-700">
                  Dr. {selectedDoctor.name}
                </h2>
                <p className="text-sm text-gray-500">{selectedDoctor.speciality}</p>
                <span
                  className={`text-xs font-medium mt-1 inline-block rounded px-2 py-1 ${
                    isDoctorAvailableNow(selectedDoctor)
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  ● {isDoctorAvailableNow(selectedDoctor) ? "Available Now" : "Not Available"}
                </span>
              </div>
            </div>

            {/* Info Section */}
            <div className="p-6 text-sm text-gray-700">
              <p><strong>Experience:</strong> {selectedDoctor.experience}</p>
              <p><strong>Fees:</strong> ${selectedDoctor.fees}</p>
              <p><strong>Timing:</strong> {selectedDoctor.timing}</p>
              <p><strong>Available Days:</strong> {selectedDoctor.daysAvailable?.join(", ")}</p>
              <p className="mt-2"><strong>About:</strong> {selectedDoctor.about || "No description provided."}</p>

              {/* Day Selection */}
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedDoctor.daysAvailable?.map((day, i) => {
                  const available = isDoctorAvailableNow(selectedDoctor);
                  return (
                    <button
                      key={i}
                      onClick={() => handleDaySelection(day)}
                      disabled={!available}
                      className={`px-3 py-1 rounded-full border text-sm font-medium transition ${
                        activeDay === day
                          ? "bg-blue-600 text-white"
                          : !available
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-gray-100 text-gray-700 hover:bg-blue-50"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Date and Time Dropdowns */}
              {availableDates.length > 0 && selectedDoctor.timing && activeDay && (
                <div className="mt-4 flex flex-col md:flex-row gap-4 items-start">
                  {/* Date Dropdown */}
                  <div className="w-full md:w-1/2">
                    <label className="text-sm font-medium text-gray-700">Select Date</label>
                    <select
                      value={selectedDate}
                      onChange={handleDateChange}
                      className="w-full mt-1 p-2 border rounded-lg bg-white"
                    >
                      <option value="">Choose a date</option>
                      {availableDates.map((date, idx) => (
                        <option key={idx} value={date}>
                          {new Date(date).toDateString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Time Dropdown */}
                  <div className="w-full md:w-1/2">
                    <label className="text-sm font-medium text-gray-700">Select Time</label>
                    <select
                      value={activeTime || ""}
                      onChange={(e) => setActiveTime(e.target.value)}
                      className="w-full mt-1 p-2 border rounded-lg bg-white"
                    >
                      <option value="">Choose a time</option>
                      {(() => {
                        const [start, end] = selectedDoctor.timing.split(" - ");
                        const parseTime = (str) => {
                          const [time, ampm] = str.split(" ");
                          let [h, m] = time.includes(":")
                            ? time.split(":").map(Number)
                            : time.split(".").map(Number);
                          if (isNaN(m)) m = 0;
                          if (ampm === "PM" && h !== 12) h += 12;
                          if (ampm === "AM" && h === 12) h = 0;
                          return h * 60 + m;
                        };
                        const formatTime = (min) => {
                          let h = Math.floor(min / 60);
                          const m = min % 60;
                          const ampm = h >= 12 ? "PM" : "AM";
                          h = h % 12 || 12;
                          return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
                        };
                        const startM = parseTime(start);
                        const endM = parseTime(end);
                        const slots = [];

                        if (startM < endM) {
                          for (let m = startM; m <= endM; m += 30) slots.push(formatTime(m));
                        } else {
                          for (let m = startM; m < 1440; m += 30) slots.push(formatTime(m));
                          for (let m = 0; m <= endM; m += 30) slots.push(formatTime(m));
                        }

                        return slots
                          .filter((time) => !bookedTimes.includes(time))
                          .map((time, idx) => (
                            <option key={idx} value={time}>
                              {time}
                            </option>
                          ));
                      })()}
                    </select>
                  </div>
                </div>
              )}

              {/* Book Button */}
              <button
                className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                onClick={handleBook}
                disabled={!selectedDate || !activeTime}
              >
                Book Appointment
              </button>

              {/* Review Section */}
              <div className="mt-8 p-6 rounded-xl bg-gray-50 shadow-inner">
                <h3 className="text-lg font-bold text-gray-800 mb-4">⭐ Patient Reviews</h3>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="bg-blue-700 text-white px-4 py-2 rounded text-lg font-bold">5/5</div>
                  <p className="text-sm text-gray-600">Based on 286 reviews</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span>Patient Satisfaction</span>
                      <span>4.8</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "96%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span>Diagnosis</span>
                      <span>4.7</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                      <div className="bg-blue-400 h-2 rounded-full" style={{ width: "94%" }}></div>
                    </div>
                  </div>
                </div>

                {/* Comments */}
                <div className="mt-6">
                  <h4 className="font-semibold mb-2 text-gray-700">Patient Feedback</h4>
                  <ul className="space-y-2 text-sm text-gray-600 max-h-48 overflow-y-auto">
                    <li className="bg-white p-3 rounded shadow-sm">
                      "Dr. Smith was very attentive and helpful!"
                    </li>
                    <li className="bg-white p-3 rounded shadow-sm">
                      "Quick diagnosis and very accurate."
                    </li>
                    <li className="bg-white p-3 rounded shadow-sm">
                      "I loved the video consultation. Smooth experience."
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllDoctor;