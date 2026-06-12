import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = path.resolve(import.meta.dirname, "..");
const outputDir = path.join(root, "AmanAkses_AI_For_Real_Impact");
const supportingDir = path.join(root, "supporting", "editable");
const previewDir = path.join(root, "supporting", "feedback-workbook-preview");
const outputName = "Data_Feedback_Pengguna_Sintetis.xlsx";

const palette = {
  teal: "#0F766E",
  teal2: "#0D9488",
  tealSoft: "#E6FFFA",
  violet: "#6D28D9",
  violetSoft: "#F5F3FF",
  rose: "#BE123C",
  roseSoft: "#FFF1F2",
  amber: "#B45309",
  amberSoft: "#FFF7ED",
  slate: "#0F172A",
  muted: "#475569",
  line: "#CBD5E1",
  surface: "#F8FAFC",
  white: "#FFFFFF",
};

const roles = ["Mahasiswa", "Mahasiswa", "Mahasiswa", "Mahasiswa", "Pendamping sebaya"];
const accessNeeds = [
  "Tidak ada kebutuhan spesifik",
  "Penglihatan",
  "Pendengaran",
  "Motorik",
  "Neurodivergent/kognitif",
  "Multi-disabilitas",
];
const devices = ["Laptop", "Laptop", "Ponsel", "Ponsel", "Tablet"];
const tasks = [
  "Menemukan materi easy-read",
  "Membuat jurnal sintetis",
  "Menyusun kronologi dengan AI",
  "Bertanya kepada Asisten Aman",
  "Meninjau laporan dan consent",
  "Mengaktifkan aksesibilitas",
];
const features = [
  "Safe Timeline Assistant",
  "Asisten Aman AI",
  "Jurnal Aman",
  "Aksesibilitas",
  "Keluar Cepat",
  "Persetujuan berbagi",
];
const weightedFeatureChoices = [
  "Safe Timeline Assistant",
  "Asisten Aman AI",
  "Safe Timeline Assistant",
  "Aksesibilitas",
  "Asisten Aman AI",
  "Jurnal Aman",
  "Safe Timeline Assistant",
  "Keluar Cepat",
  "Asisten Aman AI",
  "Persetujuan berbagi",
  "Safe Timeline Assistant",
  "Aksesibilitas",
  "Asisten Aman AI",
  "Jurnal Aman",
  "Safe Timeline Assistant",
  "Keluar Cepat",
  "Asisten Aman AI",
  "Persetujuan berbagi",
  "Safe Timeline Assistant",
  "Aksesibilitas",
  "Asisten Aman AI",
  "Jurnal Aman",
  "Safe Timeline Assistant",
  "Keluar Cepat",
  "Asisten Aman AI",
  "Aksesibilitas",
  "Safe Timeline Assistant",
  "Jurnal Aman",
  "Asisten Aman AI",
  "Persetujuan berbagi",
];
const comments = [
  "Alur langkahnya jelas, tetapi penjelasan mode fallback perlu dibuat lebih singkat.",
  "Tombol menerima dan menolak event mudah dipahami.",
  "Saya ingin indikator yang lebih jelas bahwa chatbot bukan konselor.",
  "Ukuran teks dan kontras membantu, namun beberapa kartu masih cukup padat.",
  "Sumber catatan pada timeline membuat hasil AI terasa lebih dapat diperiksa.",
  "Keluar cepat mudah ditemukan dan terasa penting.",
  "Istilah consent sebaiknya selalu disertai padanan bahasa Indonesia.",
  "Asisten Aman membantu menemukan menu tanpa harus menghafal navigasi.",
  "Saya sempat ragu apakah laporan benar-benar terkirim; label simulasi perlu lebih menonjol.",
  "Pilihan pendamping dan ruang lingkup izin merupakan bagian yang paling meyakinkan.",
];

function clamp(value, min = 1, max = 5) {
  return Math.max(min, Math.min(max, value));
}

