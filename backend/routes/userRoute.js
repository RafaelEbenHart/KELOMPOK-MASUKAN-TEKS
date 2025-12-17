import express from "express";
import * as userController from "../controllers/userController.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";


const router = express.Router();

router.post("/register", isAdmin, userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/", isAdmin, userController.getUsers);
router.get("/:id", isAdmin, userController.getUserById);
router.put("/:id", isAdmin, userController.updateUser);
router.delete("/:id", isAdmin, userController.deleteUser);

export default router;
