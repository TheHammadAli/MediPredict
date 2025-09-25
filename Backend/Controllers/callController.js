const Call = require("../Model/Call");

// Save a new call record
const saveCall = async (req, res) => {
  try {
    const {
      callerId,
      callerModel,
      receiverId,
      receiverModel,
      callType,
      startTime,
      endTime,
      duration,
      status,
    } = req.body;

    if (!callerId || !callerModel || !receiverId || !receiverModel || !callType) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    const newCall = new Call({
      callerId,
      callerModel,
      receiverId,
      receiverModel,
      callType,
      startTime: startTime ? new Date(startTime) : new Date(),
      endTime: endTime ? new Date(endTime) : null,
      duration,
      status: status || "completed",
    });

    await newCall.save();

    return res
      .status(200)
      .json({ success: true, call: newCall });
  } catch (error) {
    console.error("Error saving call:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get call history for a user (doctor or patient)
const getCallHistory = async (req, res) => {
  try {
    const { userId, userModel } = req.params;

    if (!userId || !userModel) {
      return res
        .status(400)
        .json({ success: false, message: "Missing userId or userModel." });
    }

    const calls = await Call.find({
      $or: [
        { callerId: userId, callerModel: userModel },
        { receiverId: userId, receiverModel: userModel },
      ],
    })
      .populate("callerId", userModel === "DocProfile" ? "name" : "username")
      .populate("receiverId", userModel === "DocProfile" ? "name" : "username")
      .sort({ startTime: -1 });

    return res
      .status(200)
      .json({ success: true, calls });
  } catch (error) {
    console.error("Error fetching call history:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  saveCall,
  getCallHistory,
};