const jwt = require("jsonwebtoken");

const adminMiddleware = (req, res, next) => {
  const token = req.cookies.adminToken;
  
  if (!token) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.id !== process.env.ADMIN_ID) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = adminMiddleware;
