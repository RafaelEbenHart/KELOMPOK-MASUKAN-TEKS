import Kelas from "../models/kelasModel.js";

// GET ALL KELAS
export const getAllKelas = async (req, res) => {
  try {
    const kelas = await Kelas.find().populate("pengajar_id", "name email");
    res.json(kelas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET KELAS BY ID
export const getKelasById = async (req, res) => {
  try {
    const kelas = await Kelas.findById(req.params.id).populate("pengajar_id", "name email");

    if (!kelas) {
      return res.status(404).json({ message: "Kelas tidak ditemukan" });
    }

    res.json(kelas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE KELAS
export const createKelas = async (req, res) => {
  try {
    const kelas = await Kelas.create(req.body);
    res.status(201).json({
      message: "Kelas berhasil ditambahkan",
      kelas,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE KELAS
export const updateKelas = async (req, res) => {
  try {
    const kelas = await Kelas.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!kelas) {
      return res.status(404).json({ message: "Kelas tidak ditemukan" });
    }

    res.json({
      message: "Data kelas berhasil diperbarui",
      kelas,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE KELAS
export const deleteKelas = async (req, res) => {
  try {
    const kelas = await Kelas.findByIdAndDelete(req.params.id);

    if (!kelas) {
      return res.status(404).json({ message: "Kelas tidak ditemukan" });
    }

    res.json({ message: "Kelas berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
