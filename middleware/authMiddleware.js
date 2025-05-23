const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = (req, res, next) => {
  // console.log("Auth middleware triggered"); // Debugging
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports =  authMiddleware;
