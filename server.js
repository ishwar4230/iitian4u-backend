const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const excelLoader = require('./controllers/excelLoader');
// const connectDB = require("./config/db");
require("./config/db");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const adminRoutes = require("./routes/adminRoutes");
const slotRoutes = require("./routes/slotRoutes");
const planRoutes = require("./routes/planRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const priceRoutes = require('./routes/priceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const collegePredictRoutes = require("./routes/collegePredictRoutes");
dotenv.config();
// connectDB();

const app = express();
app.use(express.json());
app.use(cookieParser());
excelLoader.loadExcelData();
app.use(
    cors({
      origin: ["https://iitians4u.in", "https://iitians4u.netlify.app/"], // Allow your frontend domains
      credentials: true,
    })
  );
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/admin", adminRoutes);
app.use("/plan",planRoutes);
app.use("/slot",slotRoutes);
app.use("/session",sessionRoutes);
app.use("/price",priceRoutes);
app.use("/payment",paymentRoutes);
app.use("/predictor",collegePredictRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
