# AmanAkses

AmanAkses adalah prototype web aksesibel yang membantu pengguna memahami pilihan bantuan, membuat jurnal aman, menata bukti sintetis, menyusun kronologi, dan meninjau laporan awal dengan kendali persetujuan yang jelas.

Prototype ini dikembangkan untuk tugas besar **AI For Real Impact 2026**. AI digunakan secara terbatas pada **Safe Timeline Assistant** dan **Asisten Aman**, bukan sebagai alat penentu kebenaran atau pengganti bantuan manusia.

## Pengalaman Produk

- **Pahami Situasi dan Pilihanmu** berisi lima modul edukasi non-grafis dengan tujuan belajar, mode ringkas/lengkap, checklist, kalimat bantu, progres, dan jalur menuju jurnal atau bantuan manusia.
- **Safe Timeline Assistant** memakai skenario kasus sintetis, enam sumber dengan metadata, tautan bukti, kebutuhan akses, jejak sumber, dan keputusan review per peristiwa.
- Foto profil Siti adalah identitas sintetis yang dibuat khusus untuk prototype, bukan foto pengguna atau tokoh nyata.
- Ikon antarmuka memakai satu sistem Lucide agar konsisten, aksesibel, dan tidak bergantung pada gambar eksternal.

## Safe Timeline Assistant

Alur utama:

1. Pengguna memilih catatan sintetis yang boleh diproses.
2. Server meminta Gemini mengekstrak peristiwa ke struktur JSON terbatas.
3. Setiap peristiwa menampilkan sumber, bagian yang tidak pasti, dan label draft.
4. Pengguna dapat mengedit, menerima, menolak, atau menandai hasil untuk diperiksa.
5. Hanya peristiwa yang diterima yang dinyatakan siap masuk laporan awal.

AI dilarang:

- menambahkan fakta yang tidak tertulis;
- menentukan apakah suatu laporan benar;
- menyimpulkan niat, kesalahan, atau identitas;
- memberi diagnosis atau keputusan hukum;
- mengirim laporan tanpa persetujuan pengguna.

## Asisten Aman

Asisten Aman adalah chatbot dukungan emosional non-klinis, navigasi, dan persiapan. Ia dapat:

- merespons kecemasan atau rasa kewalahan dengan bahasa suportif, grounding sederhana, pilihan kecil, dan satu pertanyaan tindak lanjut;
- menjelaskan fungsi menu AmanAkses;
- menyarankan route internal yang relevan;
- membantu pengguna memilih antara edukasi, jurnal, timeline, pendamping, laporan, atau pengaturan aksesibilitas;
- mengusulkan tool terstruktur untuk membuat draft kronologi, menyiapkan kerangka jurnal, mengubah aksesibilitas, atau membuka bantuan manusia;
- mengenali bahasa darurat secara konservatif dan mengarahkan pengguna ke bantuan manusia serta keluar cepat.

Setiap tool memakai allowlist dan selalu memerlukan konfirmasi eksplisit. Chatbot tidak meminta detail kasus, tidak bertindak sebagai psikiater/psikolog/konselor, tidak memberi diagnosis atau nasihat hukum, dan tidak menghubungi layanan eksternal secara otomatis.

### Tool Asisten Aman

| Tool | Hasil |
|---|---|
| `draft_timeline` | Memanggil Safe Timeline Assistant dengan catatan sintetis, menyimpan handoff sementara, lalu membuka review kronologi. |
| `prepare_journal` | Mengisi editor jurnal dengan kerangka yang masih dapat diubah atau dihapus. |
| `update_accessibility` | Menerapkan Easy Read, ukuran teks, dan pengurangan gerak pada state sesi. |
| `open_support` | Membuka pendamping, pusat bantuan, atau safe exit tanpa mengirim data. |

Tool yang tidak dikenal dibuang validator. Dalam respons berstatus darurat, tool produktivitas seperti kronologi dan jurnal diblokir.

## Arsitektur

```text
React/Vite UI
    |
    | POST /api/timeline atau POST /api/chat
    v
Vite local API middleware / serverless deployment
    |-- GEMINI_API_KEY tersedia --> Gemini structured JSON
    |-- API gagal/tidak tersedia -> deterministic local fallback
    v
Shared schema validation
    v
Editable human-review interface
```

