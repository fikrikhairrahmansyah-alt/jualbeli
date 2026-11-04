const express = require('express');
const app = express();
const db = require('./database');

app.use(express.json());
app.use(express.static('public'));


app.get('/api/produk', async (req, res) => {
	try {
		const [rows] = await db.query('SELECT * FROM produk ORDER BY kode_produk ASC');
		res.json(rows);
	} catch (err) {
		res.status(500).json({ pesan: 'Gagal mengambil data produk' });
	}
});


app.post('/api/produk', async (req, res) => {
	const { kode_produk, nama_produk, harga, stok } = req.body;
	if (!kode_produk || !nama_produk || harga === undefined || stok === undefined) {
		return res.status(400).json({ pesan: 'Isi semua kolom' });
	}
	try {
		await db.execute(
			'INSERT INTO produk (kode_produk, nama_produk, harga, stok) VALUES (?, ?, ?, ?)',
			[kode_produk, nama_produk, harga, stok]
		);
		res.status(201).json({ pesan: 'Produk berhasil ditambahkan' });
	} catch (err) {
		res.status(400).json({ pesan: 'Kode produk sudah ada' });
	}
});


app.put('/api/produk/:kode', async (req, res) => {
	const { nama_produk, harga, stok } = req.body;
	try {
		const [hasil] = await db.execute(
			'UPDATE produk SET nama_produk=?, harga=?, stok=? WHERE kode_produk=?',
			[nama_produk, harga, stok, req.params.kode]
		);
		if (!hasil.affectedRows) return res.sendStatus(404);
		res.json({ pesan: 'Produk berhasil diperbarui' });
	} catch (err) {
		res.sendStatus(500);
	}
});


app.delete('/api/produk/:kode', async (req, res) => {
	try {
		const [hasil] = await db.execute('DELETE FROM produk WHERE kode_produk=?', [req.params.kode]);
		if (!hasil.affectedRows) return res.sendStatus(404);
		res.json({ pesan: 'Produk berhasil dihapus' });
	} catch (err) {
		res.sendStatus(500);
	}
});


app.post('/api/produk/beli-nama', async (req, res) => {
	const { nama_produk, jumlah } = req.body;
	const qty = parseInt(jumlah, 10);

	if (!nama_produk || !qty || qty <= 0) {
		return res.status(400).json({ pesan: 'Input nama produk atau jumlah tidak valid' });
	}

	try {
		
		const [rows] = await db.execute('SELECT * FROM produk WHERE nama_produk = ?', [nama_produk]);

		if (rows.length === 0) {
			return res.status(404).json({ pesan: 'Produk tidak ditemukan' });
		}

		const produk = rows[0];

		if (produk.stok < qty) {
			return res.status(400).json({ pesan: 'Stok tidak mencukupi!' });
		}

		
		await db.execute('UPDATE produk SET stok = stok - ? WHERE kode_produk = ?', [qty, produk.kode_produk]);
		res.json({ pesan: `Pembelian ${nama_produk} berhasil! Sisa stok: ${produk.stok - qty}` });
	} catch (err) {
		res.status(500).json({ pesan: 'Gagal memproses transaksi' });
	}
});

app.listen(3000, () => console.log('Server berjalan di http://localhost:3000'));