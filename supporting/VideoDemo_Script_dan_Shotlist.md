# Naskah Video Demo AmanAkses

Target durasi: 3 menit 45 detik sampai 4 menit 30 detik.

## Naskah Narasi

### 00:00-00:25 - Pembuka

"Halo, kami dari [[ISI_NAMA_KELOMPOK]]. AmanAkses adalah prototipe pendamping aksesibel yang membantu pengguna belajar, mencatat pengalaman, menyusun kronologi, dan meninjau draf laporan. Prinsip utamanya sederhana: AI membantu menata, tetapi manusia tetap menentukan."

### 00:25-00:55 - Masalah

"Proses pelaporan sering menuntut pengguna mengingat detail, menulis ulang informasi, menyusun urutan kejadian, dan berpindah ke kanal yang belum tentu aksesibel. Beban ini dapat menjadi lebih berat bagi pengguna dengan hambatan penglihatan, mobilitas, komunikasi, atau kognitif."

### 00:55-01:25 - Alur Utama

"AmanAkses menghubungkan materi belajar, jurnal privat, penyusunan kronologi, dan pratinjau laporan. Pengguna tetap mengendalikan catatan mana yang diproses, dapat menggunakan safe exit, dan harus memberi persetujuan sebelum hasil bergerak ke tahap berikutnya."

### 01:25-02:45 - Safe Timeline Assistant

"Pada fitur Safe Timeline Assistant, kami menggunakan catatan sintetis untuk demonstrasi. Pengguna memilih catatan yang ingin diproses, lalu sistem membuat draf kronologi. Setiap peristiwa menyertakan referensi ke catatan sumber. Informasi yang tidak tersedia harus tetap kosong atau ditandai tidak pasti, bukan ditebak."

"Keluaran ini bukan fakta yang telah diverifikasi dan bukan kesimpulan hukum. Pengguna dapat mengedit judul, tanggal, deskripsi, dan ketidakpastian. Setelah memeriksa sumbernya, pengguna harus memilih menerima atau menolak setiap peristiwa."

"Jika Gemini tidak tersedia, prototipe menggunakan fallback deterministik. Dengan demikian, demo tetap dapat berjalan tanpa mengubah prinsip keselamatan atau struktur hasil."

### 02:45-03:30 - Arsitektur dan Validasi

"Kunci Gemini disimpan sebagai variabel server-side GEMINI_API_KEY pada fungsi Vercel, sehingga tidak masuk ke browser. Sepuluh skenario sintetis telah divalidasi untuk memastikan struktur JSON benar, semua peristiwa memiliki referensi sumber, informasi hilang tidak ditebak, dan fallback aktif saat API gagal. Build dan lint juga telah lulus."

### 03:30-04:05 - Penutup

"Prototipe ini belum menggantikan pendamping profesional, memverifikasi kebenaran, atau membuat keputusan otomatis. Langkah berikutnya adalah uji partisipatif dengan pengguna, evaluasi aksesibilitas yang lebih mendalam, dan deployment. AmanAkses dirancang agar teknologi memperkuat agensi pengguna, bukan mengambil alih keputusan mereka."

## Shot List

| Waktu | Visual | Aksi |
|---|---|---|
| 00:00-00:12 | Slide judul presentasi | Tampilkan janji utama AmanAkses. |
| 00:12-00:25 | Beranda prototipe | Sorot identitas visual dan tombol masuk. |
| 00:25-00:55 | Slide masalah/hambatan | Gunakan pointer untuk empat jenis hambatan. |
| 00:55-01:25 | Navigasi utama prototipe | Buka alur belajar, jurnal, timeline, dan pratinjau laporan secara singkat. |
| 01:25-01:50 | Halaman Safe Timeline Assistant | Tunjukkan label data sintetis dan batas aman pemrosesan. |
| 01:50-02:10 | Panel pilih catatan | Pilih tiga catatan sintetis lalu klik susun draf. |
| 02:10-02:35 | Panel draf peristiwa | Buka referensi sumber dan edit satu kolom. |
| 02:35-02:45 | Tombol keputusan | Terima satu peristiwa dan tolak satu peristiwa. |
| 02:45-03:05 | Banner fallback | Jelaskan demo tetap berjalan saat API tidak tersedia. |
| 03:05-03:30 | Slide arsitektur/validasi | Sorot server-side key, 10/10 skenario, build, dan lint. |
| 03:30-04:05 | Slide penutup | Akhiri dengan "AI membantu menata. Manusia tetap menentukan." |

## Catatan Rekaman

- Rekam pada resolusi minimal 1080p dengan zoom browser 100%.
- Jangan menampilkan API key, tab pribadi, notifikasi, atau data nyata.
- Gunakan hanya catatan sintetis yang sudah tersedia di prototipe.
- Pastikan teks dan kursor terlihat jelas serta narasi tidak terlalu cepat.
- Ganti semua placeholder sebelum unggah.

