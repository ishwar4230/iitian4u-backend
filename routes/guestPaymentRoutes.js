const express = require("express");
const { createOrder,verifyGuestPayment } = require("../controllers/guestPaymentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create-order",createOrder);
router.post("/verify-payment",verifyGuestPayment);

module.exports = router;