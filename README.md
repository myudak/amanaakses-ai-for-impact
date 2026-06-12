# AmanAkses

**AmanAkses** adalah prototipe platform dukungan digital aksesibel yang membantu
pengguna memahami pilihan bantuan, mencatat pengalaman secara aman, menata bukti,
menyusun kronologi, dan menyiapkan laporan awal dengan kendali penuh di tangan
pengguna.

Proyek ini dikembangkan untuk **Tugas Besar AI For Real Impact 2026**. Seluruh
data demonstrasi bersifat sintetis. AmanAkses bukan layanan darurat, alat
diagnosis, penasihat hukum, atau pengganti pendamping profesional.

## Fitur Utama

- **Pahami Situasi dan Pilihanmu**: materi edukasi non-grafis dengan mode ringkas
  dan lengkap.
- **Jurnal Aman**: ruang pencatatan terstruktur dengan starter yang tetap dapat
  diedit atau dihapus pengguna.
- **Safe Timeline Assistant**: Gemini membantu mengubah catatan terpilih menjadi
  draf kronologi dengan referensi sumber dan status tinjauan.
- **Asisten Aman**: dukungan emosional non-klinis, navigasi aplikasi, dan tool
  terkonfirmasi.
- **Brankas Bukti dan Laporan**: simulasi pengelolaan bukti serta pratinjau
  laporan berbasis persetujuan.
- **Aksesibilitas**: Easy Read, pengaturan ukuran teks, pengurangan gerak,
  navigasi keyboard, dan safe exit.

## Peran AI

AI hanya digunakan untuk membantu pengguna menata informasi, bukan menentukan
kebenaran suatu laporan.

### Safe Timeline Assistant

1. Pengguna memilih catatan yang boleh diproses.
2. Endpoint server mengirim data minimum ke Gemini.
3. Gemini menghasilkan JSON terstruktur.
4. Validator memeriksa struktur dan referensi sumber.
5. Setiap peristiwa tetap berstatus draf sampai diterima atau ditolak pengguna.

### Asisten Aman

Asisten Aman dapat mengusulkan empat tool:

| Tool | Fungsi |
| --- | --- |
| `draft_timeline` | Membuat draf kronologi dari catatan sintetis terpilih. |
| `prepare_journal` | Menyiapkan kerangka jurnal yang belum tersimpan. |
| `update_accessibility` | Mengubah preferensi aksesibilitas sesi. |
| `open_support` | Membuka halaman pendamping, bantuan, atau safe exit. |

Semua tool memakai allowlist dan memerlukan konfirmasi eksplisit. Pada respons
darurat, tool produktivitas diblokir dan sistem memprioritaskan akses ke bantuan
manusia.

## Arsitektur

```text
React + Vite
    |
    | POST /api/chat
    | POST /api/timeline
    v
Node serverless functions
    |
    |-- GEMINI_API_KEY tersedia --> Gemini structured output
    |-- Gemini gagal/tidak tersedia --> deterministic fallback
    v
Schema validation
    v
Editable human-review interface
```

Kunci Gemini hanya dibaca oleh endpoint server. Jangan menggunakan nama
`VITE_GEMINI_API_KEY`, karena variabel berawalan `VITE_` akan dimasukkan ke
bundle browser.

## Struktur Proyek

```text
AmanAkses/
├── demo-web/                         Aplikasi React/Vite dan serverless API
├── AmanAkses_AI_For_Real_Impact/     Paket final pengumpulan
├── outputs/                          Hasil ekspor dokumen
├── prototipe-gambar/                 Referensi visual prototipe
├── supporting/                       Source dokumen, QA, diagram, dan script
├── README.md                         Dokumentasi proyek
└── .gitignore
```

Folder aplikasi:

```text
demo-web/
├── api/
│   ├── chat.ts
│   └── timeline.ts
├── src/
│   ├── assets/
│   ├── components/
│   ├── data/
│   └── lib/
├── validation/
├── .env.example
└── vercel.json
```

## Menjalankan Secara Lokal

Persyaratan:

- Node.js 22 atau lebih baru
- pnpm
- Gemini API key untuk mode AI live

```powershell
cd demo-web
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

Isi `demo-web/.env.local`:

```env
GEMINI_API_KEY=your_google_ai_studio_key
GEMINI_MODEL=gemini-3.1-flash-lite
```

Vite menjalankan frontend serta endpoint `/api/chat` dan `/api/timeline` dalam
satu proses. Tanpa API key, aplikasi tetap dapat didemonstrasikan menggunakan
fallback deterministik.

## Validasi

Jalankan dari folder `demo-web`:

```powershell
pnpm lint
pnpm build
pnpm validate:timeline
pnpm validate:chat
```

Baseline validasi saat paket terakhir dibuat:

- build produksi lulus;
- lint lulus;
- 10/10 skenario timeline lulus beserta invalid-source guard;
- 12/12 skenario chatbot lulus;
- fallback tanpa Gemini tersedia;
- tool tidak dikenal ditolak;
- tool produktivitas diblokir pada respons darurat;
- secret tidak terdapat dalam bundle dan arsip source.

## Deployment Vercel

Proyek tidak perlu dikonversi ke Next.js. Vite menangani frontend, sedangkan
file dalam `demo-web/api` dijalankan sebagai Vercel Functions.

### Melalui CLI

```powershell
cd demo-web
vercel link
vercel --prod
```

Tambahkan environment variables berikut melalui dashboard Vercel:

```text
GEMINI_API_KEY
GEMINI_MODEL=gemini-3.1-flash-lite
```

### Melalui GitHub

Saat mengimpor monorepo ini ke Vercel, gunakan pengaturan:

```text
Root Directory:
SOFTWARE - Pengembangan Perangkat Lunak/AmanAkses/demo-web

Framework Preset: Vite
Build Command: pnpm build
Output Directory: dist
Install Command: pnpm install
```

Sesudah deployment, uji route `/app/dashboard`, `/app/kronologi`, dan chatbot.
Pastikan respons menunjukkan Gemini aktif dan bukan fallback.

## Paket Pengumpulan

Folder `AmanAkses_AI_For_Real_Impact` berisi artefak final:

- `Proposal.pdf`
- `Dokumentasi_AI.pdf`
- `Presentasi.pptx` dan `Presentasi.pdf`
- `Data_Feedback_Pengguna_Sintetis.xlsx`
- diagram arsitektur dan alur pengguna
- `SourceCode.zip`
- placeholder tautan prototipe dan video
- checklist pada `README.txt`

Dokumen editable, script generator, hasil render, dan bukti QA berada di folder
`supporting`.

## Privasi, Etika, dan Batasan

- Gunakan hanya data sintetis untuk pengembangan, pengujian, dan presentasi.
- Jangan masukkan catatan penyintas nyata ke deployment demo.
- Keluaran AI selalu merupakan draf yang wajib ditinjau manusia.
- Sistem tidak menentukan niat, kesalahan, diagnosis, status hukum, atau
  kebenaran laporan.
- Penyimpanan produksi, autentikasi, enkripsi, unggah bukti, dan integrasi
  layanan eksternal masih berupa simulasi atau rencana pengembangan.
- Asisten Aman memberi dukungan emosional non-klinis dan bukan psikiater,
  psikolog, konselor, atau layanan darurat.

## Status

Prototipe dan paket dokumen telah tersedia. Sebelum pengumpulan final, tim masih
perlu mengisi identitas, melakukan peer testing nyata, memasukkan URL deployment,
dan mengunggah video demonstrasi.

