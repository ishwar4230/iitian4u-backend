const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  start_time: { type: Date, required: true },
  mentor_phone: {type: String},
  booked: {type: Boolean,required: true, default: false}
}, { timestamps: true });

module.exports = mongoose.model("Slot", slotSchema);