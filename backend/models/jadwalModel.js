import mongoose from "mongoose";

const jadwalSchema = new mongoose.Schema(
  {
    hari: {
      type: String,
      required: true,
      enum: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"],
    },

    jamMulai: {
      type: String,
      required: true,
    },

    jamSelesai: {
      type: String,
      required: true,
    },

    kelas: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kelas",
      required: true,
    },

    pengajar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Jadwal", jadwalSchema);
