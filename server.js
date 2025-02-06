const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
// const connectDB = require("./config/db");
require("./config/db");
const authRoutes = require("./routes/authRoutes");

dotenv.config();
// connectDB();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

app.use("/api/auth", authRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
