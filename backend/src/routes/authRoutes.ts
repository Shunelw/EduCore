import { Router } from "express";
import {
    login,
    callback,
    me,
} from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get("/login", login);
router.get("/callback", callback);
router.get("/me", authenticate, me);

export default router;