import { Router } from "express";
import { userLogin } from "../controller/login.js";

const router = Router();

// Example route
router.post("/login", userLogin);

export default router;
