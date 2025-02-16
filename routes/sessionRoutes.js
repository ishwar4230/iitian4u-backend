const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/sessionController");
const authMiddleware = require("../middleware/authMiddleware"); // Ensure user is authenticated

router.get("/get-user-sessions", authMiddleware, sessionController.getUserSessions);

module.exports = router;
