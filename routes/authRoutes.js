const express = require("express");
const { register, login, logout } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register); // No middleware (New users have no token)
router.post("/login", login);       // No middleware (Users login to get token)
router.post("/logout", logout);     // No middleware (Logout clears token)

// // Protected route (Example: Fetch user profile)
// router.get("/profile", authMiddleware, (req, res) => {
//   res.json({ message: "This is a protected route", user: req.user });
// });

module.exports = router;
