import express from "express";
import * as siswaController from "../controllers/siswaController.js";
import { auth } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// READ (ADMIN & PENGAJAR)
router.get("/", auth, siswaController.getAllSiswa);
router.get("/:id", auth, siswaController.getSiswaById);

// CRUD (ADMIN ONLY)
router.post("/", auth, isAdmin, siswaController.createSiswa);
router.put("/:id", auth, isAdmin, siswaController.updateSiswa);
router.delete("/:id", auth, isAdmin, siswaController.deleteSiswa);

export default router;