Kunci Gemini hanya dibaca di server. Jangan membuat variabel `VITE_GEMINI_API_KEY`, karena variabel dengan awalan `VITE_` akan masuk ke bundle browser.

## Menjalankan Lokal

Persyaratan:

- Node.js 22 atau lebih baru
- pnpm

```bash
pnpm install
pnpm dev
```

Konfigurasi Vite memuat middleware API lokal, sehingga `pnpm dev` menjalankan frontend, `/api/timeline`, dan `/api/chat` dalam satu server. Vercel CLI tidak diperlukan untuk pengembangan lokal.

Buat `.env.local` dari `.env.example`:

```env
GEMINI_API_KEY=your_key
GEMINI_MODEL=gemini-3.1-flash-lite
```

Semua data contoh dalam aplikasi bersifat sintetis. Jangan memasukkan data penyintas nyata ke deployment demo.

## Pemeriksaan

```bash
pnpm lint
pnpm build
pnpm validate:timeline
pnpm validate:chat
```

Validasi timeline menjalankan sepuluh skenario sintetis untuk memeriksa:

- struktur respons;
- keterhubungan setiap event dengan sumber;
- tanggal/waktu/lokasi yang hilang tetap kosong;
- penandaan informasi ambigu;
- tidak adanya event tanpa catatan sumber;
- mode fallback yang dapat digunakan tanpa API.

Validasi chatbot menjalankan dua belas skenario navigasi, dukungan emosional, tool, dan keselamatan. Pengujian memastikan route eksternal dan tool tidak dikenal ditolak, semua tool memerlukan konfirmasi, serta tool produktivitas diblokir pada respons darurat.

## Deployment Opsional

Konfigurasi `vercel.json` disediakan sebagai salah satu target deployment publik, tetapi tidak dibutuhkan untuk demo lokal.

1. Impor folder ini sebagai project Vercel atau host yang mendukung fungsi Node server-side.
2. Framework preset: Vite.
3. Tambahkan `GEMINI_API_KEY` pada Environment Variables.
4. Opsional: tambahkan `GEMINI_MODEL`.
5. Deploy dan uji `/app/kronologi`.

`vercel.json` mempertahankan route SPA sambil membiarkan `/api/*` ditangani sebagai serverless function.

## Struktur Penting

```text
api/timeline.ts                    Gemini serverless endpoint
api/chat.ts                        Gemini chatbot endpoint
src/lib/timelineAssistant.ts       fallback dan validasi skema
src/lib/chatAssistant.ts           fallback, route allowlist, dan validasi chatbot
src/data/mockData.ts               data sintetis
src/App.tsx                        antarmuka dan human review
src/assets/*.webp                  hero dan foto profil sintetis teroptimasi
validation/                        sepuluh fixture pengujian
.env.example                       contoh konfigurasi aman
vercel.json                        konfigurasi deployment
```

## Batasan Prototype

- Penyimpanan, enkripsi, autentikasi, unggah bukti, berbagi, dan ekspor masih berupa simulasi UI.
- Fallback mengekstrak label tanggal, waktu, dan lokasi secara konservatif; ia bukan NLP penuh.
- Gemini dapat salah memahami konteks meskipun output dibatasi dengan skema.
- Deteksi bahasa darurat pada chatbot bersifat konservatif dan bukan penilaian risiko klinis.
- Prototype belum diuji dengan pengguna penyandang disabilitas atau penyintas.
- Direktori bantuan dan identitas layanan bersifat contoh.
- Produk ini bukan layanan darurat, diagnosis, nasihat hukum, atau pengganti pendamping profesional.

## Privasi dan Etika

- Gunakan data sintetis untuk pengembangan dan presentasi.
- Minimalkan data yang dikirim ke model.
- Jangan menyimpan isi catatan di log.
- Selalu sediakan jalur tanpa AI.
- Tampilkan sumber dan ketidakpastian.
- Wajibkan tinjauan manusia sebelum hasil dipakai atau dibagikan.
- Lakukan konsultasi dengan organisasi disabilitas dan penyedia layanan sebelum penggunaan nyata.
