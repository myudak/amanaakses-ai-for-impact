# Storyboard Video AmanAkses

**Format:** 1920 x 1080, 30 fps  
**Audio:** voice-over Indonesia, tanpa musik wajib  
**VO direction:** tenang, jelas, hangat, tidak dramatis; jeda pendek setelah klaim keselamatan  
**Style basis:** `DESIGN.md`

## Asset Audit

| Asset | Bagian | Peran |
|---|---:|---|
| `assets/screens/landing.png` | 1, 8 | identitas produk dan penutup |
| `assets/screens/dashboard.png` | 2, 3 | gambaran workflow utama |
| `assets/screens/learning.png` | 3 | informasi dasar |
| `assets/screens/journal.png` | 3 | pencatatan bertahap |
| `assets/screens/timeline.png` | 4 | pemilihan catatan sebelum AI |
| `assets/screens/timeline-review.png` | 5 | review, sumber, fallback |
| `assets/screens/report.png` | 6 | laporan awal dan batas produk |
| `assets/screens/accessibility.png` | 2 | preferensi akses |
| `assets/screens/safe-exit.png` | 2 | keluar cepat |

## Bagian 1 - Pembuka

**Konsep:** Dimulai dari kalimat masalah, kemudian landing page bergerak masuk sebagai jawaban yang masih harus dibuktikan.  
**Visual:** Background warm white, grid tipis, kata “ingat semuanya” dicoret secara visual, screenshot landing masuk dari kanan dengan perspective ringan.  
**Gerak:** Headline naik perlahan; garis coret menggambar; screenshot meluncur dengan `expo.out`.  
**Transisi:** push slide ke kiri, 0,55 detik.

## Bagian 2 - Apa Itu AmanAkses

**Konsep:** Produk dibaca sebagai ruang, bukan satu tombol pelaporan.  
**Visual:** Dashboard memenuhi bingkai besar. Accessibility dan safe-exit muncul sebagai dua kartu mengambang. Empat pill menunjukkan belajar, jurnal, kronologi, dan laporan.  
**Gerak:** Screenshot focus pull; kartu aksesibilitas masuk dari arah berbeda; route label mengetik.  
**Transisi:** blur crossfade, 0,6 detik.

## Bagian 3 - Alur Pengguna

**Konsep:** Alur bergerak dari memahami ke mencatat, bukan langsung meminta laporan.  
**Visual:** Tiga browser frame bertumpuk: learning, journal, dashboard. Garis proses teal menghubungkan “Pahami”, “Catat”, “Pilih”, “Tinjau”.  
**Gerak:** Frame bergeser horizontal seperti lembaran; node proses menyala berurutan.  
**Transisi:** vertical push, 0,5 detik.

## Bagian 4 - Safe Timeline Assistant

**Konsep:** AI bekerja di ruang sempit yang dibatasi kontrak.  
**Visual:** Screenshot timeline awal di kiri; di kanan, panel structured output menampilkan `sourceNoteIds`, field nullable, dan `requiresReview: true`.  
**Gerak:** Field JSON muncul satu per satu; garis menghubungkan catatan terpilih ke source reference.  
**Transisi:** focus pull ke hasil review, 0,65 detik.

## Bagian 5 - Human Review dan Fallback

**Konsep:** Keputusan berhenti di tangan pengguna.  
**Visual:** Screenshot timeline review menjadi pusat. Tiga pilihan “Edit”, “Terima”, “Tolak” muncul sebagai kontrol besar. Banner fallback ditampilkan sebagai mekanisme reliabilitas, bukan kemampuan AI tambahan.  
**Gerak:** Spotlight bergerak dari sumber ke tombol keputusan; check dan cross masuk bergantian.  
**Transisi:** push slide, 0,5 detik.

## Bagian 6 - Laporan dan Batas Data

**Konsep:** Laporan adalah pratinjau yang ditinjau, bukan keputusan otomatis.  
**Visual:** Screenshot laporan di kanan. Di kiri, data boundary sederhana: Browser -> `/api/timeline` -> Gemini; `GEMINI_API_KEY` tetap di sisi server.  
**Gerak:** Garis arsitektur menggambar; ikon kunci terkunci; teks batas produk muncul dengan interval.  
**Transisi:** blur crossfade, 0,55 detik.

## Bagian 7 - Validasi

**Konsep:** Klaim teknis ditampilkan sebagai bukti yang dapat diaudit.  
**Visual:** Angka `10/10`, `+1 guard`, `BUILD`, dan `LINT` memenuhi bidang; daftar kasus bergerak di belakang sebagai metadata.  
**Gerak:** Counter bertambah; progress rail mengisi; status lulus muncul dengan rhythm berbeda.  
**Transisi:** gentle color dip ke teal gelap, 0,65 detik.

## Bagian 8 - Penutup

**Konsep:** Kembali ke produk dan tesis utama.  
**Visual:** Landing page diredupkan di belakang. Teks “AI membantu menata.” muncul dulu; “Manusia tetap menentukan.” menjadi penutup terbesar.  
**Gerak:** Logo dan thesis masuk perlahan, kemudian fade final.  
**Transisi:** fade to warm white pada akhir video.

## Production Architecture

```text
amanaakses-demo-video/
├── index.html
├── DESIGN.md
├── SCRIPT.md
├── STORYBOARD.md
├── audio/
│   ├── scene-01.mp3
│   └── ...
├── assets/screens/
├── capture/
└── renders/
```
