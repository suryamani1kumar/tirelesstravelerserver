import { Router } from "express";
import { userLogin, verifyToken } from "../controller/login.js";

const router = Router();

// Example route
router.post("/login", userLogin);
router.get("/verify", verifyToken);

export default router;
