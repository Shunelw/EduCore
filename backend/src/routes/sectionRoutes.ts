import { Router } from "express";

import {
    getSections,
    getSection,
    createNewSection,
    updateExistingSection,
    removeSection,
} from "../controllers/sectionController";

const router = Router();

router.get("/", getSections);
router.get("/:id", getSection);
router.post("/", createNewSection);
router.put("/:id", updateExistingSection);
router.delete("/:id", removeSection);

export default router;