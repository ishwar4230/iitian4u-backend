const User = require("../models/User");

// Get Profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Exclude password
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, email, gender, age, college, college_year, school, school_class, image } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, email, gender, age, college, college_year,school, school_class, image },
      { new: true, runValidators: true }
    ).select("-password"); // Exclude password from response

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error });
  }
};

module.exports = { getProfile, updateProfile };
