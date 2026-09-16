import { Router } from "express";
import {
    listUsers,
    getUser,
    updateUserRole,
    getEnrollments,
} from "../controllers/adminController";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();

// Every admin route requires an authenticated ADMIN
router.use(authenticate, authorize("ADMIN"));

// User management + activity monitoring (most recently active first)
router.get("/users", listUsers);
router.get("/users/:id", getUser);

// Role assignment
router.put("/users/:id/role", updateUserRole);

// Enrollment reports
router.get("/reports/enrollments", getEnrollments);

export default router;
