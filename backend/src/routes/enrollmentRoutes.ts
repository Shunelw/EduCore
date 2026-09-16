import { Router } from "express";
import {
    registerStudent,
    getMyEnrollments,
    dropMyEnrollment,
} from "../controllers/enrollmentController";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();

router.post(
    "/",
    authenticate,
    authorize("STUDENT"),
    registerStudent
);

router.get(
    "/me",
    authenticate,
    authorize("STUDENT"),
    getMyEnrollments
);

router.delete(
    "/:id",
    authenticate,
    authorize("STUDENT"),
    dropMyEnrollment
);

export default router;