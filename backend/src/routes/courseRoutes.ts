import { Router } from "express";
import {
    getCourses,
    getCourse,
    lookupTextbook,
    createNewCourse,
    updateExistingCourse,
    removeCourse,
} from "../controllers/courseController";

import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();

router.get(
    "/",
    authenticate,
    getCourses
);

router.get(
    "/textbooks/lookup",
    authenticate,
    authorize("PROFESSOR", "ADMIN"),
    lookupTextbook
);

router.get(
    "/:id",
    authenticate,
    getCourse
);

// Professor or Admin can create
router.post(
    "/",
    authenticate,
    authorize("PROFESSOR", "ADMIN"),
    createNewCourse
);

// Professor or Admin can update
router.put(
    "/:id",
    authenticate,
    authorize("PROFESSOR", "ADMIN"),
    updateExistingCourse
);

// Admin only can delete
router.delete(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    removeCourse
);

export default router;
