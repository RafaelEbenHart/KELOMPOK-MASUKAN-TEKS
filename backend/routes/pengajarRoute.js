import express from "express";
import * as pengajarController from "../controllers/pengajarController.js";
import { auth } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";


const router = express.Router();

// CRUD PENGAJAR
router.get("/", auth, isAdmin, pengajarController.getAllPengajar);
router.get("/:id",auth, isAdmin, pengajarController.getPengajarById);
router.post("/",auth, isAdmin, pengajarController.createPengajar);
router.put("/:id", auth, isAdmin, pengajarController.updatePengajar);
router.delete("/:id", auth, isAdmin, pengajarController.deletePengajar);
export default router;
