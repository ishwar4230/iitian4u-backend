 const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

 const register = async (req, res) => {
  try {
    const { name, email,phone, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or phone already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({ name, email,phone, password: hashedPassword });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

 const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    // Find user
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ message: "User not exist" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    user.last_login = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, {
       httpOnly: true,
       secure: process.env.NODE_ENV === "production",
       maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
       sameSite: "None", // Required for cross-site cookies
      });
    res.json({ message: "Login successful", user: {id: user._id, name: user.name, phone: user.phone } });
  } catch (error) {
    // console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

 const logout = (req, res) => {
  try{
  res.cookie("token","", {
     httpOnly: true,
     secure: process.env.NODE_ENV === "production",
     sameSite: "None",
     expires: new Date(0), // Expire immediately

    });
  res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const verify = (req, res) => {
  try {
    const token = req.cookies.token; // Read token from cookies

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token found" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized - Invalid token" });
      }

      res.json({ userId: decoded.id }); // Return user ID if token is valid
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { register, login, logout, verify };