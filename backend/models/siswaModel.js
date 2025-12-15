import mongoose from "mongoose";

const siswaSchema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: true,
      trim: true,
    },

    alamat: {
      type: String,
    },

    no_telp: {
      type: String,
    },

    jenis_kelamin: {
      type: String,
      enum: ["L", "P"],
    },

    tanggal_lahir: {
      type: Date,
    },

    kelas_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kelas",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Siswa", siswaSchema);