const rows = Array.from({ length: 30 }, (_, index) => {
  const i = index + 1;
  const need = accessNeeds[index % accessNeeds.length];
  const base = 4 + ((index * 7) % 3) - 1;
  const success = index % 11 === 0 ? "Perlu bantuan" : "Berhasil";
  const time = Number((3.2 + ((index * 13) % 45) / 10 + (success === "Perlu bantuan" ? 2.4 : 0)).toFixed(1));
  const ease = clamp(base + (index % 4 === 0 ? 1 : 0));
  const clarity = clamp(base + (index % 5 === 0 ? 0 : 1));
  const accessibility = clamp(base + (need === "Tidak ada kebutuhan spesifik" ? 0 : 1));
  const trust = clamp(3 + (index % 3));
  const humanControl = clamp(4 + (index % 2));
  const timeline = clamp(4 + ((index + 1) % 2));
  const chatbot = clamp(3 + ((index + 2) % 3));

  return [
    `SYN-${String(i).padStart(2, "0")}`,
    "SINTETIS",
    roles[index % roles.length],
    need,
    devices[index % devices.length],
    tasks[index % tasks.length],
    success,
    time,
    ease,
    clarity,
    accessibility,
    trust,
    humanControl,
    timeline,
    chatbot,
    weightedFeatureChoices[index],
    index % 9 === 0 ? "Mungkin" : "Ya",
    comments[index % comments.length],
  ];
});

const workbook = Workbook.create();
const dashboard = workbook.worksheets.add("Dashboard");
const data = workbook.worksheets.add("Data_Sintetis");
const analysis = workbook.worksheets.add("Analisis");
const instrument = workbook.worksheets.add("Instrumen_Survei");
const ethics = workbook.worksheets.add("Catatan_Etis");

for (const sheet of [dashboard, data, analysis, instrument, ethics]) {
  sheet.showGridLines = false;
}

function titleBand(sheet, range, title, subtitle) {
  const match = range.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
  if (!match) throw new Error(`Invalid title range: ${range}`);
  const [, startCol, startRowText, endCol] = match;
  const startRow = Number(startRowText);
  const titleRange = `${startCol}${startRow}:${endCol}${startRow}`;
  const subtitleRange = `${startCol}${startRow + 1}:${endCol}${startRow + 1}`;
  sheet.mergeCells(titleRange);
  sheet.getRange(`${startCol}${startRow}`).values = [[title]];
  sheet.getRange(titleRange).format = {
    fill: palette.teal,
    font: { bold: true, color: palette.white, size: 20 },
    horizontalAlignment: "left",
    verticalAlignment: "center",
  };
  sheet.mergeCells(subtitleRange);
  sheet.getRange(`${startCol}${startRow + 1}`).values = [[subtitle]];
  sheet.getRange(subtitleRange).format = {
    fill: "#CCFBF1",
    font: { color: palette.teal, italic: true, size: 10 },
    verticalAlignment: "center",
  };
}

function styleHeader(range) {
  range.format = {
    fill: palette.slate,
    font: { bold: true, color: palette.white },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
    borders: { preset: "all", color: palette.line, style: "continuous", weight: 1 },
  };
}

// Dashboard
titleBand(
  dashboard,
  "A1:N2",
  "Dashboard Feedback Pengguna AmanAkses",
  "DATA SINTETIS UNTUK LATIHAN ANALISIS — BUKAN HASIL PEER TEST ATAU SURVEI NYATA",
);
dashboard.getRange("A1:N1").format.rowHeight = 36;
dashboard.getRange("A2:N2").format.rowHeight = 24;
dashboard.getRange("A4:N4").values = [[
  "Ringkasan simulasi untuk merancang instrumen, visualisasi, dan hipotesis perbaikan. Ganti seluruh data pada sheet Data_Sintetis setelah peer testing nyata dilakukan.",
  null, null, null, null, null, null, null, null, null, null, null, null, null,
]];
dashboard.mergeCells("A4:N4");
dashboard.getRange("A4:N4").format = {
  fill: palette.roseSoft,
  font: { bold: true, color: palette.rose, size: 11 },
  wrapText: true,
  verticalAlignment: "center",
};
dashboard.getRange("A4:N4").format.rowHeight = 38;

const kpiLabels = ["Respons sintetis", "Rata-rata skor", "Task success", "Waktu rata-rata", "Minat menggunakan"];
const kpiCells = ["A6:B9", "D6:E9", "G6:H9", "J6:K9", "M6:N9"];
const kpiFormulas = [
  "=COUNTA(Data_Sintetis!A5:A34)",
  "=AVERAGE(Data_Sintetis!I5:O34)",
  '=COUNTIF(Data_Sintetis!G5:G34,"Berhasil")/A7',
  "=AVERAGE(Data_Sintetis!H5:H34)",
  '=COUNTIF(Data_Sintetis!Q5:Q34,"Ya")/A7',
];

