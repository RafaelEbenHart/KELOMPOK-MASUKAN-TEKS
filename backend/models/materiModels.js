import mongoose from "mongoose";

const materiSchema = new mongoose.Schema(
  {
    judul: {
      type: String,
      required: true,
      trim: true,
    },

    deskripsi: {
      type: String,
    },

    kelas: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kelas",
      required: true,
    },

    file: {
      type: String, // path file upload
      required: true,
    },

    dibuatOleh: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Materi", materiSchema);
