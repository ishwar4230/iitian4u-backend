const express = require("express");
const router = express.Router();
const { getPrice } = require("../controllers/priceController");

// Route to fetch price details based on course type
router.get("/get-price", getPrice);

module.exports = router;
