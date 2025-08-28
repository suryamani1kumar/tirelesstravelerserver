import { Router } from "express";
import {
  customerAuth,
  customerLogin,
  customerRegister,
  GetCustomer,
} from "../controller/customer.js";
import { customerAuthMiddleWare } from "../middleware/customerAuth.js";

const router = Router();

// Example route
router.post("/customerRegister", customerRegister);
router.post("/customerLogin", customerLogin);
router.get("/customerAuth", customerAuth);
router.get("/getcustomer", customerAuthMiddleWare, GetCustomer)

export default router;
