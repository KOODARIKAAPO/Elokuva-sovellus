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

const router = Router();

// GET /groups
router.get("/", listGroups);

// ⭐ TÄRKEÄ: staattiset reitit ensin
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


export default router;