const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    payment_id: { type: String, required: true },
    order_id: { type: String, required: true },
    amount: { type: Number, required: true },
    payment_time: { type: Date, default: Date.now },
});

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
