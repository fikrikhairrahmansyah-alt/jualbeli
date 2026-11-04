const API = '/api/produk';
const $ = id => document.getElementById(id);
let kodeEdit = null;

const formProduk = $('formProduk');
const formPembeli = $('formPembeli');
const tabel = $('tabelProduk');
const pesan = $('pesan');

function tampilPesan(teks) {
	pesan.textContent = teks;
	setTimeout(() => pesan.textContent = '', 3000);
}


async function muatProduk() {
	try {
		const res = await fetch(API);
		if (!res.ok) throw new Error('Gagal mengambil data produk');
		const data = await res.json();
		tampilkanTabel(data);
	} catch (err) {
		tampilPesan(err.message);
	}
}

function tampilkanTabel(data) {
	tabel.replaceChildren();

	data.forEach(p => {
		const tr = document.createElement('tr');


		[p.kode_produk, p.nama_produk, `Rp ${p.harga}`, p.stok].forEach(text => {
			const td = document.createElement('td');
			td.textContent = text;
			tr.appendChild(td);
		});

		
		const tdAksi = document.createElement('td');

		const btnEdit = document.createElement('button');
		btnEdit.textContent = 'Edit';
		btnEdit.onclick = () => mulaiEdit(p);

		const btnHapus = document.createElement('button');
		btnHapus.textContent = 'Hapus';
		btnHapus.onclick = () => hapusProduk(p.kode_produk);

		tdAksi.append(btnEdit, btnHapus);
		tr.appendChild(tdAksi);

		tabel.appendChild(tr);
	});
}


async function simpanProduk(data) {
	try {
		const url = kodeEdit ? `${API}/${encodeURIComponent(kodeEdit)}` : API;
		const res = await fetch(url, {
			method: kodeEdit ? 'PUT' : 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});

		const resData = await res.json();
		if (!res.ok) throw new Error(resData.pesan || 'Gagal menyimpan data');

		batalEdit();
		await muatProduk();
		tampilPesan(resData.pesan);
	} catch (err) {
		tampilPesan(err.message);
	}
}

function mulaiEdit(p) {
	kodeEdit = p.kode_produk;
	$('kode').value = p.kode_produk;
	$('kode').disabled = true;
	$('nama').value = p.nama_produk;
	$('harga').value = p.harga;
	$('stok').value = p.stok;
	$('btnSimpan').textContent = 'Perbarui Produk';
}

function batalEdit() {
	kodeEdit = null;
	formProduk.reset();
	$('kode').disabled = false;
	$('btnSimpan').textContent = 'Simpan Produk';
}

async function hapusProduk(kode) {
	if (!confirm(`Hapus produk ${kode}?`)) return;
	try {
		const res = await fetch(`${API}/${encodeURIComponent(kode)}`, { method: 'DELETE' });
		if (!res.ok) throw new Error('Gagal menghapus produk');
		await muatProduk();
		tampilPesan('Produk berhasil dihapus');
	} catch (err) {
		tampilPesan(err.message);
	}
}


formPembeli.addEventListener('submit', async (e) => {
	e.preventDefault();
	const namaProduk = $('namaproduct').value.trim();
	const jumlah = parseInt($('jumlah').value, 10);

	try {
		const res = await fetch(`${API}/beli-nama`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ nama_produk: namaProduk, jumlah })
		});

		const resData = await res.json();
		if (!res.ok) throw new Error(resData.pesan || 'Gagal melakukan transaksi');

		tampilPesan(resData.pesan);
		formPembeli.reset();
		await muatProduk(); 
	} catch (err) {
		tampilPesan(err.message);
	}
});


formProduk.addEventListener('submit', async (e) => {
	e.preventDefault();
	const data = {
		kode_produk: $('kode').value.trim(),
		nama_produk: $('nama').value.trim(),
		harga: parseInt($('harga').value, 10),
		stok: parseInt($('stok').value, 10)
	};
	await simpanProduk(data);
});

$('btnBatal').addEventListener('click', batalEdit);

document.addEventListener('DOMContentLoaded', () => {
	muatProduk();
});