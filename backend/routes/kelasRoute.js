import express from "express";
import * as kelasController from "../controllers/kelasController.js";
import { auth } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// READ (Admin & Pengajar)
router.get("/", auth, kelasController.getAllKelas);
router.get("/:id", auth, kelasController.getKelasById);

// CRUD (ADMIN ONLY)
router.post("/", auth, isAdmin, kelasController.createKelas);
router.put("/:id", auth, isAdmin, kelasController.updateKelas);
router.delete("/:id", auth, isAdmin, kelasController.deleteKelas);

export default router;
