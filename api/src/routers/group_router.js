import { Router } from "express";
import { authRequired } from "../middleware/auth_middleware.js";
import { listGroups, createGroup, deleteGroup, getGroupById } from "../controllers/group_controller.js";

const router = Router();

// GET /groups
router.get("/", listGroups);

// POST /groups
router.post("/", authRequired, createGroup);

// GET /groups/:id
router.get("/:id", getGroupById);

// DELETE /groups/:id
router.delete("/:id", authRequired ,deleteGroup);


export default router;