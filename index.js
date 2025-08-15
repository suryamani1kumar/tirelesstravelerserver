import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./db.js";
import cors from "cors";
import userLogin from "./routes/login.js";
import sign from "./routes/sign.js";
import order from "./routes/paypal.js";

// Load env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT;
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [process.env.WEB_BASE_URL, process.env.ADMIN_BASE_URL],
    credentials: true,
  })
);

// Routes

app.use("/api", userLogin);
app.use("/api", sign);
app.use("/api", order);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
