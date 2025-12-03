import { Router } from "express";
import { listGroups, createGroup, getGroupById } from "../controllers/group_controller.js";

const router = Router();

// GET /groups
router.get("/", listGroups);

// POST /groups
router.post("/", createGroup);

// GET /groups/:id
router.get("/:id", getGroupById);


export default router;