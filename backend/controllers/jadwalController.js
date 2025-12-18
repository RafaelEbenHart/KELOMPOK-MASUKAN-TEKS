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
    const { kelas: kelasId, pengajar: pengajarId, hari, jamMulai, jamSelesai } = req.body;

    // Validasi referensi
    const kelasExists = await Kelas.findById(kelasId);
    if (!kelasExists) return res.status(404).json({ message: "Kelas tidak ditemukan" });

    const pengajarExists = await User.findById(pengajarId);
    if (!pengajarExists) return res.status(404).json({ message: "Pengajar tidak ditemukan" });

    // validate time overlap for same ruangan: no two jadwal in same ruangan can overlap on same hari
    if (!hari || !jamMulai || !jamSelesai) {
      return res.status(400).json({ message: 'Hari dan jam harus diisi.' });
    }

    const toMinutes = (t) => {
      if (!t) return null;
      const [hh, mm] = t.split(':').map(Number);
      return hh * 60 + mm;
    };

    const newStart = toMinutes(jamMulai);
    const newEnd = toMinutes(jamSelesai);
    if (newStart === null || newEnd === null || newStart >= newEnd) {
      return res.status(400).json({ message: 'Rentang jam tidak valid.' });
    }

    const kelasSameRoom = await Kelas.find({ ruangan: kelasExists.ruangan }).select('_id nama_kelas ruangan');
    const kelasIds = kelasSameRoom.map(k => k._id);

    const existing = await Jadwal.find({ kelas: { $in: kelasIds }, hari }).populate('kelas', 'nama_kelas ruangan');

    for (const ex of existing) {
      const exStart = toMinutes(ex.jamMulai);
      const exEnd = toMinutes(ex.jamSelesai);
      if (exStart === null || exEnd === null) continue;
      // overlap check
      if (newStart < exEnd && newEnd > exStart) {
        return res.status(400).json({ message: `Jadwal bertabrakan dengan kelas "${ex.kelas?.nama_kelas || ex.kelas}" di ruangan ${kelasExists.ruangan} (hari: ${hari}, jam: ${ex.jamMulai}-${ex.jamSelesai}).` });
      }
    }

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

    // Conflict check if hari/jam/kela changed (or always to be safe)
    const jadwalId = req.params.id;
    const current = await Jadwal.findById(jadwalId);
    if (!current) return res.status(404).json({ message: 'Jadwal tidak ditemukan' });

    const hari = updates.hari || current.hari;
    const jamMulai = updates.jamMulai || current.jamMulai;
    const jamSelesai = updates.jamSelesai || current.jamSelesai;
    const kelasId = updates.kelas || current.kelas;

    const toMinutes = (t) => {
      if (!t) return null;
      const [hh, mm] = t.split(':').map(Number);
      return hh * 60 + mm;
    };

    const newStart = toMinutes(jamMulai);
    const newEnd = toMinutes(jamSelesai);
    if (newStart === null || newEnd === null || newStart >= newEnd) {
      return res.status(400).json({ message: 'Rentang jam tidak valid.' });
    }

    const kelasExists = await Kelas.findById(kelasId);
    const kelasSameRoom = await Kelas.find({ ruangan: kelasExists.ruangan }).select('_id nama_kelas ruangan');
    const kelasIds = kelasSameRoom.map(k => k._id);

    const existing = await Jadwal.find({ kelas: { $in: kelasIds }, hari }).populate('kelas', 'nama_kelas ruangan');

    for (const ex of existing) {
      if (ex._id.equals(jadwalId)) continue;
      const exStart = toMinutes(ex.jamMulai);
      const exEnd = toMinutes(ex.jamSelesai);
      if (exStart === null || exEnd === null) continue;
      if (newStart < exEnd && newEnd > exStart) {
        return res.status(400).json({ message: `Jadwal bertabrakan dengan kelas "${ex.kelas?.nama_kelas || ex.kelas}" di ruangan ${kelasExists.ruangan} (hari: ${hari}, jam: ${ex.jamMulai}-${ex.jamSelesai}).` });
      }
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
