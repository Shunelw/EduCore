import { Router } from "express";
import {
    getSemesters,
    getSemester,
    createNewSemester,
    updateExistingSemester,
    removeSemester,
} from "../controllers/semesterController";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();

// Any authenticated user can view semesters (e.g. professors picking one
// when creating a section)
router.get("/", authenticate, getSemesters);
router.get("/:id", authenticate, getSemester);

// Only admins manage semesters
router.post("/", authenticate, authorize("ADMIN"), createNewSemester);
router.put("/:id", authenticate, authorize("ADMIN"), updateExistingSemester);
router.delete("/:id", authenticate, authorize("ADMIN"), removeSemester);

export default router;
