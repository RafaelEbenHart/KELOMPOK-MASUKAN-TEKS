const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

function readData() {
	if (!fs.existsSync(DATA_FILE)) return [];
	const text = fs.readFileSync(DATA_FILE, 'utf8') || '[]';
	try {
		return JSON.parse(text);
	} catch (err) {
		return [];
	}
}

function writeData(data) {
	fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/pegawai', (req, res) => {
	res.json(readData());
});

app.get('/api/pegawai/:id', (req, res) => {
	const id = parseInt(req.params.id);
	const data = readData();
	const p = data.find((x) => x.id === id);
	if (!p) return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
	res.json(p);
});

app.post('/api/pegawai', (req, res) => {
	const { nama, jabatan, gaji } = req.body;
	if (!nama || !jabatan) return res.status(400).json({ message: 'Nama dan jabatan wajib diisi' });
	const data = readData();
	const newItem = { id: Date.now(), nama, jabatan, gaji: gaji || 0 };
	data.push(newItem);
	writeData(data);
	res.status(201).json(newItem);
});

app.put('/api/pegawai/:id', (req, res) => {
	const id = parseInt(req.params.id);
	const { nama, jabatan, gaji } = req.body;
	const data = readData();
	const idx = data.findIndex((x) => x.id === id);
	if (idx === -1) return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
	data[idx] = { ...data[idx], nama: nama ?? data[idx].nama, jabatan: jabatan ?? data[idx].jabatan, gaji: gaji ?? data[idx].gaji };
	writeData(data);
	res.json(data[idx]);
});

app.delete('/api/pegawai/:id', (req, res) => {
	const id = parseInt(req.params.id);
	let data = readData();
	const exists = data.some((x) => x.id === id);
	if (!exists) return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
	data = data.filter((x) => x.id !== id);
	writeData(data);
	res.json({ message: 'Pegawai berhasil dihapus' });
});

app.listen(PORT, () => {
	console.log(`Backend berjalan pada http://localhost:${PORT}`);
});
