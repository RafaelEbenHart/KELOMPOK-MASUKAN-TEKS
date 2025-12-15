import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRoute.js";
import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

// ROUTES
app.use("/api/users", userRoutes);

app.listen(process.env.PORT, () => {
    console.log("Server running on port " + process.env.PORT);
    console.log(`http://localhost:${process.env.PORT}`);
});