import Jadwal from "../models/jadwalModel.js";
import Kelas from "../models/kelasModel.js";
import User from "../models/userModel.js";

// GET ALL JADWAL
export const getAllJadwal = async (req, res) => {
  try {
    const jadwal = await Jadwal.find()
      .populate("kelas", "nama_kelas ruangan")
      .populate("pengajar", "name email");

    res.json(jadwal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET JADWAL BY ID
export const getJadwalById = async (req, res) => {
  try {
    const jadwal = await Jadwal.findById(req.params.id)
      .populate("kelas", "nama_kelas ruangan")
      .populate("pengajar", "name email");

    if (!jadwal) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });
    }

    res.json(jadwal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE JADWAL (ADMIN)
export const createJadwal = async (req, res) => {
  try {
    const { kelas: kelasId, pengajar: pengajarId } = req.body;

    // Validasi referensi
    const kelasExists = await Kelas.findById(kelasId);
    if (!kelasExists) return res.status(404).json({ message: "Kelas tidak ditemukan" });

    const pengajarExists = await User.findById(pengajarId);
    if (!pengajarExists) return res.status(404).json({ message: "Pengajar tidak ditemukan" });

    const jadwal = await Jadwal.create(req.body);
    res.status(201).json({
      message: "Jadwal berhasil ditambahkan",
      jadwal,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE JADWAL (ADMIN)
export const updateJadwal = async (req, res) => {
  try {
    const updates = { ...req.body };

    // Jika mengganti referensi, pastikan keberadaannya
    if (updates.kelas) {
      const kelasExists = await Kelas.findById(updates.kelas);
      if (!kelasExists) return res.status(404).json({ message: "Kelas tidak ditemukan" });
    }
    if (updates.pengajar) {
      const pengajarExists = await User.findById(updates.pengajar);
      if (!pengajarExists) return res.status(404).json({ message: "Pengajar tidak ditemukan" });
    }

    const jadwal = await Jadwal.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!jadwal) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });
    }

    res.json({
      message: "Jadwal berhasil diperbarui",
      jadwal,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE JADWAL (ADMIN)
export const deleteJadwal = async (req, res) => {
  try {
    const jadwal = await Jadwal.findByIdAndDelete(req.params.id);

    if (!jadwal) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });
    }

    res.json({ message: "Jadwal berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
