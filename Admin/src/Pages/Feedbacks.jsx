import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const Feedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch all feedbacks from backend
  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/feedback/all");
      setFeedbacks(res.data);
    } catch (err) {
      toast.error("Failed to fetch feedbacks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // ✅ Delete a feedback by ID
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/feedback/${id}`);
      toast.success("Feedback deleted.");
      setFeedbacks((prev) => prev.filter((fb) => fb._id !== id));
    } catch (err) {
      toast.error("Error deleting feedback.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-700 mb-4">Feedbacks</h2>
      <p className="text-gray-600 mb-6">
        All feedback messages submitted by registered users are listed below.
       </p>
      {loading ? (
        <p className="text-gray-600">Loading feedbacks...</p>
      ) : feedbacks.length === 0 ? (
        <p className="text-gray-600">No feedbacks yet.</p>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((fb) => (
  <div
    key={fb._id}
    className="p-4 bg-white rounded-lg shadow-xl flex justify-between items-center"
  >
    <div>
      <p className="text-sm text-gray-700">{fb.message}</p>
      <p className="text-xs text-gray-500 mt-1">
        <span className="font-medium text-blue-600">{fb.username}</span> •{" "}
        {new Date(fb.createdAt).toLocaleString()}
      </p>
    </div>
    <button
      onClick={() => handleDelete(fb._id)}
      className="text-red-600 text-sm hover:underline"
    >
      Delete
    </button>
  </div>
))}

        </div>
      )}
    </div>
  );
};

export default Feedbacks;
