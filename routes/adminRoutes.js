const express = require("express");
const jwt = require("jsonwebtoken");
const adminMiddleware = require("../middleware/adminMiddleware");
const { addCourse, addPlan, addPrice, addUserPlan, addSlot, verifyAdminToken, getUpcomingSessions, deleteUnbookedOldSlots, getPredictorData
  , getAllUsers, getAllPayments, getAllUserPlans
 } = require("../controllers/adminController");

const router = express.Router();



// Admin login route
router.post("/admin-login", (req, res) => {
  const { adminId, adminPwd } = req.body;

  if (adminId === process.env.ADMIN_ID && adminPwd === process.env.ADMIN_PWD) {
    const token = jwt.sign({ id: adminId }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    });
    return res.json({ message: "Login successful" });
  }

  return res.status(401).json({ message: "Invalid credentials" });
});


// Admin logout
router.post("/logout", (req, res) => {
  res.clearCookie("adminToken");
  res.json({ message: "Logout successful" });
});

router.post("/add-slot", adminMiddleware, addSlot);
router.post("/add-course", adminMiddleware, addCourse);
router.post("/add-plan", adminMiddleware, addPlan);
router.post("/add-price", adminMiddleware, addPrice);
router.post("/add-userplan", adminMiddleware, addUserPlan);
router.get("/verify-admin-token", adminMiddleware, verifyAdminToken);
router.get("/get-upcoming-sessions",adminMiddleware,getUpcomingSessions);
router.delete("/delete-old-slots",adminMiddleware, deleteUnbookedOldSlots);
router.get("/get-predictor-data", adminMiddleware, getPredictorData);
router.get("/get-all-users", adminMiddleware, getAllUsers);
router.get("/get-all-payments", adminMiddleware, getAllPayments);
router.get("/get-all-userplans", adminMiddleware, getAllUserPlans);

module.exports = router;
