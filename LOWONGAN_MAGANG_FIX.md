# Perbaikan Halaman Lowongan Magang

## Masalah yang Ditemukan
Error: `Unknown column 'judul' in 'field list'` - Model mencoba mengakses kolom yang tidak ada di database.

## Penyebab
Model `Lowongan` mendefinisikan field yang tidak sesuai dengan struktur tabel di database:
- Model mencoba mengakses: `judul`, `kualifikasi`, `tanggal_dibuka`, `tanggal_ditutup`, `link_berkas`
- Tabel database hanya memiliki: `id`, `perusahaan`, `lokasi`, `durasi`, `deadlinependaftaran`, `deskripsi`

## Perbaikan yang Dilakukan

### 1. Model Lowongan (models/lowongan.js)
**Sebelum:**
```javascript
Lowongan.init({
  perusahaan: { type: DataTypes.STRING, allowNull: false },
  judul: { type: DataTypes.STRING, allowNull: false }, // ❌ Tidak ada di DB
  lokasi: { type: DataTypes.STRING },
  durasi: { type: DataTypes.STRING },
  deadlinependaftaran: { type: DataTypes.DATEONLY },
  deskripsi: { type: DataTypes.TEXT },
  kualifikasi: { type: DataTypes.TEXT }, // ❌ Tidak ada di DB
  tanggal_dibuka: { type: DataTypes.DATEONLY }, // ❌ Tidak ada di DB
  tanggal_ditutup: { type: DataTypes.DATEONLY }, // ❌ Tidak ada di DB
  link_berkas: { type: DataTypes.STRING } // ❌ Tidak ada di DB
})
```

**Sesudah:**
```javascript
Lowongan.init({
  perusahaan: { type: DataTypes.STRING, allowNull: false },
  lokasi: { type: DataTypes.STRING, allowNull: false },
  durasi: { type: DataTypes.STRING, allowNull: false },
  deadlinependaftaran: { type: DataTypes.DATEONLY },
  deskripsi: { type: DataTypes.TEXT }
})
```

### 2. Controller (src/controllers/adminController.js)

#### Fungsi tambahLowongan()
**Sebelum:**
```javascript
const { perusahaan, judul, lokasi, durasi, deadlinependaftaran, deskripsi, kualifikasi, tanggal_dibuka, tanggal_ditutup, link_berkas } = req.body;

await Lowongan.create({
  perusahaan, judul, lokasi, durasi, deadlinependaftaran, deskripsi, kualifikasi, tanggal_dibuka, tanggal_ditutup, link_berkas
});
```

**Sesudah:**
```javascript
const { perusahaan, lokasi, durasi, deadlinependaftaran, deskripsi } = req.body;

await Lowongan.create({
  perusahaan, lokasi, durasi, deadlinependaftaran, deskripsi
});
```

### 3. View (src/views/lowongan_magang.ejs)

#### Form Input
**Sebelum:**
- Input judul lowongan
- Input tanggal dibuka/ditutup
- Input link berkas
- Input kualifikasi

**Sesudah:**
- Hanya input yang sesuai dengan database:
  - Perusahaan (dropdown)
  - Lokasi
  - Durasi
  - Deadline pendaftaran
  - Deskripsi

#### Tampilan Daftar Lowongan
**Sebelum:**
```ejs
<h3><%= item.judul %></h3>
<li><strong>Dibuka:</strong> <%= item.tanggal_dibuka %></li>
<li><strong>Ditutup:</strong> <%= item.tanggal_ditutup %></li>
<p><strong>Kualifikasi:</strong> <%= item.kualifikasi %></p>
<a href="<%= item.link_berkas %>">Lihat Berkas</a>
```

**Sesudah:**
```ejs
<h3>Lowongan Magang</h3>
<li><strong>Deadline:</strong> <%= item.deadlinependaftaran %></li>
<% if (item.deskripsi) { %>
  <p><strong>Deskripsi:</strong> <%= item.deskripsi %></p>
<% } %>
```

## Field yang Digunakan (Sesuai Database)

| Field | Type | Required | Keterangan |
|-------|------|----------|------------|
| `id` | INTEGER | ✅ | Primary Key |
| `perusahaan` | STRING(150) | ✅ | Nama perusahaan |
| `lokasi` | STRING(150) | ✅ | Lokasi kerja |
| `durasi` | STRING(150) | ✅ | Durasi magang |
| `deadlinependaftaran` | DATEONLY | ❌ | Deadline pendaftaran |
| `deskripsi` | TEXT | ❌ | Deskripsi pekerjaan |

## Fitur yang Tersedia

### ✅ Berfungsi
- Tambah lowongan baru
- Hapus lowongan
- Tampilan daftar lowongan
- Flash messages untuk feedback
- Validasi input (perusahaan, lokasi, durasi)
- Dropdown perusahaan

### ❌ Tidak Tersedia (Karena tidak ada di database)
- Edit lowongan
- Field judul lowongan
- Field kualifikasi
- Field tanggal dibuka/ditutup
- Field link berkas

## Cara Menambah Field Baru

Jika ingin menambah field baru seperti `judul`, `kualifikasi`, dll:

1. **Buat migration baru:**
   ```bash
   npx sequelize-cli migration:generate --name add-fields-to-lowongan
   ```

2. **Edit migration file:**
   ```javascript
   await queryInterface.addColumn('lowongan', 'judul', {
     type: Sequelize.STRING(150),
     allowNull: false
   });
   ```

3. **Jalankan migration:**
   ```bash
   npx sequelize-cli db:migrate
   ```

4. **Update model dan controller**

## Status
✅ **Halaman lowongan magang sudah berfungsi dan sesuai dengan struktur database yang ada.**

Akses: `http://localhost:3000/admin/lowongan-magang` 