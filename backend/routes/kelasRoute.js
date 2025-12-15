import express from "express";
import * as kelasController from "../controllers/kelasController.js";

const router = express.Router();

// CRUD KELAS
router.get("/", kelasController.getAllKelas);
router.get("/:id", kelasController.getKelasById);
router.post("/", kelasController.createKelas);
router.put("/:id", kelasController.updateKelas);
router.delete("/:id", kelasController.deleteKelas);

export default router;
