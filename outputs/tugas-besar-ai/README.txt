TUGAS BESAR AI FOR REAL IMPACT 2026 - AMANAKSES
================================================

Judul:
AMANAKSES: PLATFORM DOKUMENTASI AMAN DAN AKSESIBEL
BAGI PENYANDANG DISABILITAS

Anggota:
1. Muchammad Yuda Tri Ananda (24060124110142)
2. Nadia Azura Nurhaniya (24060124120019)
3. Muhammad Zaidaan Ardiyansyah (24060124140200)
4. Anintya Abhi Wiryateja (24060124130053)
5. Muhamad Kemal Faza (24060124120013)

STATUS DOKUMEN FINAL
--------------------
1. Proposal.pdf
   - 19 halaman.
   - Format A4, Times New Roman 12 pt, hitam, spasi 1,5.
   - Margin kiri 4 cm; atas, kanan, dan bawah 3 cm.
   - Memuat ringkasan eksekutif, daftar isi, daftar tabel, daftar gambar,
     delapan BAB, marker gambar, dan daftar pustaka.

2. Dokumentasi_AI.pdf
   - 15 halaman.
   - Format sama dengan Proposal.pdf.
   - Membedakan AI di dalam produk, AI sebagai partner tim, dan alat
     produksi non-AI.
   - Memuat log prompt, kontrak structured output, contoh kesalahan,
     koreksi, validasi, formulir peer testing, refleksi, dan marker bukti.

SUMBER EDITABLE DAN GENERATOR
-----------------------------
- supporting/editable/Proposal_AmanAkses_Akademik.docx
- supporting/editable/Dokumentasi_AI_AmanAkses_Akademik.docx
- supporting/editable/Data_Feedback_Pengguna_Sintetis.xlsx
- supporting/build_academic_docs.py
- supporting/build_feedback_workbook.mjs

DIAGRAM DAN DATA PENDUKUNG BARU
-------------------------------
- supporting/diagrams/AmanAkses_Arsitektur_Sistem.svg
- supporting/diagrams/AmanAkses_Arsitektur_Sistem.png
- supporting/diagrams/AmanAkses_Alur_Pengguna_AI.svg
- supporting/diagrams/AmanAkses_Alur_Pengguna_AI.png
- AmanAkses_AI_For_Real_Impact/Data_Feedback_Pengguna_Sintetis.xlsx

Workbook feedback memuat 30 respons SINTETIS, dashboard, chart, data mentah,
instrumen peer testing, dan catatan etis. Angkanya tidak boleh diklaim sebagai
hasil survei, validasi pengguna, atau peer testing nyata.

PERINGATAN:
Menjalankan build_academic_docs.py akan membuat ulang kedua DOCX dan dapat
menimpa perubahan manual. Untuk mengganti marker gambar, edit salinan DOCX
final, bukan generator, kecuali perubahan memang harus permanen.

MARKER GAMBAR PROPOSAL
----------------------
1. [GAMBAR: Gambar web /app/dashboard]
2. [GAMBAR: Gambar web /app/pahami-kekerasan]
3. [GAMBAR: Gambar web /app/jurnal]
4. [GAMBAR: Gambar web /app/kronologi]
5. [GAMBAR: Gambar web /app/brankas-bukti]
6. [GAMBAR: Gambar web /app/pendamping]
7. [GAMBAR: Gambar web /app/laporan]
8. [GAMBAR: Gambar web /app/aksesibilitas]
9. [GAMBAR: Gambar web /safe-exit]

MARKER BUKTI DOKUMENTASI AI
---------------------------
1. [GAMBAR: Screenshot prompt ChatGPT untuk analisis masalah]
2. [GAMBAR: Screenshot Codex saat implementasi atau debugging]
3. [GAMBAR: Screenshot prompt desain structured output]
4. [GAMBAR: Gambar web /app/kronologi]
5. [GAMBAR: Screenshot contoh keluaran awal dan hasil setelah koreksi]
6. [GAMBAR: Screenshot terminal pnpm validate:timeline, pnpm build, dan
   pnpm lint]
