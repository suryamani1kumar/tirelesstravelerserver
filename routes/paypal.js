import { Router } from "express";
import {capturePayment, createOrder} from "../controller/paypal.js"

const router = Router();

// Example route
router.post("/createorder", createOrder);
router.get("/captaurepayment/:paymentId", capturePayment);

export default router;
