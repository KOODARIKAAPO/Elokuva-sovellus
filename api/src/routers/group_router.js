import { Router } from "express";
import { listGroups, createGroup } from "../controllers/group_controller.js";

const router = Router();

// GET /groups
router.get("/", listGroups);

// POST /groups
router.post("/", createGroup);

export default router;