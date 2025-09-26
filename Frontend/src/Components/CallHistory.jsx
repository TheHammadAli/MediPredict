import React, { useEffect, useState } from "react";
import { Phone, Video, PhoneMissed, PhoneOff, X, History } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden border border-white/20">
        <div className="p-6 border-b border-gray-200/50 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <History size={20} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Call History</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
          >
            <X size={16} className="text-gray-600" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[65vh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-medium">Loading call history...</p>
            </div>
          ) : calls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Phone size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No calls yet</h3>
              <p className="text-gray-500 text-sm max-w-xs">Your call history will appear here once you make or receive calls.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {calls.map((call) => {
                const isCaller = call.callerId === userId;
                const otherParty = isCaller ? call.receiverId : call.callerId;
                const otherName = isCaller ? (call.receiverModel === "DocProfile" ? call.receiverId.name : call.receiverId.username) : (call.callerModel === "DocProfile" ? call.callerId.name : call.callerId.username);
                return (
                  <li key={call._id} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                    <div className="flex-shrink-0">
                      {getStatusIcon(call.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          call.callType === "video" ? "bg-blue-100" : "bg-green-100"
                        }`}>
                          {call.callType === "video" ? (
                            <Video size={12} className="text-blue-600" />
                          ) : (
                            <Phone size={12} className="text-green-600" />
                          )}
                        </div>
                        <span className="font-semibold text-gray-800 truncate">{otherName || "Unknown"}</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          isCaller
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {isCaller ? "Outgoing" : "Incoming"}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>{new Date(call.startTime).toLocaleDateString([], {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                        {call.duration > 0 && (
                          <>
                            <span>•</span>
                            <span className="font-mono">{formatDuration(call.duration)}</span>
                          </>
                        )}
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