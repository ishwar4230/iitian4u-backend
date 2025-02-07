const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String, required: false },
  age: { type: Number, required: false },
  college: { type: String, required: false },
  college_year: { type: Number, required: false },
  image: { type: String, required: false },
  last_login: { type: Date, required: false },

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);