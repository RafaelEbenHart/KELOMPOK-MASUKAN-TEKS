import Siswa from "../models/siswaModel.js";
import fs from "fs";

// GET ALL SISWA
export const getAllSiswa = async (req, res) => {
  try {
    const siswa = await Siswa.find().populate("kelas");
    res.json(siswa);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SISWA BY ID
export const getSiswaById = async (req, res) => {
  try {
    const siswa = await Siswa.findById(req.params.id).populate("kelas");
    if (!siswa) return res.status(404).json({ message: "Siswa tidak ditemukan" });
    res.json(siswa);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE SISWA
export const createSiswa = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.gambar = req.file.path;
    }
    const siswa = await Siswa.create(data);
    res.status(201).json({ message: "Siswa berhasil ditambahkan", siswa });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE SISWA
export const updateSiswa = async (req, res) => {
  try {
    const siswaBefore = await Siswa.findById(req.params.id);
    if (!siswaBefore) return res.status(404).json({ message: "Siswa tidak ditemukan" });

    const updateData = { ...req.body };
    if (req.file) {
      // hapus gambar lama jika ada
      if (siswaBefore.gambar && fs.existsSync(siswaBefore.gambar)) {
        fs.unlinkSync(siswaBefore.gambar);
      }
      updateData.gambar = req.file.path;
    }

    const siswa = await Siswa.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ message: "Data siswa berhasil diperbarui", siswa });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE SISWA
export const deleteSiswa = async (req, res) => {
  try {
    const siswa = await Siswa.findById(req.params.id);
    if (!siswa) return res.status(404).json({ message: "Siswa tidak ditemukan" });

    if (siswa.gambar && fs.existsSync(siswa.gambar)) {
      fs.unlinkSync(siswa.gambar);
    }

    await siswa.remove();
    res.json({ message: "Siswa berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
