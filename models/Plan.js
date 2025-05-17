const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  course_type: { type: String, required: true, enum:["jee","b_tech","counselling"] },
  plan_type: {type: String, required: true, enum:["one_time","monthly","quarterly","yearly","end_to_end"] },
  total_session_count: {type: Number, required: true},
}, { timestamps: true });

module.exports = mongoose.model("Plan", planSchema);