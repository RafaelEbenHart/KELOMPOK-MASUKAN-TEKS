import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRoute.js";
import siswaRoutes from "./routes/siswaRoute.js";
import kelasRoutes from "./routes/kelasRoute.js";
import pengajarRoutes from "./routes/pengajarRoute.js";
import jadwalRoutes from "./routes/jadwalRoute.js";
import materiRoutes from "./routes/materiRoute.js";
import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

// serve uploads (images, files)
app.use('/uploads', express.static('uploads'));

// ROUTES
app.use("/api/users", userRoutes);
app.use("/api/siswa", siswaRoutes);
app.use("/api/kelas", kelasRoutes);
app.use("/api/pengajar", pengajarRoutes);
app.use("/api/jadwal", jadwalRoutes);
app.use("/api/materi", materiRoutes);

app.listen(process.env.PORT, () => {
    console.log("Server running on port " + process.env.PORT);
    console.log(`http://localhost:${process.env.PORT}`);
});