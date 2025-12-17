import Materi from "../models/materiModels.js";
import Kelas from "../models/kelasModel.js";
import User from "../models/userModel.js";

// GET ALL MATERI
export const getAllMateri = async (req, res) => {
  try {
    const materi = await Materi.find()
      .populate("kelas", "nama_kelas ruangan")
      .populate("dibuatOleh", "name email");

    res.json(materi);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MATERI BY ID
export const getMateriById = async (req, res) => {
  try {
    const materi = await Materi.findById(req.params.id)
      .populate("kelas", "nama_kelas ruangan")
      .populate("dibuatOleh", "name email");

    if (!materi) return res.status(404).json({ message: "Materi tidak ditemukan" });

    res.json(materi);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE MATERI
export const createMateri = async (req, res) => {
  try {
    const { judul, deskripsi, kelas } = req.body;
    const filePath = req.file?.path;

    // Validasi referensi
    const kelasExists = await Kelas.findById(kelas);
    if (!kelasExists) return res.status(404).json({ message: "Kelas tidak ditemukan" });

    const dibuatOleh = req.user?.id || req.body.dibuatOleh;
    const userExists = await User.findById(dibuatOleh);
    if (!userExists) return res.status(404).json({ message: "Pembuat (user) tidak ditemukan" });

    const materi = await Materi.create({
      judul,
      deskripsi,
      kelas,
      file: filePath,
      dibuatOleh,
    });

    res.status(201).json({ message: "Materi berhasil ditambahkan", materi });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE MATERI
export const updateMateri = async (req, res) => {
  try {
    const updates = {
      judul: req.body.judul,
      deskripsi: req.body.deskripsi,
      kelas: req.body.kelas,
    };

    if (req.file) updates.file = req.file.path;

    if (updates.kelas) {
      const kelasExists = await Kelas.findById(updates.kelas);
      if (!kelasExists) return res.status(404).json({ message: "Kelas tidak ditemukan" });
    }

    const materi = await Materi.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!materi) return res.status(404).json({ message: "Materi tidak ditemukan" });

    res.json({ message: "Materi berhasil diperbarui", materi });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE MATERI
export const deleteMateri = async (req, res) => {
  try {
    const materi = await Materi.findByIdAndDelete(req.params.id);
    if (!materi) return res.status(404).json({ message: "Materi tidak ditemukan" });

    res.json({ message: "Materi berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
