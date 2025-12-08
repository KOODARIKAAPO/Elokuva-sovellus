import { Router } from "express";
import { authRequired } from "../middleware/auth_middleware.js";
import { 
  listGroups, 
  createGroup, 
  getGroupById,
  getGroupFavourites,
  addMovieToGroup,
  deleteGroup,
  removeMovieFromGroup,
  listGroupMembers,
  requestJoin,
  approveMember,
  getJoinedGroups,
  leaveGroup,
} from "../controllers/group_controller.js";
import {
  getGroupMessages,
  sendGroupMessage,
  deleteGroupMessage
} from "../controllers/message_controller.js";

const router = Router();

// GET /groups
router.get("/", listGroups);

router.get("/joined", authRequired, getJoinedGroups);

// Luo ryhmä
router.post("/", authRequired, createGroup);

// Ryhmän jäsenyys
router.post("/:id/join", authRequired, requestJoin);
router.post("/:id/approve/:userId", authRequired, approveMember);

// Ryhmän suosikit
router.get("/:id/favourites", getGroupFavourites);
router.post("/:id/favourites", authRequired, addMovieToGroup);
router.delete("/:id/favourites/:tmdbId", authRequired, removeMovieFromGroup);

// Jäsenlista
router.get("/:id/members", authRequired, listGroupMembers);

// Poista ryhmä
router.delete("/:id", authRequired, deleteGroup);

// Poistu ryhmästä
router.delete("/:id/leave", authRequired, leaveGroup);

router.get("/:id", getGroupById);

// Hae viestit
router.get("/:id/messages", authRequired, getGroupMessages);

// Lähetä viesti
router.post("/:id/messages", authRequired, sendGroupMessage);

// Poista viesti
router.delete("/:id/messages/:messageId", authRequired, deleteGroupMessage);

// DELETE /groups/:id
router.delete("/:id", authRequired ,deleteGroup);


export default router;