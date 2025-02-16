const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming you have a 'User' model
      required: true,
    },
  slot_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot", // Assuming you have a 'User' model
      required: true,
    },
  course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course", // Assuming you have a 'User' model
      required: true,
    },
  session_book_time: { type: Date, required: true, default: Date.now },
  
}, { timestamps: true });

module.exports = mongoose.model("Session", sessionSchema);