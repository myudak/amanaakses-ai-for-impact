# AmanAkses Video Design

## Overview

AmanAkses menggunakan antarmuka terang yang tenang, aksesibel, dan tidak mengintimidasi. Struktur visualnya menggabungkan grid tipis, kartu putih dengan sudut besar, panel teal sebagai jangkar, serta aksen violet untuk AI dan status yang membutuhkan perhatian. Video mempertahankan bahasa visual produk dan menempatkan screenshot aktual sebagai bukti utama, bukan sekadar dekorasi.

## Colors

- **Warm White**: `#F4FBF9` - kanvas utama dan ruang bernapas.
- **Paper White**: `#FFFFFF` - kartu, bingkai screenshot, dan panel informasi.
- **Deep Slate**: `#0F172A` - headline dan informasi utama.
- **Body Slate**: `#475569` - body copy dan label sekunder.
- **Primary Teal**: `#0F766E` - identitas produk dan tindakan utama.
- **Bright Teal**: `#0D9488` - progres, garis, dan highlight aktif.
- **Mint**: `#CCFBF1` - status aman dan permukaan lembut.
- **Violet**: `#7C3AED` - AI, ketidakpastian, dan penekanan teknis.
- **Soft Violet**: `#F5F3FF` - panel batas AI dan latar data.
- **Safety Rose**: `#E11D48` - Keluar Cepat dan konteks bantuan mendesak.

## Typography

- **Primary**: Plus Jakarta Sans, weight 400-900. Dipakai untuk headline, body, label, dan caption agar sama dengan prototype.
- **Data Voice**: IBM Plex Mono, weight 500-700. Dipakai hanya untuk angka validasi, nama environment variable, route, dan metadata teknis.
- Headline video: 72-126 px, weight 800-900, tracking `-0.045em`.
- Body video: 28-38 px, weight 400-600, line-height 1.35-1.5.
- Data labels: 20-26 px, uppercase dengan tracking lebar.

## Elevation

Kedalaman berasal dari border teal/slate yang lembut, bayangan besar beropasitas rendah, dan pergeseran bidang screenshot. Hindari glassmorphism berat. Screenshot diletakkan di dalam browser frame putih dengan radius 28-36 px dan shadow yang cukup jelas untuk dibaca sebagai artefak produk.

## Components

- **Safe Browser Frame**: screenshot aktual dengan chrome bar sederhana dan route label.
- **Consent Pill**: label kecil berwarna mint atau violet untuk menjelaskan status.
- **Human Review Rail**: garis proses dari sumber, draf AI, edit, hingga keputusan manusia.
- **Validation Counter**: angka besar monospace dengan garis progres.
- **Accessibility Stack**: kartu route aksesibilitas yang bergerak seperti lembaran.
- **Safety Exit Panel**: panel rose yang tetap sederhana, tidak dramatis atau menakutkan.
- **Thesis Lockup**: pernyataan penutup “AI membantu menata. Manusia tetap menentukan.”

## Do's and Don'ts

### Do

- Gunakan screenshot aktual pada pembuka dan penutup.
- Pertahankan latar terang dengan grid teal yang sangat tipis.
- Gunakan teal sebagai jangkar dan violet hanya untuk konteks AI.
- Beri ruang baca minimal dua detik untuk setiap kalimat utama.
- Gunakan gerak profesional: push slide, focus pull, dan blur crossfade.

### Don't

- Jangan menggunakan neon, glitch, atau estetika “AI futuristik”.
- Jangan menampilkan data penyintas nyata atau API key.
- Jangan memakai gradient text.
- Jangan membuat AI tampak mengambil keputusan.
- Jangan menggunakan kartu identik memenuhi seluruh layar tanpa hierarki.
