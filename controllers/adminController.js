const Course = require("../models/Course");
const Plan = require("../models/Plan");
const Price = require("../models/Price");
const UserPlan = require("../models/UserPlan");
const Slot = require("../models/Slot");
const Session = require("../models/Session");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const Predictor = require("../models/Predictor");
const Payment = require("../models/Payment");

const convertISTDateTimeToUTC = (dateString, timeString) => {
  const [year, month, day] = dateString.split("-").map(Number); // Extract YYYY-MM-DD
  const [hours, minutes] = timeString.split(":").map(Number); // Extract HH:mm

  const istDate = new Date(Date.UTC(year, month - 1, day, hours, minutes)); // Create Date in UTC
  return new Date(istDate.getTime() - (5.5 * 60 * 60 * 1000)); // Convert IST to UTC
};

const convertUTCtoIST = (utcDate) => {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST Offset in milliseconds
  const istDate = new Date(utcDate.getTime() + istOffset);

  // Format to YYYY-MM-DD and HH:mm
  const dateStr = istDate.toISOString().split("T")[0];
  const timeStr = istDate.toISOString().split("T")[1].substring(0, 5);

  return { start_date: dateStr, start_time: timeStr };
};

// Add Course
exports.addCourse = async (req, res) => {
  try {
    const { course_type, course_name } = req.body;

    if (!course_type || !course_name) {
      return res.status(400).json({ error: "course_type and course_name are required" });
    }

    const newCourse = new Course({ course_type, course_name });
    await newCourse.save();

    res.status(201).json({ message: "Course added successfully", course: newCourse });
  } catch (error) {
    res.status(500).json({ error: "Failed to add course" });
  }
};

// Add Plan
exports.addPlan = async (req, res) => {
  try {
    const { course_type, plan_type, total_session_count } = req.body;

    if (!course_type || !plan_type || !total_session_count) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newPlan = new Plan({ course_type, plan_type, total_session_count });
    await newPlan.save();

    res.status(201).json({ message: "Plan added successfully", plan: newPlan });
  } catch (error) {
    res.status(500).json({ error: "Failed to add plan" });
  }
};

