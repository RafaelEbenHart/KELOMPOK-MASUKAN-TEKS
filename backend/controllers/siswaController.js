import Siswa from "../models/siswaModel.js";

// GET ALL SISWA
export const getAllSiswa = async (req, res) => {
  try {
    const siswa = await Siswa.find().populate("kelas_id");
    res.json(siswa);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SISWA BY ID
export const getSiswaById = async (req, res) => {
  try {
    const siswa = await Siswa.findById(req.params.id).populate("kelas_id");
    if (!siswa) return res.status(404).json({ message: "Siswa tidak ditemukan" });
    res.json(siswa);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE SISWA
export const createSiswa = async (req, res) => {
  try {
    const siswa = await Siswa.create(req.body);
    res.status(201).json({ message: "Siswa berhasil ditambahkan", siswa });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE SISWA
export const updateSiswa = async (req, res) => {
  try {
    const siswa = await Siswa.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!siswa) return res.status(404).json({ message: "Siswa tidak ditemukan" });
    res.json({ message: "Data siswa berhasil diperbarui", siswa });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE SISWA
export const deleteSiswa = async (req, res) => {
  try {
    const siswa = await Siswa.findByIdAndDelete(req.params.id);
    if (!siswa) return res.status(404).json({ message: "Siswa tidak ditemukan" });
    res.json({ message: "Siswa berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