7. [GAMBAR: Gambar web /app/asisten]
8. [GAMBAR: Diagram arsitektur sistem AmanAkses]
9. [GAMBAR: Dashboard feedback pengguna sintetis]

Cara mengganti marker:
1. Buka DOCX editable di Microsoft Word.
2. Temukan teks "[GAMBAR:" dengan fitur Find.
3. Hapus satu marker, lalu sisipkan gambar pada posisi yang sama.
4. Pertahankan caption yang sudah tersedia di bawah marker.
5. Atur gambar menjadi "In Line with Text" agar layout stabil.
6. Tekan Ctrl+A lalu F9 untuk memperbarui daftar isi dan nomor halaman.
7. Ekspor ulang ke PDF dan periksa semua halaman.

PLACEHOLDER YANG WAJIB DIPERIKSA
-------------------------------
Proposal:
- [[ISI_HASIL_UJI_PEER]]
- [[ISI_JUMLAH_PESERTA_PEER]]
- [[ISI_TANGGAL_UJI_PEER]]
- [[ISI_TEMUAN_UJI_PEER]]
- [[ISI_REVISI_SETELAH_UJI_PEER]]

Dokumentasi AI:
- [[ISI_BUKTI_GEMINI_LIVE_SETELAH_KEY_DIPASANG]]
- [[ISI_PESERTA_DAN_TANGGAL_UJI_PEER]]
- [[ISI_RINGKASAN_SKOR_UJI_PEER]]
- [[ISI_MASALAH_UTAMA_UJI_PEER]]
- [[ISI_REVISI_SETELAH_UJI_PEER]]
- [[ISI_SISA_MASALAH_UJI_PEER]]

Placeholder tidak boleh diganti dengan klaim tanpa bukti. Jika peer testing
atau panggilan Gemini live belum dilakukan, pertahankan keterangan bahwa
hasil belum tersedia.

HASIL QA DOKUMEN
----------------
- Proposal: 19 halaman berhasil diekspor dan diperiksa.
- Dokumentasi AI: 15 halaman berhasil diekspor dan diperiksa.
- Daftar isi dan nomor halaman diperbarui melalui Microsoft Word.
- Semua halaman dirender menjadi PNG dan diperiksa untuk clipping, tabel,
  pemisahan BAB, heading yatim, marker, caption, dan konsistensi layout.
- Preview QA berada di supporting/qa-academic-docs/, bukan folder pengumpulan.
- Narasi validasi menggunakan rumusan:
  "10 skenario utama lulus + 1 negative guard lulus".
- Chatbot: 12 skenario dukungan, tool, navigasi, dan keselamatan lulus.
- Empat tool memakai allowlist dan konfirmasi; route/tool tidak dikenal ditolak.

CHECKLIST PENGUMPULAN AKHIR
---------------------------
[ ] Ganti marker gambar yang ingin ditampilkan dengan screenshot aktual.
[ ] Isi hasil peer testing hanya setelah pengujian benar-benar dilakukan.
[ ] Tambahkan bukti Gemini live hanya setelah pengujian dengan API key.
[ ] Perbarui field Word dan ekspor ulang kedua PDF setelah perubahan manual.
[ ] Pastikan Presentasi.pptx dan Presentasi.pdf adalah versi terbaru.
[ ] Isi Prototype_Link.txt dengan URL deployment yang dapat dibuka.
[ ] Isi VideoDemo_Link.txt dengan URL video yang dapat dibuka.
[ ] Buat SourceCode.zip tanpa node_modules, dist, log, .env, dan API key.
[ ] Pastikan README.txt, Proposal.pdf, Dokumentasi_AI.pdf, presentasi, tautan,
    dan SourceCode.zip berada dalam folder pengumpulan akhir.
[ ] Buka setiap file dari folder pengumpulan akhir sebelum diunggah.
