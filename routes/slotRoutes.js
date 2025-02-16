const express = require("express");
const { getSlots, bookSlot } = require("../controllers/slotController");
const authMiddleware = require("../middleware/authMiddleware"); // Ensure user authentication

const router = express.Router();

router.get("/get-slots",authMiddleware, getSlots);
router.post("/book-slot", authMiddleware, bookSlot);

module.exports = router;
