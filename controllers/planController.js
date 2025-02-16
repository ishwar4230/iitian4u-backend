const UserPlan = require("../models/UserPlan");
const Plan = require("../models/Plan");
const Course = require("../models/Course");

// Function to calculate expiry time
const getPlanExpiryTime = (planType, paymentTime) => {
  if (planType === "one_time" || planType === "life_time") {
    return null; // These plans don't expire
  }

  const paymentDate = new Date(paymentTime);
  let expiryDate = new Date(paymentDate);

  if (planType === "monthly") {
    expiryDate.setMonth(expiryDate.getMonth() + 1);
  } else if (planType === "quarterly") {
    expiryDate.setMonth(expiryDate.getMonth() + 3);
  } else if (planType === "yearly") {
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  }

  return expiryDate; // Returns expiry date
};

// Function to check if a plan is expired
const isPlanExpired = (planType, paymentTime) => {
  if (planType === "one_time" || planType === "life_time") {
    return false; // These never expire
  }

  const now = new Date();
  const paymentDate = new Date(paymentTime);
  let expiryDate = new Date(paymentDate);

  if (planType === "monthly") {
    expiryDate.setMonth(expiryDate.getMonth() + 1);
  } else if (planType === "quarterly") {
    expiryDate.setMonth(expiryDate.getMonth() + 3);
  } else if (planType === "yearly") {
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  }

  return now > expiryDate; // Returns true if expired
};

// Controller: Get Active Plans
exports.getActivePlans = async (req, res) => {
  try {
    const user_id = req.user.id;
    const userPlan = await UserPlan.findOne({ user_id });

    if (!userPlan || userPlan.plan_data.length === 0) {
      return res.status(404).json({ message: "No active plans found" });
    }

    const activePlans = [];
    for (const plan of userPlan.plan_data) {
      if (plan.remaining_slots > 0) {
        const planDetails = await Plan.findById(plan.plan_id);
        const courseDetails = await Course.findById(plan.course_id);
        if (!planDetails || !courseDetails) continue;

        if (!isPlanExpired(planDetails.plan_type, plan.payment_time)) {
          activePlans.push({
            course_type: courseDetails.course_type,
            course_name: courseDetails.course_name,
            plan_type: planDetails.plan_type,
            remaining_slots: plan.remaining_slots,
            expiry_time: getPlanExpiryTime(planDetails.plan_type, plan.payment_time),
          });
        }
      }
    }

    res.json({ activePlans });
  } catch (error) {
    console.error("Error fetching active plans:", error);
    res.status(500).json({ error: "Failed to fetch active plans" });
  }
};

// Controller: Get Expired Plans
exports.getExpiredPlans = async (req, res) => {
  try {
    const user_id = req.user.id;
    const userPlan = await UserPlan.findOne({ user_id });

    if (!userPlan || userPlan.plan_data.length === 0) {
      return res.status(404).json({ message: "No expired plans found" });
    }

    const expiredPlans = [];
    for (const plan of userPlan.plan_data) {
      const planDetails = await Plan.findById(plan.plan_id);
      const courseDetails = await Course.findById(plan.course_id);
      if (!planDetails || !courseDetails) continue;

      if (plan.remaining_slots === 0 || isPlanExpired(planDetails.plan_type, plan.payment_time)) {
        expiredPlans.push({
          course_type: courseDetails.course_type,
          course_name: courseDetails.course_name,
          plan_type: planDetails.plan_type,
        });
      }
    }

    res.json({ expiredPlans });
  } catch (error) {
    console.error("Error fetching expired plans:", error);
    res.status(500).json({ error: "Failed to fetch expired plans" });
  }
};
