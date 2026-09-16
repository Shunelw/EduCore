import { Router } from "express";
import { verifyStudent } from "../controllers/partnerController";
import { requireApiKey } from "../middleware/apiKeyMiddleware";

const router = Router();

router.get(
    "/verify-student",
    requireApiKey,
    verifyStudent
);

export default router;