kpiCells.forEach((range, index) => {
  dashboard.getRange(range).format = {
    fill: index % 2 === 0 ? palette.tealSoft : palette.violetSoft,
    borders: { preset: "outside", color: index % 2 === 0 ? "#5EEAD4" : "#C4B5FD", style: "continuous", weight: 2 },
    horizontalAlignment: "center",
    verticalAlignment: "center",
  };
  const [start] = range.split(":");
  const col = start.match(/[A-Z]+/)[0];
  const valueCell = `${col}7`;
  dashboard.mergeCells(`${col}6:${String.fromCharCode(col.charCodeAt(0) + 1)}6`);
  dashboard.getRange(`${col}6`).values = [[kpiLabels[index]]];
  dashboard.getRange(`${col}6:${String.fromCharCode(col.charCodeAt(0) + 1)}6`).format = {
    font: { bold: true, color: palette.muted, size: 10 },
    horizontalAlignment: "center",
  };
  dashboard.mergeCells(`${col}7:${String.fromCharCode(col.charCodeAt(0) + 1)}8`);
  dashboard.getRange(valueCell).formulas = [[kpiFormulas[index]]];
  dashboard.getRange(`${col}7:${String.fromCharCode(col.charCodeAt(0) + 1)}8`).format = {
    font: { bold: true, color: index % 2 === 0 ? palette.teal : palette.violet, size: 22 },
    horizontalAlignment: "center",
    verticalAlignment: "center",
  };
});
dashboard.getRange("D7").format.numberFormat = "0.00";
dashboard.getRange("G7").format.numberFormat = "0%";
dashboard.getRange("J7").format.numberFormat = "0.0";
dashboard.getRange("M7").format.numberFormat = "0%";

dashboard.getRange("A12:B19").values = [
  ["Dimensi", "Rata-rata"],
  ["Kemudahan", null],
  ["Kejelasan", null],
  ["Aksesibilitas", null],
  ["Kepercayaan AI", null],
  ["Kendali manusia", null],
  ["Kegunaan timeline", null],
  ["Kegunaan chatbot", null],
];
styleHeader(dashboard.getRange("A12:B12"));
dashboard.getRange("B13:B19").formulas = [
  ["=AVERAGE(Data_Sintetis!I5:I34)"],
  ["=AVERAGE(Data_Sintetis!J5:J34)"],
  ["=AVERAGE(Data_Sintetis!K5:K34)"],
  ["=AVERAGE(Data_Sintetis!L5:L34)"],
  ["=AVERAGE(Data_Sintetis!M5:M34)"],
  ["=AVERAGE(Data_Sintetis!N5:N34)"],
  ["=AVERAGE(Data_Sintetis!O5:O34)"],
];
dashboard.getRange("B13:B19").format.numberFormat = "0.00";

dashboard.getRange("D12:E18").values = [
  ["Fitur pilihan", "Jumlah"],
  ...features.map((feature) => [feature, null]),
];
styleHeader(dashboard.getRange("D12:E12"));
dashboard.getRange("E13:E18").formulas = features.map((feature) => [
  `=COUNTIF(Data_Sintetis!P5:P34,"${feature}")`,
]);

dashboard.getRange("G12:H14").values = [
  ["Status tugas", "Jumlah"],
  ["Berhasil", null],
  ["Perlu bantuan", null],
];
styleHeader(dashboard.getRange("G12:H12"));
dashboard.getRange("H13").formulas = [['=COUNTIF(Data_Sintetis!G5:G34,"Berhasil")']];
dashboard.getRange("H14").formulas = [['=COUNTIF(Data_Sintetis!G5:G34,"Perlu bantuan")']];

dashboard.getRange("J12:K18").values = [
  ["Kebutuhan akses", "Rata-rata aksesibilitas"],
  ...accessNeeds.map((need) => [need, null]),
];
styleHeader(dashboard.getRange("J12:K12"));
dashboard.getRange("K13:K18").formulas = accessNeeds.map((need) => [
  `=AVERAGEIF(Data_Sintetis!D5:D34,"${need}",Data_Sintetis!K5:K34)`,
]);
dashboard.getRange("K13:K18").format.numberFormat = "0.00";

const ratingChart = dashboard.charts.add("bar", dashboard.getRange("A12:B19"));
ratingChart.title = "Rata-rata Skor Pengalaman (1–5)";
ratingChart.hasLegend = false;
ratingChart.yAxis = { numberFormatCode: "0.0" };
ratingChart.setPosition("A22", "G39");

