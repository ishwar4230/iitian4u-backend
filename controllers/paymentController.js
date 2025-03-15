const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/Payment"); // New schema
const UserPlan = require("../models/UserPlan");
const Course = require("../models/Course");
const Plan = require("../models/Plan");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
});


exports.createOrder = async (req, res) => {
    try {
        const { amount } = req.body;
        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `${req.user.id}_${Date.now()}`, // Unique receipt per user
        };

        const order = await razorpay.orders.create(options);
        res.json({ order_id: order.id, key: process.env.RAZORPAY_KEY_ID });
    } catch (error) {
        console.log(error),
        res.status(500).json({ error: "Error creating order" });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            courseType,
            courseName,
            planType,
            amount,
        } = req.body;
        //console.log(razorpay_payment_id,razorpay_order_id,razorpay_signature,courseType,courseName,planType,amount);
        const secret = process.env.RAZORPAY_SECRET;
        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const calculatedSignature = hmac.digest("hex");

        if (calculatedSignature !== razorpay_signature) {
            return res.json({ success: false, message: "Invalid Payment Signature" });
        }

        // Store Payment Details for 2nd level verification
        const newPayment = new Payment({
            user_id: req.user.id,
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id,
            amount: amount,
        });

        const savedPayment = await newPayment.save();

        // Fetch Course ID
        const course = await Course.findOne({ course_type: courseType, course_name: courseName });
        if (!course) {
            return res.status(400).json({ success: false, message: "Invalid course details" });
        }

        // Fetch Plan ID & Total Session Count
        const plan = await Plan.findOne({ course_type: courseType, plan_type: planType });
        if (!plan) {
            return res.status(400).json({ success: false, message: "Invalid plan details" });
        }

        // Check if user already has a plan
        let userPlan = await UserPlan.findOne({ user_id: req.user.id });

        const newPlanData = {
            payment_id: savedPayment._id, // Store Payment Schema ID
            course_id: course._id,
            plan_id: plan._id,
            remaining_slots: plan.total_session_count, // Set as per Plan's session count
            payment_time: new Date(),
        };

        if (userPlan) {
            // If user already has a plan, append to the array
            userPlan.plan_data.push(newPlanData);
            await userPlan.save();
        } else {
            // If user does not have a plan, create a new entry
            userPlan = new UserPlan({
                user_id: req.user.id,
                plan_data: [newPlanData],
            });
            await userPlan.save();
        }

        res.json({ success: true, message: "Payment verified & User Plan updated" });
    } catch (error) {
        console.error("Payment verification failed:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
