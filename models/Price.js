const mongoose = require("mongoose");

const priceSchema = new mongoose.Schema({
  course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course", // Assuming you have a 'User' model
      required: true,
    },
  plan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan", // Assuming you have a 'User' model
      required: true,
    },
  price: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Price", priceSchema);