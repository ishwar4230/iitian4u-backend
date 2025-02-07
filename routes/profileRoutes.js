const express = require("express");
const { getProfile, updateProfile } = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get user profile (protected route)
router.get("/", authMiddleware, getProfile);

// Update user profile (protected route)
router.put("/", authMiddleware, updateProfile);

module.exports = router;
