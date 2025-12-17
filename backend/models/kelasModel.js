import mongoose from "mongoose";

const kelasSchema = new mongoose.Schema(
  {
    nama_kelas: {
      type: String,
      required: true,
      trim: true,
    },

    ruangan: {
      type: String,
      required: true,
    },

    pengajar_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    deskripsi: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Kelas", kelasSchema);
