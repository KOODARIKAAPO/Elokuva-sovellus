import { Router } from "express";
import { authRequired } from "../middleware/auth_middleware.js";
import { 
  listGroups, 
  createGroup, 
  getGroupById,
  getGroupFavourites,
  addMovieToGroup,
  deleteGroup,
  removeMovieFromGroup
} from "../controllers/group_controller.js";
import {
  getGroupMessages,
  sendGroupMessage,
  deleteGroupMessage
} from "../controllers/message_controller.js";

const router = Router();

// GET /groups
router.get("/", listGroups);

// POST /groups
router.post("/", authRequired, createGroup);

// GET /groups/:id
router.get("/:id", getGroupById);

// GET /groups/:id/favourites
router.get("/:id/favourites", getGroupFavourites);

// POST /groups/:id/favourites (add movie to group)
router.post("/:id/favourites", authRequired, addMovieToGroup);

// DELETE /groups/:id/favourites/:tmdbId (remove movie from group)
router.delete("/:id/favourites/:tmdbId", authRequired, removeMovieFromGroup);

// GET /groups/:id/messages (get all messages in a group)
router.get("/:id/messages", authRequired, getGroupMessages);

// POST /groups/:id/messages (send a message to a group)
router.post("/:id/messages", authRequired, sendGroupMessage);

// DELETE /groups/:id/messages/:messageId (delete a message)
router.delete("/:id/messages/:messageId", authRequired, deleteGroupMessage);

// DELETE /groups/:id
router.delete("/:id", authRequired ,deleteGroup);


export default router;