// DoctorChatWindow.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Phone, Video, Paperclip, Smile, Send, PhoneOff, Mic, MicOff, Monitor, Video as VideoIcon, History, ArrowLeft } from "lucide-react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { motion, AnimatePresence } from "framer-motion";
import socket from "../../Socket/socket";
import CallHistory from "../../Components/CallHistory";
import ringtone from "../../assets/simple-ringtone-25290.mp3";
import outgoingTone from "../../assets/outgoing.mp3";

const DoctorChatWindow = () => {
  const { patientId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const patientName = location.state?.patient?.username || "Patient";
  const [doctorId, setDoctorId] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [patientStatus, setPatientStatus] = useState("offline");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  const [incomingCallType, setIncomingCallType] = useState(null);
  const [incomingFrom, setIncomingFrom] = useState(null);
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [showAudioCallModal, setShowAudioCallModal] = useState(false);
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callError, setCallError] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null); // New state variable
  const [localStream, setLocalStream] = useState(null); // State for local stream
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [callStartTime, setCallStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [callStatus, setCallStatus] = useState("Connecting...");

  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const incomingRingRef = useRef(new Audio(ringtone));
  const outgoingRingRef = useRef(new Audio(outgoingTone));
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const screenStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.volume = 1.0;
      remoteVideoRef.current.play().catch(console.error);
    }
  }, [remoteStream]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.muted = true;
      localVideoRef.current.play().catch(console.error);
    }
  }, [localStream]);


  useEffect(() => {
    socket.on("connect", () => {
      console.log("[DoctorChatWindow] Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("[DoctorChatWindow] Socket connection error:", err);
    });

    return () => {
      console.log("[DoctorChatWindow] Socket cleanup");
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setDoctorId(decoded.id);
        console.log("[DoctorChatWindow] Decoded doctorId:", decoded.id);
      } catch (err) {
        console.error("[DoctorChatWindow] Invalid token:", err);
      }
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!doctorId) return;
      try {
        const res = await fetch(`http://localhost:5000/api/chat/get-doctor/${doctorId}`);
        const data = await res.json();
        if (data.success) {
          setProfileId(data.doctor._id);
          console.log("[DoctorChatWindow] Set profileId:", data.doctor._id);
          fetchMessages(data.doctor._id);
        }
      } catch (err) {
        console.error("[DoctorChatWindow] Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, [doctorId]);

  const fetchMessages = async (docId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/chat/history/${docId}/${patientId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("[DoctorChatWindow] Error loading messages:", err);
    }
  };

  useEffect(() => {
    if (!profileId) return;

    const emitOnline = () => {
      console.log("[DoctorChatWindow] Emitting user-online for doctor:", profileId);
      socket.emit("user-online", { userId: profileId, role: "doctor" });
      console.log("[DoctorChatWindow] ✅ Sent user-online:", profileId);
    };

    socket.on("connect", emitOnline);
    if (socket.connected) emitOnline();

    socket.on("call-error", ({ message }) => {
      setCallError(message);
      setShowAudioCallModal(false);
      setShowVideoCallModal(false);
      outgoingRingRef.current.pause();
      outgoingRingRef.current.currentTime = 0;
      setTimeout(() => setCallError(null), 5000);
    });

    socket.on("update-user-status", ({ userId, status }) => {
      console.log("[DoctorChatWindow] Received update-user-status:", userId, status, "patientId:", patientId);
      if (userId === patientId) {
        setPatientStatus(status);
        console.log("[DoctorChatWindow] Updated patientStatus to:", status);
      }
    });

    socket.on("receive-message", (msg) => {
      console.log("[DoctorChatWindow] Received message:", msg);
      setMessages((prev) => {
        const newMessages = [...prev, msg].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        return newMessages;
      });
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    socket.on("incoming-call", ({ fromUserId, offer, callType }) => {
      incomingRingRef.current.loop = true;
      incomingRingRef.current.play().catch(console.error);
      setIncomingCall(true);
      setIncomingCallType(callType);
      setIncomingFrom(fromUserId);
      setIncomingOffer(offer);
    });

    socket.on("call-cancelled", () => {
      console.log("[DoctorChatWindow] Call was cancelled by patient before acceptance/rejection");
      incomingRingRef.current.pause();
      incomingRingRef.current.currentTime = 0;
      setIncomingCall(false);
      setIncomingCallType(null);
      setIncomingFrom(null);
      setIncomingOffer(null);
    });

    socket.on("call-declined", () => {
      console.log("[DoctorChatWindow] Call declined by patient");
      outgoingRingRef.current.pause();
      outgoingRingRef.current.currentTime = 0;
      setShowAudioCallModal(false);
      setShowVideoCallModal(false);
    });


    socket.on("call-accepted", async ({ answer }) => {
      console.log("[DoctorChatWindow] Call accepted by patient, setting remote description");
      outgoingRingRef.current.pause();
      outgoingRingRef.current.currentTime = 0;
      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        setCallStartTime(Date.now());
        setCallStatus("Connected");
      } catch (err) {
        console.error("[DoctorChatWindow] Error setting remote description for answer:", err);
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("[DoctorChatWindow] Added ICE candidate");
      } catch (err) {
        console.error("[DoctorChatWindow] Error adding ICE candidate:", err);
      }
    });

    socket.on("call-ended", () => {
      console.log("[DoctorChatWindow] Call ended by patient");
      endCall();
    });

    return () => {
      socket.off("connect", emitOnline);
      socket.off("update-user-status");
      socket.off("receive-message");
      socket.off("incoming-call");
      socket.off("call-error");
      socket.off("call-declined");
      socket.off("call-cancelled");
      socket.off("call-accepted");
      socket.off("ice-candidate");
      socket.off("call-ended");
    };
  }, [profileId, patientId]);

  useEffect(() => {
    if (profileId && patientId && socket) {
      socket.emit("join-room", { doctorId: profileId, patientId });
      console.log("[DoctorChatWindow] Doctor joined room:", `${profileId}:${patientId}`);
    }
  }, [profileId, patientId]);

  useEffect(() => {
    if (!callStartTime) return;
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - callStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [callStartTime]);


  const handleEmojiSelect = (emoji) => {
    setNewMessage((prev) => prev + emoji.native);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      const messagePayload = {
        doctorId: profileId,
        patientId,
        senderId: profileId,
        senderModel: "DocProfile",
        type: file.type.includes("pdf") ? "file" : "image",
        fileData: base64,
        fileName: file.name,
        timestamp: new Date(),
      };
      await sendMessage(messagePayload);
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = async (payload) => {
    try {
      const res = await fetch("http://localhost:5000/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.messages.length > 0) {
        const savedMessage = data.messages[data.messages.length - 1]; // Get the latest message
        
        // Add to local state immediately for better UX
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === savedMessage._id);
          if (exists) return prev;
          const newMessages = [...prev, savedMessage].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          return newMessages;
        });
        
        // Emit to socket for real-time delivery to other party
        socket.emit("send-message", {
          ...savedMessage,
          doctorId: profileId,
          patientId: patientId,
        });
        setNewMessage("");
      }
    } catch (err) {
      console.error("[DoctorChatWindow] Error sending message:", err);
    } finally {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const payload = {
      doctorId: profileId,
      patientId,
      senderId: profileId,
      senderModel: "DocProfile",
      text: newMessage,
      type: "text",
      timestamp: new Date(),
    };
    sendMessage(payload);
  };

  const handleAcceptCall = () => {
    incomingRingRef.current.pause();
    incomingRingRef.current.currentTime = 0;
    setIncomingCall(false);

    const startWebRTC = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: incomingCallType === "video",
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        localStreamRef.current = stream;
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.muted = true; // Prevent feedback
          localVideoRef.current.play().catch(console.error);
        }

        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        });
        peerConnectionRef.current = pc;

        pc.onicecandidate = (event) => {
          if (event.candidate && socket) {
            socket.emit("ice-candidate", {
              toUserId: incomingFrom,
              candidate: event.candidate,
            });
          }
        };

        pc.ontrack = (event) => {
          console.log("[DoctorChatWindow] Remote stream received:", event.streams[0]);
          const stream = event.streams[0];
          setRemoteStream(stream); // Set the remote stream to state
          if (stream.getVideoTracks().length > 0) {
            console.log("[DoctorChatWindow] Remote stream contains video track.");
          } else {
            console.warn("[DoctorChatWindow] Remote stream does NOT contain video track.");
          }
        };

        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
          console.log("[DoctorChatWindow] Added track to peer connection:", track.kind, track.enabled, "Muted:", track.muted);
        });

        await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
        setCallStartTime(Date.now());
        const answer = await pc.createAnswer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: incomingCallType === "video",
        });
        await pc.setLocalDescription(answer);

        socket.emit("accept-call", {
          toUserId: incomingFrom,
          answer,
        });

        if (incomingCallType === "audio") {
          setShowAudioCallModal(true);
        } else if (incomingCallType === "video") {
          setShowVideoCallModal(true);
        }
      } catch (err) {
        console.error("[DoctorChatWindow] Error accepting call:", err);
        if (err.name === "NotReadableError") {
          setCallError("Camera or microphone is in use by another application. Please close other apps and try again.");
        } else {
          setCallError("Failed to accept call.");
        }
        endCall();
      }
    };

    startWebRTC();
  };

  const handleRejectCall = () => {
    incomingRingRef.current.pause();
    incomingRingRef.current.currentTime = 0;
    setIncomingCall(false);
    socket.emit("call-declined", { toUserId: incomingFrom });
    socket.emit("end-call", { toUserId: incomingFrom });
    endCall();
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    setShowAudioCallModal(false);
    setShowVideoCallModal(false);
    setIsMuted(false);
    setIsCameraOn(true);
    setIsScreenSharing(false);
    setRemoteStream(null); // Clear remote stream on call end
    setLocalStream(null); // Clear local stream on call end
    setCallStartTime(null);
    setElapsedTime(0);
    setCallStatus("Connecting...");
    outgoingRingRef.current.pause();
    outgoingRingRef.current.currentTime = 0;
    incomingRingRef.current.pause();
    incomingRingRef.current.currentTime = 0;
  };

  const handleStartCall = async (type) => {
  if (!profileId || !patientId || !socket.connected) {
    console.error("[DoctorChatWindow] Cannot start call: Missing IDs or socket not connected", {
      profileId,
      patientId,
      socketConnected: socket.connected,
    });
    setCallError("Cannot start call: Connection issue");
    return;
  }

  // Wait briefly to ensure user-online has been processed
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log(`[DoctorChatWindow] Initiating ${type} call to patientId: ${patientId} from profileId: ${profileId}`);

  outgoingRingRef.current.loop = true;
  outgoingRingRef.current.play().catch(console.error);

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: type === "video",
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    localStreamRef.current = stream;
    setLocalStream(stream);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.muted = true; // Prevent feedback
      localVideoRef.current.play().catch(console.error);
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });
    peerConnectionRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("ice-candidate", {
          toUserId: patientId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      console.log("[DoctorChatWindow] Remote stream received:", event.streams[0]);
      const stream = event.streams[0];
      setRemoteStream(stream);
      if (stream.getVideoTracks().length > 0) {
        console.log("[DoctorChatWindow] Remote stream contains video track.");
      } else {
        console.warn("[DoctorChatWindow] Remote stream does NOT contain video track.");
      }
    };

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
      console.log("[DoctorChatWindow] Added track:", track.kind, track.enabled);
    });

    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: type === "video",
    });
    await pc.setLocalDescription(offer);

    socket.emit("call-user", {
      toUserId: patientId,
      fromUserId: profileId,
      callerModel: "DocProfile",
      receiverModel: "Patient",
      offer,
      callType: type,
    });

    if (type === "audio") {
      setShowAudioCallModal(true);
      setCallStatus("Ringing");
    } else if (type === "video") {
      setShowVideoCallModal(true);
      setCallStatus("Ringing");
    }
  } catch (err) {
    console.error("[DoctorChatWindow] Error starting call:", err);
    if (err.name === "NotReadableError") {
      setCallError("Camera or microphone is in use by another application. Please close other apps and try again.");
    } else {
      setCallError("Failed to start call.");
    }
    outgoingRingRef.current.pause();
    outgoingRingRef.current.currentTime = 0;
    setShowAudioCallModal(false);
    setShowVideoCallModal(false);
  }
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg rounded-t-lg"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/20 rounded-full transition"
            title="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center font-bold text-lg shadow-md">
              {patientName?.charAt(0).toUpperCase()}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${patientStatus === "online" ? "bg-green-400" : "bg-gray-400"}`}></div>
          </div>
          <div>
            <h2 className="text-lg font-semibold">{patientName}</h2>
            <p className="text-sm opacity-90">
              {patientStatus === "online" ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCallHistory(true)}
            className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition backdrop-blur-sm"
            title="Call History"
          >
            <History size={20} />
          </motion.button>
          <motion.button
            whileHover={{ scale: patientStatus === "online" ? 1.1 : 1 }}
            whileTap={{ scale: patientStatus === "online" ? 0.95 : 1 }}
            onClick={() => patientStatus === "online" && handleStartCall("audio")}
            className={`p-3 rounded-full transition backdrop-blur-sm ${
              patientStatus === "online"
                ? "bg-white/20 hover:bg-white/30"
                : "bg-gray-400/50 cursor-not-allowed"
            }`}
            title={patientStatus === "online" ? "Audio Call" : "Patient is offline"}
          >
            <Phone size={20} />
          </motion.button>
          <motion.button
            whileHover={{ scale: patientStatus === "online" ? 1.1 : 1 }}
            whileTap={{ scale: patientStatus === "online" ? 0.95 : 1 }}
            onClick={() => patientStatus === "online" && handleStartCall("video")}
            className={`p-3 rounded-full transition backdrop-blur-sm ${
              patientStatus === "online"
                ? "bg-white/20 hover:bg-white/30"
                : "bg-gray-400/50 cursor-not-allowed"
            }`}
            title={patientStatus === "online" ? "Video Call" : "Patient is offline"}
          >
            <Video size={20} />
          </motion.button>
        </div>
      </motion.div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-transparent via-blue-50/30 to-indigo-50/30">
        <AnimatePresence>
          {messages.map((msg, index) => {
            const isSender = msg.senderId === profileId && msg.senderModel === "DocProfile";
            const isPatientMessage = msg.senderId === patientId && msg.senderModel === "Patient";

            if (!isSender && !isPatientMessage) return null;

            return (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex ${isSender ? "justify-end" : "justify-start"} mb-4`}
              >
                <div
                  className={`max-w-xs md:max-w-sm p-4 rounded-2xl text-sm shadow-lg transition-all overflow-x-hidden ${
                    isSender
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                      : "bg-white text-gray-800 rounded-bl-md border border-gray-200"
                  }`}
                >
                  {msg.type === "image" ? (
                    <motion.img
                      src={msg.fileData}
                      alt="sent image"
                      className="rounded-lg max-w-full shadow-sm"
                      whileHover={{ scale: 1.05 }}
                    />
                  ) : msg.type === "file" ? (
                    <div className="flex items-center gap-3 bg-red-50 text-gray-800 p-3 rounded-md shadow-sm">
                      <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                        📄
                      </div>
                      <div className="flex flex-col flex-grow overflow-hidden">
                        <p className="font-semibold truncate">{msg.fileName}</p>
                        <span className="text-xs text-gray-500">PDF Document</span>
                      </div>
                      <a href={msg.fileData} download={msg.fileName} className="text-blue-500 hover:text-blue-700" title="Download">
                        ⬇️
                      </a>
                    </div>
                  ) : (
                    <p className="break-words leading-relaxed whitespace-pre-line">{msg.text}</p>
                  )}
                  <div className={`text-[10px] mt-2 ${isSender ? "text-blue-100" : "text-gray-500"}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="w-full p-4 relative z-10 bg-white/80 backdrop-blur-sm border-t border-gray-200"
      >
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bottom-20 left-4 z-30"
            >
              <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="light" />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-center bg-gray-100 rounded-full shadow-md px-4 py-3">
          <input
            type="file"
            accept="image/*,.pdf"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="text-gray-500 hover:text-blue-500 mr-3 transition"
            onClick={() => fileInputRef.current.click()}
            title="Attach file"
          >
            <Paperclip size={20} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="text-gray-500 hover:text-yellow-500 mr-3 transition"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            title="Emoji"
          >
            <Smile size={20} />
          </motion.button>
          <input
            type="text"
            className="flex-grow bg-transparent focus:outline-none text-sm px-2"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            className="w-10 h-10 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-full ml-2 shadow-md"
            disabled={!newMessage.trim()}
          >
            <Send size={18} />
          </motion.button>
        </div>
      </motion.div>

      {callError && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50"
        >
          <p>{callError}</p>
        </motion.div>
      )}

      {showAudioCallModal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in"
        >
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 w-[360px] shadow-2xl flex flex-col items-center text-center border border-white/20 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
            </div>

            <div className="relative mb-8 mt-4">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-5xl font-bold rounded-full flex items-center justify-center shadow-2xl">
                {patientName?.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold">ONLINE</span>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-2">{patientName}</h3>
            <p className="text-gray-500 mb-4 animate-pulse font-medium">Audio Call • {callStatus}</p>
            {callStatus === "Connected" && (
              <p className="text-gray-600 mb-4 font-mono text-lg">{formatTime(elapsedTime)}</p>
            )}

            <div className="flex items-center justify-center gap-8">
              <button
                onClick={() => {
                  const newMutedState = !isMuted;
                  setIsMuted(newMutedState);
                  const audioTrack = localStreamRef.current?.getAudioTracks()[0];
                  if (audioTrack) {
                    audioTrack.enabled = !newMutedState;
                    console.log("[DoctorChatWindow] Audio track enabled:", audioTrack.enabled);
                  }
                }}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 transform hover:scale-110 ${
                  isMuted
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </button>

              <button
                onClick={() => {
                  socket.emit("call-cancelled", { toUserId: patientId });
                  socket.emit("end-call", { toUserId: patientId });
                  endCall();
                }}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-xl text-white transition-all duration-200 transform hover:scale-110"
              >
                <PhoneOff size={28} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {showVideoCallModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
        >
          <div className="relative w-full h-full">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" srcObject={remoteStream} />
            <div className="absolute bottom-24 right-6 w-56 h-36 rounded-xl overflow-hidden shadow-lg border-2 border-white">
              <video ref={localVideoRef} srcObject={localStream} autoPlay muted playsInline className="w-full h-full object-cover" />
              <div className="absolute bottom-1 left-2 bg-white/80 text-gray-900 text-xs px-2 py-0.5 rounded">
                You (Doctor)
              </div>
            </div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-6 bg-white/60 backdrop-blur-lg rounded-full shadow-lg px-6 py-3">
              <button
                onClick={() => {
                  const audioTrack = localStreamRef.current?.getAudioTracks()[0];
                  if (audioTrack) {
                    audioTrack.enabled = !isMuted;
                    setIsMuted(!isMuted);
                    peerConnectionRef.current?.getSenders().forEach(sender => {
                      if (sender.track === audioTrack) {
                        sender.track.enabled = audioTrack.enabled;
                      }
                    });
                  }
                }}
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow transition ${
                  isMuted ? "bg-gray-500 text-white" : "bg-white text-gray-700 hover:bg-gray-200"
                }`}
                title={isMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
              </button>
              <button
                onClick={() => {
                  const videoTrack = localStreamRef.current?.getVideoTracks()[0];
                  if (videoTrack) {
                    videoTrack.enabled = !videoTrack.enabled;
                    setIsCameraOn(videoTrack.enabled);
                    peerConnectionRef.current?.getSenders().forEach(sender => {
                      if (sender.track === videoTrack) {
                        sender.track.enabled = videoTrack.enabled;
                      }
                    });
                  }
                }}
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow transition ${
                  isCameraOn ? "bg-white text-gray-700 hover:bg-gray-200" : "bg-gray-500 text-white"
                }`}
                title={isCameraOn ? "Turn Off Camera" : "Turn On Camera"}
              >
                <VideoIcon size={22} className={isCameraOn ? "opacity-100" : "opacity-30"} />
              </button>
              <button
                onClick={async () => {
                  if (!isScreenSharing) {
                    try {
                      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                      screenStreamRef.current = screenStream;
                      setLocalStream(screenStream);
                      if (localVideoRef.current) {
                        localVideoRef.current.srcObject = screenStream;
                      }
                      setIsScreenSharing(true);
                      // Replace video track in peer connection
                      peerConnectionRef.current?.getSenders().forEach(sender => {
                        if (sender.track && sender.track.kind === 'video') {
                          sender.replaceTrack(screenStream.getVideoTracks()[0]);
                        }
                      });
                    } catch (err) {
                      console.error("Screen share error:", err);
                    }
                  } else {
                    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
                    setIsScreenSharing(false);
                    // Revert to camera stream
                    const camStream = await navigator.mediaDevices.getUserMedia({
                      video: true,
                      audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                      },
                    });
                    localStreamRef.current = camStream; // Update localStreamRef
                    setLocalStream(camStream);
                    if (localVideoRef.current) {
                      localVideoRef.current.srcObject = camStream;
                      localVideoRef.current.play().catch(console.error);
                    }
                    // Replace video track in peer connection
                    peerConnectionRef.current?.getSenders().forEach(sender => {
                      if (sender.track && sender.track.kind === 'video') {
                        sender.replaceTrack(camStream.getVideoTracks()[0]);
                      }
                    });
                  }
                }}
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow transition ${
                  isScreenSharing ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-200"
                }`}
                title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
              >
                <Monitor size={22} />
              </button>
              <button
                onClick={() => {
                  socket.emit("call-cancelled", { toUserId: patientId });
                  socket.emit("end-call", { toUserId: patientId });
                  endCall();
                }}
                className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg flex items-center justify-center transition"
                title="End Call"
              >
                <PhoneOff size={26} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {incomingCall && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <div className="bg-white rounded-3xl p-8 w-80 shadow-2xl text-center">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {patientName?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Incoming Call</h2>
              <p className="text-lg text-gray-600">{patientName}</p>
              <p className="text-sm text-gray-500">{incomingCallType === "audio" ? "Audio Call" : "Video Call"}</p>
            </div>

            <div className="flex justify-center gap-8">
              <button
                onClick={handleRejectCall}
                className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 transform hover:scale-105"
                title="Decline"
              >
                <PhoneOff size={24} />
              </button>

              <button
                onClick={handleAcceptCall}
                className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 transform hover:scale-105"
                title="Accept"
              >
                <Phone size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {showCallHistory && (
        <CallHistory
          userId={profileId}
          userModel="DocProfile"
          onClose={() => setShowCallHistory(false)}
        />
      )}
    </motion.div>
  );
};

export default DoctorChatWindow;