// Add Price
exports.addPrice = async (req, res) => {
  try {
    const { course_type, course_name, plan_type, price } = req.body;

    if (!course_type || !course_name || !plan_type || !price) {
      return res.status(400).json({ error: "All fields (course_type, course_name, plan_type, price) are required" });
    }

    // Find course_id
    const course = await Course.findOne({ course_type, course_name });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Find plan_id
    const plan = await Plan.findOne({ course_type, plan_type });
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    // Check if a price entry exists
    const existingPrice = await Price.findOne({ course_id: course._id, plan_id: plan._id });

    if (existingPrice) {
      // Update existing price
      existingPrice.price = price;
      await existingPrice.save();
      return res.status(200).json({ message: "Price updated successfully", price: existingPrice });
    } else {
      // Create new price entry
      const newPrice = new Price({ course_id: course._id, plan_id: plan._id, price });
      await newPrice.save();
      return res.status(201).json({ message: "Price added successfully", price: newPrice });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to process request" });
  }
};

// Add UserPlan
exports.addUserPlan = async (req, res) => {
  try {
    const { user_id, plan_data } = req.body;

    if (!user_id || !plan_data || typeof plan_data !== "object") {
      return res.status(400).json({ error: "user_id and plan_data object are required" });
    }

    // Validate required fields in plan_data (no need to pass payment_time)
    if (!plan_data.payment_id || !plan_data.course_id || !plan_data.plan_id || plan_data.remaining_slots === undefined) {
      return res.status(400).json({ error: "plan_data must include payment_id, course_id, plan_id, and remaining_slots" });
    }

    // Ensure payment_time is set automatically
    plan_data.payment_time = new Date();

    // Check if user_id already exists in UserPlan
    let userPlan = await UserPlan.findOne({ user_id });

    if (userPlan) {
      userPlan.plan_data.push(plan_data);
      await userPlan.save();
      return res.status(200).json({ message: "Plan added to existing user", userPlan });
    } else {
      const newUserPlan = new UserPlan({ user_id, plan_data: [plan_data] });
      await newUserPlan.save();
      return res.status(201).json({ message: "New UserPlan created", userPlan: newUserPlan });
    }
  } catch (error) {
    console.error("Error adding user plan:", error);
    res.status(500).json({ error: "Failed to add user plan" });
  }
};


exports.addSlot = async (req, res) => {
  try {
    const { start_date, start_time, mentor_phone } = req.body;

    if (!start_date || !start_time) {
      return res.status(400).json({ message: "start_date and start_time are required" });
    }
    // console.log(start_date,start_time);

    // Convert IST Date & Time to UTC
    const utcStartTime = convertISTDateTimeToUTC(start_date, start_time);

    const newSlot = new Slot({
      start_time: utcStartTime,
      mentor_phone: mentor_phone || null, // Optional field
    });

    await newSlot.save();
    res.status(201).json({ message: "Slot added successfully", slot: newSlot });
  } catch (error) {
    console.error("Error adding slot:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.verifyAdminToken = (req, res) => {
  const token = req.cookies.adminToken;

  if (!token) {
    return res.json({ isAdmin: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the decoded ID matches the stored ADMIN_ID
    if (decoded.id === process.env.ADMIN_ID) {
      return res.json({ isAdmin: true });
    } else {
      return res.json({ isAdmin: false });
    }
  } catch (error) {
    return res.json({ isAdmin: false });
  }
};

exports.getUpcomingSessions = async (req, res) => {
  try {
    const now = new Date();

    // Fetch all sessions where slot's start_time is in the future
    const sessions = await Session.find()
      .populate({
        path: "user_id",
        select: "name phone", // Fetch only name & phone
      })
      .populate({
        path: "slot_id",
        select: "start_time", // Fetch only start_time
      })
      .populate({
        path: "course_id",
        select: "course_type course_name", // Fetch course type & name
      });

    // Filter only upcoming sessions (start_time > now)
    const upcomingSessions = sessions.filter(session =>
      session.slot_id && new Date(session.slot_id.start_time) > now
    );

    // Format response
    const sessionData = upcomingSessions.map(session => {
      const { start_date, start_time } = convertUTCtoIST(session.slot_id.start_time);

      return {
        user_name: session.user_id.name,
        user_phone: session.user_id.phone,
        start_date,
        start_time,
        course_type: session.course_id.course_type,
        course_name: session.course_id.course_name,
      };
    });

    res.status(200).json({ sessions: sessionData });
  } catch (error) {
    console.error("Error fetching upcoming sessions:", error);
    res.status(500).json({ error: "Failed to fetch upcoming sessions" });
  }
};

exports.deleteUnbookedOldSlots = async (req, res) => {
  try {
    const now = new Date();

    // Delete all slots where start_time is in the past and booked is false
    const result = await Slot.deleteMany({ start_time: { $lt: now }, booked: false });

    res.status(200).json({ message: "Old unbooked slots deleted successfully", deletedCount: result.deletedCount });
  } catch (error) {
    console.error("Error deleting old unbooked slots:", error);
    res.status(500).json({ error: "Failed to delete old unbooked slots" });
  }
};

exports.getPredictorData = async (req, res) => {
  try {
    // console.log('call came');
    // Fetch all predictor data
    const predictors = await Predictor.find().sort({ createdAt: -1 }); // Sort by latest first

    // Format the response (optional, for better readability)
    const formattedData = predictors.map(predictor => ({
      mobile: predictor.mobile,
      jee_main_rank: predictor.jee_main_rank || "N/A",
      jee_adv_rank: predictor.jee_adv_rank || "N/A",
      category: predictor.category || "N/A",
      gender: predictor.gender || "N/A",
      state: predictor.state || "N/A",
      created_at: predictor.createdAt.toLocaleString(),
      updated_at: predictor.updatedAt.toLocaleString(),
    }));

    res.status(200).json({ data: formattedData });
  } catch (error) {
    console.error("Error fetching predictor data:", error);
    res.status(500).json({ error: "Failed to fetch predictor data" });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
};

// Get all payments with user info
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate("user_id", "name email phone")
      .lean();

    const formattedPayments = payments.map((payment) => ({
      user_name: payment.user_id.name,
      user_email: payment.user_id.email,
      user_phone: payment.user_id.phone,
      payment_id: payment.payment_id,
      order_id: payment.order_id,
      amount: payment.amount,
      payment_time: payment.payment_time,
    }));

    res.status(200).json({ success: true, data: formattedPayments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to fetch payments" });
  }
};

// Get all user plans with user and plan details
exports.getAllUserPlans = async (req, res) => {
  try {
    const userPlans = await UserPlan.find({})
      .populate("user_id", "name email phone")
      .lean();

    const formattedUserPlans = await Promise.all(
      userPlans.map(async (userPlan) => {
        const { user_id, plan_data } = userPlan;
        
        const formattedPlans = await Promise.all(
          plan_data.map(async (plan) => {
            // Fetch course and plan details
            const course = await Course.findById(plan.course_id).lean();
            const planDetails = await Plan.findById(plan.plan_id).lean();

            return {
              course_type: course.course_type,
              course_name: course.course_name,
              plan_type: planDetails.plan_type,
              remaining_slots: plan.remaining_slots,
              payment_time: plan.payment_time,
            };
          })
        );

        return {
          user_name: user_id.name,
          user_email: user_id.email,
          user_phone: user_id.phone,
          plans: formattedPlans,
        };
      })
    );

    res.status(200).json({ success: true, data: formattedUserPlans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to fetch user plans" });
  }
};
//dummy line