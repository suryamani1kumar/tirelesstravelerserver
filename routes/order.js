import { Router } from "express";
import {
  capturePayment,
  createOrder,
  createPaypalOrder,
  getOrderSave,
} from "../controller/order.js";
import { customerAuthMiddleWare } from "../middleware/customerAuth.js";

const router = Router();

// Example route
router.post("/createOrder", customerAuthMiddleWare, createOrder);
router.get("/getOrder", customerAuthMiddleWare, getOrderSave);
router.post("/createPaypalOrder", createPaypalOrder);
router.get("/captaurepayment/:paymentId", capturePayment);

export default router;
