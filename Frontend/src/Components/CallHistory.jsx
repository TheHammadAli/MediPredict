import React, { useEffect, useState } from "react";
import { Phone, Video, PhoneMissed, PhoneOff } from "lucide-react";

const CallHistory = ({ userId, userModel, onClose }) => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCallHistory = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/calls/history/${userId}/${userModel}`);
        const data = await res.json();
        if (data.success) {
          setCalls(data.calls);
        }
      } catch (err) {
        console.error("Error fetching call history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCallHistory();
  }, [userId, userModel]);

  const formatDuration = (seconds) => {
    if (!seconds) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <Phone size={16} className="text-green-500" />;
      case "missed":
        return <PhoneMissed size={16} className="text-red-500" />;
      case "declined":
        return <PhoneOff size={16} className="text-orange-500" />;
      case "cancelled":
        return <PhoneOff size={16} className="text-gray-500" />;
      default:
        return <Phone size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Call History</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : calls.length === 0 ? (
            <div className="text-center text-gray-500">No calls yet</div>
          ) : (
            <ul className="space-y-3">
              {calls.map((call) => {
                const isCaller = call.callerId === userId;
                const otherParty = isCaller ? call.receiverId : call.callerId;
                const otherName = isCaller ? (call.receiverModel === "DocProfile" ? call.receiverId.name : call.receiverId.username) : (call.callerModel === "DocProfile" ? call.callerId.name : call.callerId.username);
                return (
                  <li key={call._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {getStatusIcon(call.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {call.callType === "video" ? <Video size={14} /> : <Phone size={14} />}
                        <span className="font-medium">{otherName || "Unknown"}</span>
                        <span className="text-xs text-gray-500">
                          {isCaller ? "Outgoing" : "Incoming"}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(call.startTime).toLocaleString()}
                        {call.duration > 0 && ` • ${formatDuration(call.duration)}`}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallHistory;