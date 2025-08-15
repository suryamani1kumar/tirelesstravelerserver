import { Router } from "express";
import { signIn, signUp } from "../controller/sign.js";

const router = Router();

// Example route
router.post("/signIn", signIn);
router.post("/signUp", signUp);

export default router;