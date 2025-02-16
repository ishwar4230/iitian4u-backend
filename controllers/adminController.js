const Course = require("../models/Course");
const Plan = require("../models/Plan");
const Price = require("../models/Price");
const UserPlan = require("../models/UserPlan");
const Slot = require("../models/Slot");

const convertISTDateTimeToUTC = (dateString, timeString) => {
    const [year, month, day] = dateString.split("-").map(Number); // Extract YYYY-MM-DD
    const [hours, minutes] = timeString.split(":").map(Number); // Extract HH:mm
  
    const istDate = new Date(Date.UTC(year, month - 1, day, hours, minutes)); // Create Date in UTC
    return new Date(istDate.getTime() - (5.5 * 60 * 60 * 1000)); // Convert IST to UTC
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
    const { course_id, plan_id, price } = req.body;

    if (!course_id || !plan_id || !price) {
      return res.status(400).json({ error: "course_id, plan_id, and price are required" });
    }

    const newPrice = new Price({ course_id, plan_id, price });
    await newPrice.save();

    res.status(201).json({ message: "Price added successfully", price: newPrice });
  } catch (error) {
    res.status(500).json({ error: "Failed to add price" });
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
