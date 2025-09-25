import React, { useContext, useState } from "react";
import AppContext from "../Context/AppContext";
import { toast } from "sonner";

const Testimonials = () => {
  const { testimonials, loading, addTestimonial, setTestimonials } = useContext(AppContext);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    status: "patient",
    comment: "",
  });

  const getRole = (status) => {
    if (!status) return "Patient";
    return status.trim().charAt(0).toUpperCase() + status.trim().slice(1).toLowerCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await addTestimonial(formData);

    if (!result.error) {
      setTestimonials((prev) => [
        {
          _id: result._id,
          name: formData.name,
          status: formData.status,
          comment: formData.comment,
        },
        ...prev,
      ]);
      toast.success("✅ Testimonial submitted successfully!");
      setFormData({ name: "", status: "patient", comment: "" });
      setShowForm(false);
    } else {
      toast.error("❌ Failed to submit testimonial. Please try again.");
    }
  };

  return (
    <div className="py-16 px-6 max-w-7xl mx-auto relative overflow-hidden">
      {/* Header */}
      <div className="text-center mb-20">
        <h1 className="text-4xl font-bold text-blue-500 mb-4">What Our Customers Say</h1>
        <p className="text-gray-600 text-lg">
          Real stories from doctors and patients who trust our platform every day.
        </p>
      </div>

      {/* Testimonials */}
      <div className="flex flex-wrap justify-center gap-8 mt-16">
        {loading ? (
          <p className="text-gray-600 text-lg">Loading testimonials...</p>
        ) : testimonials.length > 0 ? (
          testimonials.slice(0, 6).map((testimonial) => (
            <div
              key={testimonial._id}
              className="w-80 p-6 border border-gray-200 rounded-lg shadow-md bg-white hover:shadow-xl transition-shadow duration-300"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{testimonial.name}</h3>
              <span
                className={`inline-block px-3 py-1 text-sm font-medium rounded-full mb-4 
                  ${testimonial.status?.toLowerCase() === "doctor"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-green-100 text-green-600"
                  }`}
              >
                {getRole(testimonial.status)}
              </span>
              {testimonial.message && (
                <p className="text-gray-600 italic mb-2">"{testimonial.message}"</p>
              )}
              {testimonial.comment && (
                <div className="mt-2">
                  <p className="text-gray-600 text-sm">{testimonial.comment}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-lg">No testimonials available yet.</p>
        )}
      </div>

      {/* Share Experience Section */}
      <div className="bg-gray-100 text-center py-12 px-6 rounded-lg max-w-4xl mx-auto mt-24 mb-12">
  <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">Share Your Experience</h3>
  <p className="text-gray-600 mt-3 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
    We would love to hear your thoughts and experiences. Your feedback helps us improve and serve you better.
  </p>
  <button
    onClick={() => setShowForm(true)}
    className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium text-sm transition"
    aria-label="Open testimonial submission form"
  >
    Submit Your Thoughts
  </button>
</div>


      {/* Modal Overlay */}
      {showForm && (
  <div
    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 overflow-auto"
    onClick={() => setShowForm(false)}
  >
    <div className="flex justify-center pt-20 min-h-full px-4 sm:px-6">
      {/* Centered Modal */}
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 z-50 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-blue-600">Submit Testimonial</h2>
          <button
            onClick={() => setShowForm(false)}
            className="text-gray-400 hover:text-red-500 text-2xl font-bold transition"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input
              type="text"
              placeholder="e.g. Dr. Sarah Khan"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Role</label>
            <select
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
            </select>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
            <textarea
              rows={4}
              placeholder="Share your experience here..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              required
            />
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-full shadow-md transition-all duration-300"
            >
              Submit Testimonial
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Testimonials;
