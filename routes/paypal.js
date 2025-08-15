import { Router } from "express";
import {createOrder} from "../controller/paypal.js"

const router = Router();

// Example route
router.post("/createorder", createOrder);

export default router;
