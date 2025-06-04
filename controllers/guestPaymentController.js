const Razorpay = require("razorpay");
const crypto = require("crypto");
const GuestPayment = require("../models/GuestPayment");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `guest_${Date.now()}`,
    });
    res.json({ order_id: order.id, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ error: "Order creation failed" });
  }
};

exports.verifyGuestPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      name,
      mobile,
      email,
      amount,
      courseType,
      courseName,
      planType,
    } = req.body;

    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const expectedSignature = hmac.digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const payment = new GuestPayment({
      name,
      mobile,
      email,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      amount,
      course_type: courseType,
      course_name: courseName,
      plan_type: planType,
    });

    await payment.save();
    res.json({ success: true, message: "Payment verified and saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};
