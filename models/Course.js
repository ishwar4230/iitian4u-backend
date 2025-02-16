const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  course_type: { type: String, required: true, enum:["jee","b_tech","counselling"] },
  course_name: {type: String, required: true, enum:["physics","chemistry","math","all","strategy","placement","counselling"] },

}, { timestamps: true });

module.exports = mongoose.model("Course", courseSchema);