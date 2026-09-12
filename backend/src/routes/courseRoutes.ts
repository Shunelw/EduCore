import { Router } from "express";
import {
    getCourses,
    getCourse,
    createNewCourse,
    updateExistingCourse,
    removeCourse,
} from "../controllers/courseController";

const router = Router();

router.get("/", getCourses);
router.get("/:id", getCourse);
router.post("/", createNewCourse);
router.put("/:id", updateExistingCourse);
router.delete("/:id", removeCourse);

export default router;