const mongoose = require("mongoose");

const predictorSchema = new mongoose.Schema({
  mobile: { type: String, required: true },
  jee_main_rank: { type: String, required: false},
  jee_adv_rank: { type: String, required: false},
  category: { type: String, required: false},
  gender: { type: String, required: false},
  state: { type: String, required: false}
  
}, { timestamps: true });

module.exports = mongoose.model("Predictor", predictorSchema);