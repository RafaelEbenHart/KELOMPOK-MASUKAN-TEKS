import bcrypt from "bcryptjs";
import User from "../models/userModel.js";

// GET ALL PENGAJAR
export const getAllPengajar = async (req, res) => {
  try {
    const pengajar = await User.find({ role: "pengajar" }).select("-password");
    res.json(pengajar);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET PENGAJAR BY ID
export const getPengajarById = async (req, res) => {
  try {
    const pengajar = await User.findOne({
      _id: req.params.id,
      role: "pengajar",
    }).select("-password");

    if (!pengajar) {
      return res.status(404).json({ message: "Pengajar tidak ditemukan" });
    }

    res.json(pengajar);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE PENGAJAR
export const createPengajar = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Cek email sudah ada
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email sudah digunakan" });

    const hashedPass = await bcrypt.hash(password, 10);

    const pengajar = await User.create({
      name,
      email,
      password: hashedPass,
      role: "pengajar",
    });

    res.status(201).json({
      message: "Pengajar berhasil ditambahkan",
      pengajar,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE PENGAJAR
export const updatePengajar = async (req, res) => {
  try {
    const updates = { ...req.body };

    // Hash password jika ada perubahan password
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const pengajar = await User.findOneAndUpdate(
      { _id: req.params.id, role: "pengajar" },
      updates,
      { new: true }
    ).select("-password");

    if (!pengajar) {
      return res.status(404).json({ message: "Pengajar tidak ditemukan" });
    }

    res.json({
      message: "Data pengajar berhasil diperbarui",
      pengajar,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE PENGAJAR
export const deletePengajar = async (req, res) => {
  try {
    const pengajar = await User.findOneAndDelete({
      _id: req.params.id,
      role: "pengajar",
    });

    if (!pengajar) {
      return res.status(404).json({ message: "Pengajar tidak ditemukan" });
    }

    res.json({ message: "Pengajar berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
