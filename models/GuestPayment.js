const mongoose = require("mongoose");

const guestPaymentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String },
  payment_id: { type: String, required: true },
  order_id: { type: String, required: true },
  amount: { type: Number, required: true },
  course_type: { type: String, required: true },
  course_name: { type: String, required: true },
  plan_type: { type: String, required: true },
  payment_time: { type: Date, default: Date.now },
});

module.exports = mongoose.model("GuestPayment", guestPaymentSchema);