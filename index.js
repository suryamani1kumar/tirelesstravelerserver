import express from "express";
import dotenv from "dotenv";
import paypalRoutes from "./routes/paypal.js";
// Load env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(express.json());

// Routes
app.use("/", (req, res) => {
  res.send(`<h1>Hello World</h1>`);
});
app.use("/paypal", paypalRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
