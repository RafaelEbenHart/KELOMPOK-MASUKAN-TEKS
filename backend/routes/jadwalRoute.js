import express from "express";
import * as jadwalController from "../controllers/jadwalController.js";
import { auth } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";


const router = express.Router();

router.get("/", auth, jadwalController.getAllJadwal);
router.get("/:id",auth, jadwalController.getJadwalById);


router.post("/", auth, isAdmin, jadwalController.createJadwal);
router.put("/:id", auth, isAdmin, jadwalController.updateJadwal);
router.delete("/:id", auth, isAdmin, jadwalController.deleteJadwal);

export default router;
