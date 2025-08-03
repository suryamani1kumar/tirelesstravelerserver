import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import paypalRoutes from "./routes/paypal.js";
import userLogin from "./routes/login.js";
import cors from "cors";

// Load env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT;

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

app.use("/paypal", paypalRoutes);

app.use("/", (req, res) => {
  res.send(`<h1>Hello World</h1>`);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
