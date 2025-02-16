const mongoose = require("mongoose");

const userPlanSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming you have a 'User' model
    required: true,
  },
  plan_data: [
    {
      payment_id: { type: String, required: true },
      course_id: { type: String, required: true },
      plan_id: { type: String, required: true },
      remaining_slots: { type: Number, required: true },
      payment_time: { type: Date, required: true, default: Date.now },
    },
  ],
});

const UserPlan = mongoose.model("UserPlan", userPlanSchema);
module.exports = UserPlan;