const featureChart = dashboard.charts.add("bar", dashboard.getRange("D12:E18"));
featureChart.title = "Fitur yang Paling Dipilih";
featureChart.hasLegend = false;
featureChart.setPosition("H22", "N39");

const successChart = dashboard.charts.add("doughnut", dashboard.getRange("G12:H14"));
successChart.title = "Keberhasilan Skenario Tugas";
successChart.hasLegend = true;
successChart.setPosition("A41", "G57");

const accessChart = dashboard.charts.add("bar", dashboard.getRange("J12:K18"));
accessChart.title = "Skor Aksesibilitas per Kebutuhan";
accessChart.hasLegend = false;
accessChart.yAxis = { numberFormatCode: "0.0" };
accessChart.setPosition("H41", "N57");

dashboard.getRange("A59:N62").values = [[
  "Interpretasi yang diperbolehkan",
  "Dataset ini hanya menunjukkan contoh cara menganalisis respons. Angka tidak boleh ditulis sebagai hasil penelitian, validasi pengguna, atau dampak aktual.",
  null, null, null, null, null, null, null, null, null, null, null, null,
], [
  "Langkah berikutnya",
  "Lakukan peer testing 3–5 mahasiswa, salin jawaban nyata ke sheet baru, dokumentasikan persetujuan, lalu bandingkan temuan tanpa mengganti data sintetis secara diam-diam.",
  null, null, null, null, null, null, null, null, null, null, null, null,
]];
dashboard.mergeCells("B59:N59");
dashboard.mergeCells("B60:N60");
dashboard.getRange("A59:N60").format = {
  fill: palette.surface,
  font: { color: palette.muted },
  wrapText: true,
  borders: { preset: "all", color: palette.line, style: "continuous", weight: 1 },
};
dashboard.getRange("A59:A60").format = {
  fill: palette.slate,
  font: { bold: true, color: palette.white },
  verticalAlignment: "center",
};
dashboard.getRange("A59:N60").format.rowHeight = 38;

// Raw synthetic data
titleBand(
  data,
  "A1:R2",
  "Data Respons Pengguna — Sintetis",
  "Semua baris dibuat untuk simulasi visualisasi. Jangan diklaim sebagai partisipan atau hasil pengujian nyata.",
);
const headers = [
  "ID",
  "Status data",
  "Peran",
  "Kebutuhan akses",
  "Perangkat",
  "Skenario tugas",
  "Keberhasilan",
  "Waktu (menit)",
  "Kemudahan",
  "Kejelasan",
  "Aksesibilitas",
  "Kepercayaan AI",
  "Kendali manusia",
  "Kegunaan timeline",
  "Kegunaan chatbot",
  "Fitur pilihan",
  "Minat menggunakan",
  "Feedback terbuka",
];
data.getRange("A4:R4").values = [headers];
styleHeader(data.getRange("A4:R4"));
data.getRange("A5:R34").values = rows;
data.getRange("A5:R34").format = {
  borders: { preset: "all", color: "#E2E8F0", style: "continuous", weight: 1 },
  verticalAlignment: "top",
};
data.getRange("B5:B34").format = { fill: palette.roseSoft, font: { bold: true, color: palette.rose } };
data.getRange("I5:O34").conditionalFormats.add("colorScale", {
  criteria: [
    { type: "lowestValue", color: "#FEE2E2" },
    { type: "percentile", value: 50, color: "#FEF3C7" },
    { type: "highestValue", color: "#CCFBF1" },
  ],
});
data.getRange("H5:H34").format.numberFormat = "0.0";
const rawTable = data.tables.add("A4:R34", true, "SyntheticFeedbackTable");
rawTable.style = "TableStyleMedium2";
rawTable.showFilterButton = true;
data.freezePanes.freezeRows(4);

