import express from "express";
import * as materiController from "../controllers/materiController.js";
import { uploadMateri } from "../middlewares/uploadMiddleware.js";
import { auth } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// ADMIN & PENGAJAR
router.get("/", auth, materiController.getAllMateri);
router.get("/:id", auth, materiController.getMateriById);

// ADMIN ONLY
router.post("/",auth,isAdmin,uploadMateri.single("file"),materiController.createMateri);
router.put("/:id",auth,isAdmin,uploadMateri.single("file"),materiController.updateMateri);
router.delete("/:id", auth, isAdmin, materiController.deleteMateri);

export default router;
