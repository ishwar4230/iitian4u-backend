const express = require("express");
const router = express.Router();
const { getPrice,getCheckoutPrice } = require("../controllers/priceController");
const authMiddleware = require("../middleware/authMiddleware");


// Route to fetch price details based on course type
router.get("/get-price", getPrice);
router.get("/get-checkout-price",authMiddleware,getCheckoutPrice);

module.exports = router;