// Analysis
titleBand(
  analysis,
  "A1:J2",
  "Analisis dan Hipotesis Perbaikan",
  "Rangkuman di bawah berasal dari data sintetis dan harus divalidasi melalui peer testing nyata.",
);
analysis.getRange("A4:D4").values = [["Temuan simulasi", "Indikator", "Hipotesis penyebab", "Aksi pengujian nyata"]];
styleHeader(analysis.getRange("A4:D4"));
analysis.getRange("A5:D10").values = [
  ["Kendali manusia dinilai tinggi", "Rata-rata Kendali manusia", "Tombol edit/terima/tolak terlihat jelas", "Minta peserta menjelaskan siapa yang membuat keputusan akhir"],
  ["Kepercayaan AI lebih rendah dari kendali", "Bandingkan Kepercayaan AI vs Kendali manusia", "Pengguna berhati-hati pada keluaran AI", "Uji pemahaman label draf dan sumber catatan"],
  ["Sebagian skenario perlu bantuan", "Task success dan waktu", "Istilah atau navigasi masih padat", "Catat titik peserta meminta bantuan"],
  ["Chatbot membantu navigasi", "Skor Kegunaan chatbot", "Prompt cepat mengurangi pencarian menu", "Uji tanpa memberi petunjuk lokasi menu"],
  ["Aksesibilitas bervariasi antarkebutuhan", "Rata-rata per kelompok", "Satu konfigurasi belum cocok untuk semua", "Libatkan pengguna dengan kebutuhan akses berbeda"],
  ["Label simulasi perlu menonjol", "Feedback terbuka", "Pengguna dapat mengira aksi benar-benar terkirim", "Tanyakan ulang status pengiriman setelah demo"],
];
analysis.getRange("A5:D10").format = {
  wrapText: true,
  verticalAlignment: "top",
  borders: { preset: "all", color: palette.line, style: "continuous", weight: 1 },
};
analysis.getRange("F4:G11").values = [
  ["Metrik", "Nilai"],
  ["Respons sintetis", null],
  ["Rata-rata seluruh skor", null],
  ["Rata-rata kendali manusia", null],
  ["Rata-rata kepercayaan AI", null],
  ["Task success", null],
  ["Waktu rata-rata", null],
  ["Minat menggunakan", null],
];
styleHeader(analysis.getRange("F4:G4"));
analysis.getRange("G5:G11").formulas = [
  ["=Dashboard!A7"],
  ["=Dashboard!D7"],
  ["=AVERAGE(Data_Sintetis!M5:M34)"],
  ["=AVERAGE(Data_Sintetis!L5:L34)"],
  ["=Dashboard!G7"],
  ["=Dashboard!J7"],
  ["=Dashboard!M7"],
];
analysis.getRange("G6:G8").format.numberFormat = "0.00";
analysis.getRange("G9").format.numberFormat = "0%";
analysis.getRange("G10").format.numberFormat = "0.0";
analysis.getRange("G11").format.numberFormat = "0%";
analysis.getRange("F13:J18").values = [[
  "Peringatan metodologis",
  "Data sintetis berguna untuk menguji struktur analisis, bukan untuk membuktikan kegunaan, aksesibilitas, keamanan, atau penerimaan produk. Tidak ada inferensi statistik yang sah terhadap populasi pengguna.",
  null, null, null,
]];
analysis.mergeCells("G13:J18");
analysis.getRange("F13:J18").format = {
  fill: palette.roseSoft,
  font: { color: palette.rose },
  wrapText: true,
  verticalAlignment: "center",
  borders: { preset: "outside", color: "#FDA4AF", style: "continuous", weight: 2 },
};
analysis.getRange("F13").format = { fill: palette.rose, font: { bold: true, color: palette.white }, verticalAlignment: "center" };

