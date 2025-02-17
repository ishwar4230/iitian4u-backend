const Slot = require("../models/Slot");
const Session = require("../models/Session");
const Course = require("../models/Course");
const UserPlan = require("../models/UserPlan");
const Plan = require("../models/Plan");

exports.getSlots = async (req, res) => {
  try {
    const now = new Date();
    const minTime = new Date(now.getTime() + 30 * 60 * 1000); // Now + 30 mins
    const maxTime = new Date(now.getTime() + 168 * 60 * 60 * 1000); // Now + 168 hours

    const slots = await Slot.aggregate([
      {
        $match: {
          start_time: { $gte: minTime, $lte: maxTime },
          booked: false // Ignore already booked slots
        }
      },
      {
        $group: {
          _id: "$start_time",
          slot: { $first: "$$ROOT" } // Get any one slot per start_time
        }
      },
      {
        $replaceRoot: { newRoot: "$slot" } // Replace the grouped document with the slot data
      }
    ]);

    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch slots" });
  }
};

exports.bookSlot = async (req, res) => {
  try {
    const { slot_id, course_type, course_name } = req.body;
    const user_id = req.user.id; // Get user ID from authMiddleware

    if (!slot_id || !course_type || !course_name) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const slot = await Slot.findById(slot_id);
    if (!slot) {
      return res.status(404).json({ error: "Slot not found" });
    }
    if (slot.booked) {
      return res.status(400).json({ error: "Slot is already booked" });
    }

    const now_date = new Date();
    const minTime = new Date(now_date.getTime() + 30 * 60 * 1000); // Now + 30 mins
    const maxTime = new Date(now_date.getTime() + 168 * 60 * 60 * 1000); // Now + 168 hours

    if (slot.start_time < minTime || slot.start_time > maxTime) {
      return res.status(400).json({ error: "Slot time is outside the allowed booking window" });
    }

    // Find the course_id based on type and name
    const course = await Course.findOne({ course_type, course_name });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Find the UserPlan of the user
    let userPlan = await UserPlan.findOne({ user_id });
    if (!userPlan || userPlan.plan_data.length === 0) {
      return res.status(400).json({ error: "No active plans found for this user" });
    }

    const now = new Date();
    let planFound = false;

    for (let plan of userPlan.plan_data) {
      if (plan.course_id.toString() === course._id.toString() && plan.remaining_slots > 0) {
        // Fetch plan details
        const planDetails = await Plan.findById(plan.plan_id);
        if (!planDetails) continue;

        // Check plan expiry
        let isExpired = false;
        if (planDetails.plan_type !== "one_time" && planDetails.plan_type !== "life_time") {
          let expiryDate = new Date(plan.payment_time);

          if (planDetails.plan_type === "monthly") expiryDate.setMonth(expiryDate.getMonth() + 1);
          if (planDetails.plan_type === "quarterly") expiryDate.setMonth(expiryDate.getMonth() + 3);
          if (planDetails.plan_type === "yearly") expiryDate.setFullYear(expiryDate.getFullYear() + 1);

          if (now > expiryDate) isExpired = true;
        }

        if (!isExpired) {
          plan.remaining_slots -= 1; // Decrease slot count
          planFound = true;
          break; // Stop after first valid plan is found
        }
      }
    }

    if (!planFound) {
      return res.status(400).json({ error: "No available slots in the user's active plan" });
    }

    // Save the updated UserPlan
    await userPlan.save();

    // Create a new session
    const newSession = new Session({
      user_id,
      slot_id,
      course_id: course._id,
      session_book_time: new Date()
    });
    await newSession.save();

    // Mark the slot as booked instead of deleting it
    await Slot.findByIdAndUpdate(slot_id, { booked: true });

    res.json({ message: "Slot booked successfully", session: newSession, userPlan });
  } catch (error) {
    console.error("Error booking slot:", error);
    res.status(500).json({ error: "Failed to book slot" });
  }
};
