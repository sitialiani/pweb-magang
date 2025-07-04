const { PengajuanMagang, Mahasiswa, Lowongan, Perusahaan, User } = require("../../../models");

const path = require("path");

exports.getDetailPengajuan = async (req, res) => {
  try {
    const pengajuanId = req.params.id;

    // Ambil pengajuan dengan relasi
    const pengajuan = await PengajuanMagang.findOne({
      where: { id: pengajuanId },
      include: [
        {
          model: Mahasiswa,
          as: 'mahasiswa',
          include: [{ model: User, as: 'user' }],
        },
        {
          model: Lowongan,
          as: 'lowongan',
          include: [{ 
            model: Perusahaan,
            as: 'perusahaanData'
          }],
        },
      ],
    });

    if (!pengajuan) {
      return res.status(404).send("Pengajuan tidak ditemukan");
    }

    const detail = {
      nama: pengajuan.mahasiswa?.nama || "Tidak diketahui",
      nim: pengajuan.mahasiswa?.nim || "-",
      perusahaan: pengajuan.lowongan?.perusahaanData?.nama || "-",
      deskripsi: pengajuan.lowongan?.deskripsi || "-",
      tanggal:
        typeof pengajuan.tanggal_pengajuan === "string"
          ? pengajuan.tanggal_pengajuan.slice(0, 10)
          : new Date(pengajuan.tanggal_pengajuan).toISOString().slice(0, 10),
      status: pengajuan.status || "-",
      verifikasi: pengajuan.verifikasi || "-",
      keterangan: pengajuan.keterangan || "Tidak ada catatan.",
      cv: pengajuan.cv || null,
      transkrip: pengajuan.transkrip || null,
      krs: pengajuan.krs || null,
      dokumen_pendukung: pengajuan.dokumen_pendukung || null,
    };

    res.render("detailPengajuan", { detail });
  } catch (error) {
    console.error("ERROR DETAIL:", error);
    res.status(500).send("Terjadi kesalahan saat memuat detail pengajuan.");
  }
};
