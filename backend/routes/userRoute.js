import express from "express";
import * as userController from "../controllers/userController.js";
import { auth } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";


const router = express.Router();

router.post("/register", auth, isAdmin, userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/", auth, isAdmin, userController.getUsers);
router.get("/:id", auth, isAdmin, userController.getUserById);
router.put("/:id", auth, isAdmin, userController.updateUser);
router.delete("/:id", auth, isAdmin, userController.deleteUser);

export default router;
