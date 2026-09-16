import { Router } from "express";

import {
    getSections,
    getSection,
    createNewSection,
    updateExistingSection,
    removeSection,
} from "../controllers/sectionController";

import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();

router.get(
    "/",
    authenticate,
    getSections
);

router.get(
    "/:id",
    authenticate,
    getSection
);

router.post(
    "/",
    authenticate,
    authorize("PROFESSOR", "ADMIN"),
    createNewSection
);

router.put(
    "/:id",
    authenticate,
    authorize("PROFESSOR", "ADMIN"),
    updateExistingSection
);

router.delete(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    removeSection
);

export default router;