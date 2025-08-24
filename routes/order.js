import { Router } from "express";
import {
  capturePayment,
  createOrder,
  createPaypalOrder,
} from "../controller/order.js";

const router = Router();

// Example route
router.post("/createOrder", createOrder);
router.post("/createPaypalOrder", createPaypalOrder);
router.get("/captaurepayment/:paymentId", capturePayment);

export default router;
