import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

const Announcements = () => {
  const [message, setMessage] = useState("");
  const [announcementList, setAnnouncementList] = useState([]);

  // ✅ Submit new announcement
  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/announcement/create", { message });
      toast.success("Announcement posted!");
      setMessage("");
      fetchAnnouncements(); // refresh list
    } catch (err) {
      console.error("Error posting announcement:", err);
      toast.error("Failed to post announcement.");
    }
  };

  // ✅ Get all announcements (optional)
  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/announcement/all"); // If available
      setAnnouncementList(res.data);
    } catch (err) {
      console.error("Error fetching announcements");
    }
  };

  
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/announcement/${id}`);
      toast.success("Announcement deleted!");
      setAnnouncementList((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error("❌ Error deleting announcement:", err);
      toast.error("Failed to delete announcement.");
    }
  };
  

  useEffect(() => {
    fetchAnnouncements();
  }, []);



  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-700 mb-4">Admin Announcement</h2>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows="3"
        className="w-full max-w-2xl p-3 border border-gray-300 rounded-lg mb-4"
        placeholder="Write your announcement here..."
      />

      <div>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Post Announcement
        </button>
      </div>

      <h3 className="text-lg font-semibold mt-10 mb-2 text-gray-800">Previous Announcements:</h3>
      <ul className="space-y-2 max-w-2xl">
  {announcementList.map((a) => (
    <li key={a._id} className=" p-3 rounded shadow-xl flex justify-between items-start">
      <div>
        <p className="text-sm">{a.message}</p>
        <p className="text-xs text-gray-400 mt-1">
          Posted on {new Date(a.createdAt).toLocaleString()}
        </p>
      </div>
      <button
        onClick={() => handleDelete(a._id)}
        className="text-red-600 text-sm hover:underline ml-4"
      >
        Delete
      </button>
    </li>
  ))}
</ul>


    </div>
  );
};

export default Announcements;