// Survey instrument
titleBand(
  instrument,
  "A1:H2",
  "Instrumen Peer Testing AmanAkses",
  "Template siap digunakan untuk 3–5 mahasiswa. Isi hanya setelah persetujuan dan pengujian nyata.",
);
instrument.getRange("A4:H4").values = [[
  "No.", "Bagian", "Pertanyaan / tugas", "Jenis jawaban", "Skala / opsi", "Tujuan ukur", "Wajib?", "Catatan moderator",
]];
styleHeader(instrument.getRange("A4:H4"));
instrument.getRange("A5:H18").values = [
  [1, "Profil minimum", "Peran peserta", "Pilihan tunggal", "Mahasiswa / pendamping sebaya", "Konteks peserta", "Ya", "Tidak meminta identitas pribadi"],
  [2, "Profil minimum", "Kebutuhan akses yang relevan untuk pengujian", "Pilihan ganda", accessNeeds.join(" / "), "Kebutuhan akomodasi", "Opsional", "Peserta boleh tidak menjawab"],
  [3, "Tugas", "Temukan materi easy-read", "Observasi", "Berhasil / perlu bantuan", "Findability", "Ya", "Catat waktu dan hambatan"],
  [4, "Tugas", "Buat jurnal dengan data sintetis", "Observasi", "Berhasil / perlu bantuan", "Kejelasan alur", "Ya", "Jangan memakai pengalaman nyata"],
  [5, "Tugas", "Susun timeline dari tiga catatan sintetis", "Observasi", "Berhasil / perlu bantuan", "Pemahaman AI", "Ya", "Tanyakan arti sumber dan ketidakpastian"],
  [6, "Tugas", "Gunakan chatbot untuk menemukan menu pendamping", "Observasi", "Berhasil / perlu bantuan", "Kegunaan chatbot", "Ya", "Jangan memberi lokasi menu"],
  [7, "Likert", "AmanAkses mudah digunakan", "Skala 1–5", "1 sangat tidak setuju – 5 sangat setuju", "Kemudahan", "Ya", ""],
  [8, "Likert", "Bahasa dan instruksi mudah dipahami", "Skala 1–5", "1–5", "Kejelasan", "Ya", ""],
  [9, "Likert", "Pengaturan aksesibilitas membantu", "Skala 1–5", "1–5", "Aksesibilitas", "Ya", ""],
  [10, "Likert", "Saya memahami bahwa hasil AI adalah draf", "Skala 1–5", "1–5", "Literasi AI", "Ya", ""],
  [11, "Likert", "Saya tetap merasa memegang kendali", "Skala 1–5", "1–5", "Human agency", "Ya", ""],
  [12, "Likert", "Safe Timeline Assistant membantu menata catatan", "Skala 1–5", "1–5", "Kegunaan AI", "Ya", ""],
  [13, "Likert", "Asisten Aman membantu menemukan langkah berikutnya", "Skala 1–5", "1–5", "Kegunaan chatbot", "Ya", ""],
  [14, "Terbuka", "Apa satu hal yang membingungkan atau membuat ragu?", "Teks", "Jawaban bebas", "Masalah utama", "Ya", "Hindari meminta cerita kasus"],
];
instrument.getRange("A5:H18").format = {
  wrapText: true,
  verticalAlignment: "top",
  borders: { preset: "all", color: palette.line, style: "continuous", weight: 1 },
};
instrument.freezePanes.freezeRows(4);

// Ethics and replacement guide
titleBand(
  ethics,
  "A1:H2",
  "Catatan Etis dan Cara Mengganti Data",
  "Dokumentasi ini mencegah data simulasi tertukar dengan bukti pengujian nyata.",
);
ethics.getRange("A4:B10").values = [
  ["Prinsip", "Penerapan"],
  ["Status data", "Semua baris pada workbook ini berlabel SINTETIS dan tidak mewakili orang nyata."],
  ["Tidak ada data sensitif", "Tidak terdapat nama, kontak, pengalaman kekerasan, bukti, atau identitas nyata."],
  ["Tujuan", "Menguji struktur dashboard, rumus, visualisasi, dan rancangan instrumen."],
  ["Larangan klaim", "Jangan menyebut angka workbook sebagai hasil validasi pengguna, dampak, atau kepuasan aktual."],
  ["Pengujian nyata", "Gunakan data sintetis selama tugas; minta peserta menguji fitur menggunakan skenario buatan."],
  ["Persetujuan", "Jelaskan tujuan, durasi, penggunaan data, sifat sukarela, dan hak berhenti."],
];
styleHeader(ethics.getRange("A4:B4"));
ethics.getRange("A5:B10").format = {
  wrapText: true,
  verticalAlignment: "top",
  borders: { preset: "all", color: palette.line, style: "continuous", weight: 1 },
};
ethics.getRange("D4:H4").values = [["Langkah mengganti dengan data nyata", null, null, null, null]];
ethics.mergeCells("D4:H4");
styleHeader(ethics.getRange("D4:H4"));
ethics.getRange("D5:H10").values = [
  ["1", "Duplikasi workbook — simpan data sintetis sebagai bukti desain; jangan menimpanya.", null, null, null],
  ["2", "Buat sheet Data_Nyata — gunakan struktur kolom yang sama dan kode peserta anonim.", null, null, null],
  ["3", "Catat persetujuan — simpan status persetujuan tanpa data kasus atau identitas sensitif.", null, null, null],
  ["4", "Perbarui formula — arahkan dashboard salinan ke Data_Nyata dan tandai tanggal pengujian.", null, null, null],
  ["5", "Laporkan apa adanya — untuk 3–5 peserta, gunakan bahasa deskriptif dan jangan menggeneralisasi.", null, null, null],
  ["6", "Dokumentasikan revisi — hubungkan temuan, perubahan produk, dan masalah yang masih tersisa.", null, null, null],
];
ethics.mergeCells("E5:H5");
ethics.mergeCells("E6:H6");
ethics.mergeCells("E7:H7");
ethics.mergeCells("E8:H8");
ethics.mergeCells("E9:H9");
ethics.mergeCells("E10:H10");
ethics.getRange("D5:H10").format = {
  wrapText: true,
  verticalAlignment: "top",
  borders: { preset: "all", color: palette.line, style: "continuous", weight: 1 },
};
ethics.getRange("D5:D10").format = { fill: palette.tealSoft, font: { bold: true, color: palette.teal }, horizontalAlignment: "center" };

