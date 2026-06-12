# Naskah Voice-over Video Demo AmanAkses

Target: 3 menit sampai 3 menit 30 detik.

## Bagian 1 - Pembuka

Pelaporan tidak seharusnya dimulai dengan meminta seseorang mengingat semuanya sekaligus. Bagi penyandang disabilitas, hambatan bahasa, navigasi, komunikasi, dan beban kognitif dapat membuat proses mencari bantuan terasa semakin berat. AmanAkses dirancang dari pertanyaan sederhana: bagaimana teknologi dapat membantu menata pengalaman, tanpa mengambil kendali dari penggunanya?

## Bagian 2 - Apa Itu AmanAkses

AmanAkses adalah prototype ruang digital aksesibel untuk belajar, menulis jurnal secara bertahap, mengelola bukti, menyusun kronologi, dan meninjau laporan awal. Pengguna dapat memilih jalurnya sendiri, menyesuaikan kebutuhan aksesibilitas, menggunakan mode discreet, dan keluar cepat menuju halaman netral. Semua data dalam demonstrasi ini bersifat sintetis.

## Bagian 3 - Alur Pengguna

Alur dimulai dari informasi dasar yang mudah dibaca. Pengguna dapat memahami pilihan bantuan tanpa kewajiban langsung membuat laporan. Catatan disimpan bertahap melalui Jurnal Aman. Hanya catatan yang dipilih secara eksplisit yang dapat masuk ke proses berikutnya. Brankas bukti, pendamping tepercaya, dan laporan awal membentuk alur lanjutan yang tetap meminta persetujuan pengguna.

## Bagian 4 - Safe Timeline Assistant

Fitur AI utama AmanAkses adalah Safe Timeline Assistant. Pada halaman ini, pengguna memilih catatan sintetis yang ingin diproses. Gemini kemudian diminta menyusun draf peristiwa dalam struktur JSON yang terbatas. Setiap peristiwa wajib memiliki referensi ke catatan sumber. Tanggal, waktu, atau lokasi yang tidak tersedia harus tetap kosong atau ditandai tidak pasti. Sistem dilarang menyimpulkan niat, kesalahan, diagnosis, kebenaran, maupun status hukum.

## Bagian 5 - Human Review dan Fallback

Keluaran AI selalu diberi label sebagai draf yang belum diverifikasi. Pengguna dapat membuka sumber, mengedit isi, menandai perlunya pemeriksaan, menerima, atau menolak setiap peristiwa. Tidak ada hasil yang otomatis masuk ke laporan. Jika Gemini atau jaringan tidak tersedia, fallback deterministik menyusun format demonstrasi dari label yang tertulis. Mode fallback tetap mempertahankan sumber dan gerbang tinjauan manusia.

## Bagian 6 - Laporan dan Batas Data

Laporan awal merangkum informasi yang telah dipilih: ringkasan pengguna, kronologi yang diterima, bukti, dan kebutuhan akses. Dokumen ini bukan putusan hukum, diagnosis, atau penentu kebenaran. Kunci Gemini disimpan melalui environment variable server-side bernama GEMINI API KEY. Kunci tersebut tidak dikirim ke browser dan tidak dimasukkan ke source archive.

## Bagian 7 - Validasi

Prototype diuji menggunakan sepuluh skenario sintetis utama. Seluruh skenario lulus, termasuk tanggal yang hilang, waktu perkiraan, lokasi kosong, alias, dan catatan netral. Satu negative guard juga lulus dengan menolak respons yang menggunakan referensi sumber tidak valid. Build produksi dan lint lulus. Pengujian ini memvalidasi kontrak data dan fallback, bukan membuktikan ketepatan AI pada kasus nyata.

## Bagian 8 - Penutup

AmanAkses masih berupa prototype dan belum menggantikan pendamping profesional atau layanan resmi. Langkah berikutnya adalah co-design bersama komunitas disabilitas, peer testing, audit aksesibilitas yang lebih mendalam, dan evaluasi privasi sebelum pilot terbatas. Prinsip yang kami pertahankan tetap sama: AI membantu menata. Manusia tetap menentukan.
