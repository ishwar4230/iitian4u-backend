const Course = require("../models/Course");
const Plan = require("../models/Plan");
const Price = require("../models/Price");

exports.getPrice = async (req, res) => {
  try {
    const { course_type } = req.query;
    
    if (!course_type) {
      return res.status(400).json({ error: "Course type is required." });
    }

    // Step 1: Get all courses of the given course type
    const courses = await Course.find({ course_type }, "course_name _id");
    if (!courses.length) {
      return res.status(404).json({ error: "No courses found for this course type." });
    }

    // Step 2: Get all plans that match the given course type
    const plans = await Plan.find({ course_type }, "plan_type _id");
    if (!plans.length) {
      return res.status(404).json({ error: "No plans found for this course type." });
    }

    // Step 3: Fetch price details for each (course_name, plan_type) combination
    let priceData = [];

    for (const course of courses) {
      for (const plan of plans) {
        const priceEntry = await Price.findOne({ 
          course_id: course._id, 
          plan_id: plan._id 
        });

        if (priceEntry && priceEntry.price !== null) {
          priceData.push({
            course_name: course.course_name,
            plan_type: plan.plan_type,
            price: priceEntry.price,
          });
        }
      }
    }

    if (priceData.length === 0) {
      return res.status(404).json({ error: "No price data available." });
    }

    return res.json({ prices: priceData });

  } catch (error) {
    console.error("Error fetching prices:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