// Sizing
dashboard.getRange("A:N").format.columnWidth = 13;
dashboard.getRange("A:A").format.columnWidth = 22;
dashboard.getRange("D:D").format.columnWidth = 24;
dashboard.getRange("J:J").format.columnWidth = 28;

data.getRange("A:A").format.columnWidth = 11;
data.getRange("B:B").format.columnWidth = 12;
data.getRange("C:C").format.columnWidth = 20;
data.getRange("D:D").format.columnWidth = 27;
data.getRange("E:E").format.columnWidth = 13;
data.getRange("F:F").format.columnWidth = 28;
data.getRange("G:G").format.columnWidth = 16;
data.getRange("H:O").format.columnWidth = 14;
data.getRange("P:P").format.columnWidth = 25;
data.getRange("Q:Q").format.columnWidth = 18;
data.getRange("R:R").format.columnWidth = 48;
data.getRange("A5:R34").format.rowHeight = 38;

analysis.getRange("A:A").format.columnWidth = 30;
analysis.getRange("B:B").format.columnWidth = 24;
analysis.getRange("C:D").format.columnWidth = 34;
analysis.getRange("F:F").format.columnWidth = 27;
analysis.getRange("G:G").format.columnWidth = 16;
analysis.getRange("A5:D10").format.rowHeight = 55;

instrument.getRange("A:A").format.columnWidth = 7;
instrument.getRange("B:B").format.columnWidth = 19;
instrument.getRange("C:C").format.columnWidth = 43;
instrument.getRange("D:D").format.columnWidth = 18;
instrument.getRange("E:E").format.columnWidth = 42;
instrument.getRange("F:F").format.columnWidth = 22;
instrument.getRange("G:G").format.columnWidth = 11;
instrument.getRange("H:H").format.columnWidth = 34;
instrument.getRange("A5:H18").format.rowHeight = 44;

ethics.getRange("A:A").format.columnWidth = 22;
ethics.getRange("B:B").format.columnWidth = 58;
ethics.getRange("D:D").format.columnWidth = 8;
ethics.getRange("E:H").format.columnWidth = 22;
ethics.getRange("A5:H10").format.rowHeight = 48;

await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(supportingDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

const dashboardInspect = await workbook.inspect({
  kind: "table",
  range: "Dashboard!A1:N19",
  include: "values,formulas",
  tableMaxRows: 20,
  tableMaxCols: 14,
});
await fs.writeFile(path.join(previewDir, "dashboard-inspect.ndjson"), dashboardInspect.ndjson);

const formulaErrors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
});
await fs.writeFile(path.join(previewDir, "formula-errors.ndjson"), formulaErrors.ndjson);

for (const [sheetName, range, fileName] of [
  ["Dashboard", "A1:N62", "dashboard.png"],
  ["Data_Sintetis", "A1:R18", "data-sintetis.png"],
  ["Instrumen_Survei", "A1:H18", "instrumen-survei.png"],
  ["Catatan_Etis", "A1:H10", "catatan-etis.png"],
]) {
  const image = await workbook.render({ sheetName, range, scale: 1.25, format: "png" });
  await fs.writeFile(path.join(previewDir, fileName), new Uint8Array(await image.arrayBuffer()));
}

const exported = await SpreadsheetFile.exportXlsx(workbook);
await exported.save(path.join(outputDir, outputName));
await exported.save(path.join(supportingDir, outputName));

console.log(path.join(outputDir, outputName));
