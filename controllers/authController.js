const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Otp = require("../models/Otp");
const nodemailer = require("nodemailer");

// Setup Nodemailer Transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // Keep false for port 587 (TLS)
  auth: {
    user: process.env.OTP_SMTP_USER,
    pass: process.env.OTP_SMTP_PASS
  }
});

const getOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Generate a random 6-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000);

    // Set OTP expiration time (5 minutes from now)
    // const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Upsert OTP (Create or Update if email exists)
    await Otp.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    const mailOptions = {
      from: process.env.OTP_SMTP_USER,
      to: email, // Array of recipients
      subject: "Your OTP for Verification at IITians4u",
      text: `Your OTP is: ${otp}. It will expire in 5 minutes.`
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const register = async (req, res) => {
  try {
    const { name, email, phone, password, otp } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or phone already registered" });
    }

    // Verify OTP
    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ message: "OTP not found or expired" });
    }
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({ name, email, phone, password: hashedPassword });
    await Otp.deleteOne({ email });

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
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });
    res.json({ message: "Login successful", user: { id: user._id, name: user.name, phone: user.phone } });
  } catch (error) {
    // console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const logout = (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
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

const changePassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Validate input
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify OTP
    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ message: "OTP not found or expired" });
    }
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    // Delete OTP entry after successful password reset
    await Otp.deleteOne({ email });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, logout, verify, getOtp, changePassword };