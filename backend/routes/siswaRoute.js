import express from "express";
import * as siswaController from "../controllers/siswaController.js";

const router = express.Router();

// CRUD SISWA
router.get("/", siswaController.getAllSiswa);
router.get("/:id", siswaController.getSiswaById);
router.post("/", siswaController.createSiswa);
router.put("/:id", siswaController.updateSiswa);
router.delete("/:id", siswaController.deleteSiswa);

export default router;
