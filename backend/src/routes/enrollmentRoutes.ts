import { Router } from "express";
import { registerStudent } from "../controllers/enrollmentController";

const router = Router();

router.post("/", registerStudent);

export default router;