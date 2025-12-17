import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // set user on request (optional: fetch full user)
    req.user = { id: decoded.id, role: decoded.role };

    // (optional) ensure user still exists
    const userExists = await User.findById(decoded.id).select("-password");
    if (!userExists) return res.status(401).json({ message: "Unauthorized" });

    req.user = userExists;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};