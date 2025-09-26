import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { fetchDoctorMessages } from "../../Components/Chat/chatApi";
import socket from "../../Socket/socket";

const DoctorChatList = () => {
  const [doctorId, setDoctorId] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setDoctorId(decoded.id);
      console.log("[DoctorChatList] Decoded Doctor ID:", decoded.id);
    } else {
      console.log("[DoctorChatList] No token found.");
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!doctorId) {
        console.log("[DoctorChatList] Doctor ID not available, skipping profile fetch.");
        return;
      }
      try {
        setLoading(true);
        console.log("[DoctorChatList] Fetching doctor profile for ID:", doctorId);
        const res = await fetch(`http://localhost:5000/api/chat/get-doctor/${doctorId}`);
        const data = await res.json();
        console.log("[DoctorChatList] Doctor profile fetch response:", data);
        if (data.success) {
          const docProfileId = data.doctor._id;
          setProfileId(docProfileId);
          console.log("[DoctorChatList] Profile ID set:", docProfileId);
          const patientsRes = await fetchDoctorMessages(docProfileId);
          console.log("[DoctorChatList] fetchDoctorMessages response:", patientsRes);
          if (patientsRes.success) {
            setPatients(patientsRes.patients);
            console.log("[DoctorChatList] Loaded patients with unreadCount:", patientsRes.patients);
          } else {
            console.error("[DoctorChatList] fetchDoctorMessages failed:", patientsRes.message);
          }
        } else {
          console.error("[DoctorChatList] Failed to fetch doctor profile:", data.message);
        }
      } catch (err) {
        console.error("[DoctorChatList] Error in fetchProfile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [doctorId]);

  useEffect(() => {
    if (!profileId) return;

    socket.on("connect", () => {
      console.log("[DoctorChatList] Socket connected");
      socket.emit("user-online", { userId: profileId, role: "doctor" });
    });

    socket.on("receive-message", (msg) => {
      console.log("[DoctorChatList] Received message:", msg);
      // Update patient list with new message
      setPatients((prev) => {
        return prev.map((patient) => {
          if (patient._id === msg.senderId && msg.senderModel === "Patient") {
            return {
              ...patient,
              latestMessage: msg.text ||
                            (msg.type === "image" ? "📷 Image" :
                             msg.type === "file" ? `📄 ${msg.fileName || "File"}` :
                             patient.latestMessage),
              unreadCount: patient.unreadCount + 1,
              timestamp: msg.timestamp,
            };
          }
          return patient;
        }).sort((a, b) => {
          const timeA = a.timestamp ? new Date(a.timestamp) : new Date(0);
          const timeB = b.timestamp ? new Date(b.timestamp) : new Date(0);
          return timeB - timeA;
        });
      });
    });

    return () => {
      console.log("[DoctorChatList] Cleanup");
    };
  }, [profileId]);

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">Patient Messages</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your patient conversations</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No patient messages</h3>
            <p className="text-gray-500 text-center max-w-sm">
              Your patient conversations will appear here once they start messaging you.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {patients.map((pat) => (
              <div
                key={pat._id}
                onClick={() => navigate(`/docDashboard/messages/${pat._id}`, { state: { patient: pat } })}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
                      {pat.username?.charAt(0).toUpperCase()}
                    </div>
                    {/* Online indicator could be added here if available */}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate text-sm">
                        {pat.username}
                      </h3>
                      <div className="flex items-center gap-2">
                        {pat.timestamp && (
                          <span className="text-xs text-gray-500">
                            {new Date(pat.timestamp).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 break-words flex-1 mr-3 overflow-x-hidden">
                        {pat.latestMessage || "Start chatting..."}
                      </p>

                      {/* Unread badge */}
                      {(pat.unreadCount ?? 0) > 0 && (
                        <div className="flex-shrink-0">
                          <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                            {pat.unreadCount > 99 ? '99+' : pat.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chevron */}
                  <div className="flex-shrink-0 text-gray-400 group-hover:text-gray-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorChatList;
