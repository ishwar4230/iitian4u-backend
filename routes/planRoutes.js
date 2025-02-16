const express = require("express");
const { getActivePlans, getExpiredPlans } = require("../controllers/planController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/get-active-plans", authMiddleware, getActivePlans);
router.get("/get-expired-plans", authMiddleware, getExpiredPlans);

module.exports = router;
