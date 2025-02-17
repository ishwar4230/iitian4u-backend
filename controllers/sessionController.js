const Session = require("../models/Session");
const Slot = require("../models/Slot");
const Course = require("../models/Course");

exports.getUserSessions = async (req, res) => {
  try {
    const user_id = req.user.id; // Get user ID from authMiddleware
    const now = new Date();

    // Fetch all sessions for the user
    const sessions = await Session.find({ user_id });

    if (!sessions || sessions.length === 0) {
      return res.status(404).json({ message: "No sessions found" });
    }

    const sessionData = await Promise.all(
      sessions.map(async (session) => {
        // Get slot details
        const slot = await Slot.findById(session.slot_id);
        if (!slot || new Date(slot.start_time) < now) return null; // Skip past sessions

        // Convert slot time to IST
        const slotIST = new Date(slot.start_time).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

        // Get course details
        const course = await Course.findById(session.course_id);
        if (!course) return null;

        return {
          slot_time: slotIST,
          course_type: course.course_type,
          course_name: course.course_name,
        };
      })
    );

    // Filter out past or invalid sessions
    const filteredSessions = sessionData.filter((session) => session !== null);

    if (filteredSessions.length === 0) {
      return res.status(404).json({ message: "No upcoming sessions found" });
    }

    res.json({ user_sessions: filteredSessions });
  } catch (error) {
    console.error("Error fetching user sessions:", error);
    res.status(500).json({ error: "Failed to fetch user sessions" });
  }
};
