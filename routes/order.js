import { Router } from "express";
import {
  capturePayment,
  createOrder,
  createPaypalOrder,
  getAllOrder,
  getOrder,
} from "../controller/order.js";
import { customerAuthMiddleWare } from "../middleware/customerAuth.js";

const router = Router();

// Example route
router.post("/createOrder", customerAuthMiddleWare, createOrder);
router.get("/getOrder", customerAuthMiddleWare, getOrder);
router.get("/getAllOrder", getAllOrder);
router.post("/createPaypalOrder", createPaypalOrder);
router.post("/captaurepayment/:paymentId", capturePayment);

export default router;
