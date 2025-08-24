import { Router } from "express";
import { signAuth, signIn, signUp } from "../controller/sign.js";

const router = Router();

// Example route
router.post("/signIn", signIn);
router.post("/signUp", signUp);
router.get("/signInAuth", signAuth);

export default router;