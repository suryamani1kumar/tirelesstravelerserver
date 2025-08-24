import { Router } from "express";
import {
  customerAuth,
  customerLogin,
  customerRegister,
} from "../controller/customer.js";

const router = Router();

// Example route
router.post("/customerRegister", customerRegister);
router.post("/customerLogin", customerLogin);
router.get("/customerAuth", customerAuth);

export default router;
