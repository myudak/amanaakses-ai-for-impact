import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../../");
const PREVIEW_DIR = path.join(HERE, "preview");
const LAYOUT_DIR = path.join(HERE, "layout");
const OUTPUT = path.join(ROOT, "supporting", "editable", "Presentasi_AmanAkses.pptx");
const SCREENSHOT = path.join(ROOT, "supporting", "screenshots", "timeline-review-desktop.png");
const HERO = path.join(HERE, "hero-cover.jpg");

const C = {
  ink: "#17313A",
  slate: "#50656D",
  teal: "#147D78",
  tealDeep: "#0F5F5B",
  mist: "#DDF3EF",
  violet: "#7257B7",
  violetMist: "#EEE9FA",
  coral: "#E87962",
  coralMist: "#FBE8E2",
  warm: "#FBF8F1",
  white: "#FFFFFF",
  line: "#D7E2DF",
  pale: "#F2F5F3",
};

const transparent = "#00000000";

function frame(x, y, width, height) {
  return { left: x, top: y, width, height };
}

async function imageBytes(imagePath) {
  const bytes = await fs.readFile(imagePath);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

function shape(slide, x, y, width, height, fill, geometry = "rect", lineFill = transparent, lineWidth = 0) {
  return slide.shapes.add({
    geometry,
    position: frame(x, y, width, height),
    fill,
    line: { style: "solid", fill: lineFill, width: lineWidth },
  });
}

function text(slide, value, x, y, width, height, options = {}) {
  const box = shape(
    slide,
    x,
    y,
    width,
    height,
    options.fill ?? transparent,
    options.geometry ?? "rect",
    options.lineFill ?? transparent,
    options.lineWidth ?? 0,
  );
  box.text = value;
  box.text.fontSize = options.size ?? 24;
  box.text.color = options.color ?? C.ink;
  box.text.bold = Boolean(options.bold);
  box.text.typeface = options.face ?? (options.bold ? "Aptos Display" : "Aptos");
  box.text.alignment = options.align ?? "left";
  box.text.verticalAlignment = options.valign ?? "top";
  box.text.insets = options.insets ?? { left: 0, right: 0, top: 0, bottom: 0 };
  return box;
}

async function image(slide, imagePath, x, y, width, height, fit = "cover", alt = "") {
  const img = slide.images.add({
    blob: await imageBytes(imagePath),
    fit,
    alt,
  });
  img.position = frame(x, y, width, height);
  return img;
}

function pill(slide, value, x, y, width, fill, color = C.ink) {
  shape(slide, x, y, width, 34, fill, "roundRect");
  text(slide, value, x, y + 4, width, 24, { size: 14, color, bold: true, align: "center" });
}

function topLabel(slide, value, number) {
  text(slide, value.toUpperCase(), 58, 32, 420, 26, { size: 14, color: C.teal, bold: true });
  text(slide, String(number).padStart(2, "0"), 1184, 30, 42, 28, { size: 14, color: C.slate, bold: true, align: "right" });
}

function footer(slide, inverted = false) {
  shape(slide, 58, 678, 1164, 1, inverted ? "#FFFFFF55" : C.line);
  text(slide, "AMANAKSES  /  AI DRAFT, HUMAN DECISION", 58, 688, 520, 16, {
    size: 10,
    color: inverted ? "#FFFFFFBB" : C.slate,
    bold: true,
  });
}

function title(slide, value, y = 74, width = 1120, color = C.ink, size = 40) {
  return text(slide, value, 58, y, width, 98, { size, color, bold: true });
}

function dot(slide, x, y, fill, size = 12) {
  return shape(slide, x, y, size, size, fill, "ellipse");
}

function addArrow(slide, x, y, width, color = C.teal) {
  shape(slide, x, y + 8, width - 12, 3, color);
  shape(slide, x + width - 18, y + 1, 16, 16, color, "chevron");
}

async function addSlide1(pres) {
  const slide = pres.slides.add();
  slide.background.fill = C.tealDeep;
  shape(slide, 792, -80, 560, 560, C.violet, "ellipse");
  shape(slide, 902, 420, 310, 310, C.coral, "ellipse");
  shape(slide, 736, 86, 430, 530, C.white, "roundRect");
  await image(slide, HERO, 760, 110, 382, 480, "cover", "Ilustrasi AmanAkses");
  pill(slide, "AI FOR REAL IMPACT 2026", 58, 52, 220, "#FFFFFF22", C.white);
  text(slide, "AmanAkses", 58, 142, 610, 76, { size: 62, color: C.white, bold: true });
  text(slide, "AI yang membantu menata,\nbukan menentukan.", 58, 230, 630, 128, {
    size: 42,
    color: C.white,
    bold: true,
  });
  text(slide, "Pendamping aksesibel untuk belajar, mencatat, menyusun kronologi, dan meninjau laporan dengan kendali tetap pada pengguna.", 58, 385, 610, 92, {
    size: 22,
    color: "#E9F5F2",
  });
  shape(slide, 58, 522, 570, 78, "#FFFFFF13", "roundRect", "#FFFFFF33", 1);
  text(slide, "BATAS UTAMA", 78, 540, 140, 18, { size: 12, color: "#BEE8E0", bold: true });
  text(slide, "Semua keluaran AI adalah draf yang dapat diedit dan wajib ditinjau manusia.", 78, 562, 510, 30, {
    size: 17,
    color: C.white,
    bold: true,
  });
  footer(slide, true);
}

function addSlide2(pres) {
  const slide = pres.slides.add();
  slide.background.fill = C.warm;
  topLabel(slide, "Masalah nyata", 2);
  title(slide, "Melapor sering menjadi beban yang berulang, bukan satu langkah.");
  text(slide, "Pengguna harus mengingat, menulis ulang, menyusun bukti, dan menghadapi kanal yang belum tentu aksesibel saat kondisi emosional sedang berat.", 58, 174, 700, 76, {
    size: 21,
    color: C.slate,
  });

  const stages = [
    { x: 70, y: 300, w: 210, h: 90, n: "01", t: "Memahami pilihan", c: C.mist },
    { x: 270, y: 370, w: 225, h: 100, n: "02", t: "Mengingat detail", c: "#CDEAE5" },
    { x: 482, y: 440, w: 240, h: 110, n: "03", t: "Menyusun kronologi", c: C.violetMist },
    { x: 708, y: 510, w: 250, h: 118, n: "04", t: "Mengulang ke kanal lain", c: C.coralMist },
  ];
  for (const item of stages) {
    shape(slide, item.x, item.y, item.w, item.h, item.c, "roundRect");
    text(slide, item.n, item.x + 18, item.y + 18, 44, 24, { size: 13, color: C.teal, bold: true });
    text(slide, item.t, item.x + 18, item.y + 46, item.w - 36, 42, { size: 18, color: C.ink, bold: true });
  }
  shape(slide, 1002, 284, 220, 344, C.ink, "roundRect");
  text(slide, "Yang hilang di tengah proses", 1028, 310, 166, 58, { size: 20, color: C.white, bold: true });
  const losses = ["Kejelasan", "Energi", "Rasa aman", "Kendali"];
  losses.forEach((item, i) => {
    dot(slide, 1030, 402 + i * 48, i === 3 ? C.coral : C.mist, 10);
    text(slide, item, 1050, 394 + i * 48, 130, 30, { size: 17, color: C.white });
  });
  text(slide, "Fokusnya adalah beban proses, bukan pengganti pendamping profesional.", 1028, 548, 166, 60, {
    size: 12,
    color: "#D7E2DF",
  });
  footer(slide);
}

function addSlide3(pres) {
  const slide = pres.slides.add();
  slide.background.fill = C.white;
  topLabel(slide, "Pengguna dan hambatan", 3);
  title(slide, "Aksesibilitas harus hadir sepanjang perjalanan, bukan sebagai tambahan.");

  shape(slide, 480, 230, 320, 320, C.ink, "ellipse");
  text(slide, "PENGGUNA", 535, 310, 210, 28, { size: 15, color: C.mist, bold: true, align: "center" });
  text(slide, "Mengendalikan\ncatatan dan\nkeputusan", 520, 352, 240, 112, { size: 30, color: C.white, bold: true, align: "center" });

  const barriers = [
    { x: 70, y: 202, w: 340, h: 126, label: "INTERAKSI", body: "Navigasi keyboard, fokus, ukuran target, dan safe exit.", color: C.mist, tag: "01" },
    { x: 870, y: 202, w: 340, h: 126, label: "KOMUNIKASI", body: "Bahasa sederhana, teks alternatif, dan format yang dapat dipahami.", color: C.violetMist, tag: "02" },
    { x: 70, y: 468, w: 340, h: 126, label: "KOGNITIF", body: "Beban mengingat urutan, tanggal ambigu, dan informasi terfragmentasi.", color: C.coralMist, tag: "03" },
    { x: 870, y: 468, w: 340, h: 126, label: "KEPERCAYAAN", body: "Kekhawatiran privasi, konsekuensi pelaporan, dan hilangnya kendali.", color: "#E8EFF1", tag: "04" },
  ];
  for (const b of barriers) {
    shape(slide, b.x, b.y, b.w, b.h, b.color, "roundRect");
    pill(slide, b.tag, b.x + 18, b.y + 16, 46, C.white, C.teal);
    text(slide, b.label, b.x + 78, b.y + 22, 220, 24, { size: 16, color: C.ink, bold: true });
    text(slide, b.body, b.x + 22, b.y + 62, b.w - 44, 50, { size: 16, color: C.slate });
  }
  shape(slide, 410, 262, 70, 3, C.line);
  shape(slide, 800, 262, 70, 3, C.line);
  shape(slide, 410, 528, 70, 3, C.line);
  shape(slide, 800, 528, 70, 3, C.line);
  footer(slide);
}

function addSlide4(pres) {
  const slide = pres.slides.add();
  slide.background.fill = C.warm;
  topLabel(slide, "Alur solusi", 4);
  title(slide, "Satu alur, enam tahap, dan kendali pengguna di setiap perpindahan.");
  const steps = [
    { n: "01", t: "Belajar", s: "Informasi dasar", c: C.mist },
    { n: "02", t: "Jurnal privat", s: "Catatan pengguna", c: C.mist },
    { n: "03", t: "Pilih catatan", s: "Ruang lingkup eksplisit", c: C.violetMist },
    { n: "04", t: "Draf AI", s: "Kronologi bersumber", c: C.violetMist },
    { n: "05", t: "Tinjau", s: "Edit / terima / tolak", c: C.coralMist },
    { n: "06", t: "Pratinjau", s: "Persetujuan sebelum lanjut", c: "#E8EFF1" },
  ];
  steps.forEach((item, i) => {
    const x = 48 + i * 202;
    if (i < steps.length - 1) addArrow(slide, x + 166, 330, 42, i < 3 ? C.teal : C.violet);
    shape(slide, x, 262, 166, 178, item.c, "roundRect");
    text(slide, item.n, x + 18, 282, 44, 22, { size: 13, color: C.teal, bold: true });
    text(slide, item.t, x + 18, 322, 132, 52, { size: 22, color: C.ink, bold: true });
    text(slide, item.s, x + 18, 385, 132, 42, { size: 14, color: C.slate });
  });
  shape(slide, 124, 492, 1032, 118, C.ink, "roundRect");
  text(slide, "TIGA CHECKPOINT KENDALI", 152, 516, 240, 22, { size: 13, color: C.mist, bold: true });
  const checkpoints = [
    "Pengguna memilih catatan yang dikirim.",
    "Setiap peristiwa wajib ditinjau.",
    "Laporan hanya maju setelah persetujuan.",
  ];
  checkpoints.forEach((item, i) => {
    dot(slide, 154 + i * 334, 560, i === 2 ? C.coral : C.mist, 12);
    text(slide, item, 176 + i * 334, 552, 278, 42, { size: 15, color: C.white, bold: true });
  });
  footer(slide);
}

async function addSlide5(pres) {
  const slide = pres.slides.add();
  slide.background.fill = C.ink;
  text(slide, "DEMO PRODUK", 58, 32, 260, 26, { size: 14, color: C.mist, bold: true });
  text(slide, "05", 1184, 30, 42, 28, { size: 14, color: "#FFFFFFAA", bold: true, align: "right" });
  text(slide, "Safe Timeline Assistant membuat draf kronologi yang dapat diperiksa.", 58, 75, 1120, 62, {
    size: 38,
    color: C.white,
    bold: true,
  });
  text(slide, "Catatan sintetis dipilih secara eksplisit. Keluaran menyertakan referensi sumber dan tidak boleh menebak informasi yang hilang.", 58, 145, 980, 50, {
    size: 18,
    color: "#C9D9D6",
  });
  shape(slide, 58, 218, 1164, 410, C.white, "roundRect");
  await image(slide, SCREENSHOT, 70, 230, 1140, 386, "cover", "Tampilan Safe Timeline Assistant");
  pill(slide, "1  PILIH CATATAN", 78, 234, 164, C.teal, C.white);
  pill(slide, "2  TINJAU SUMBER", 540, 234, 174, C.violet, C.white);
  pill(slide, "3  TERIMA / TOLAK", 1016, 234, 178, C.coral, C.white);
  footer(slide, true);
}

function addSlide6(pres) {
  const slide = pres.slides.add();
  slide.background.fill = C.white;
  topLabel(slide, "Arsitektur dan batas data", 6);
  title(slide, "AI bekerja di satu fungsi terbatas; rahasia dan keputusan tidak masuk ke browser.");

  const lanes = [
    { y: 218, label: "BROWSER PENGGUNA", fill: C.mist, color: C.tealDeep },
    { y: 350, label: "VERCEL SERVERLESS", fill: C.violetMist, color: C.violet },
    { y: 482, label: "LAYANAN MODEL", fill: C.coralMist, color: C.coral },
  ];
  lanes.forEach((lane) => {
    shape(slide, 58, lane.y, 1164, 100, lane.fill, "roundRect");
    text(slide, lane.label, 78, lane.y + 38, 210, 24, { size: 14, color: lane.color, bold: true });
  });
  const nodes = [
    { x: 310, y: 237, w: 190, t: "Catatan terpilih", s: "Data sintetis saat demo" },
    { x: 545, y: 237, w: 210, t: "Editor + keputusan", s: "Terima / tolak / ubah" },
    { x: 330, y: 369, w: 250, t: "api/timeline.ts", s: "Validasi input dan output" },
    { x: 646, y: 369, w: 260, t: "GEMINI_API_KEY", s: "Hanya variabel server" },
    { x: 332, y: 501, w: 240, t: "Gemini structured JSON", s: "Jika API tersedia" },
    { x: 646, y: 501, w: 260, t: "Fallback deterministik", s: "Jika API gagal / offline" },
  ];
  nodes.forEach((n, i) => {
    shape(slide, n.x, n.y, n.w, 62, C.white, "roundRect", i < 2 ? C.teal : i < 4 ? C.violet : C.coral, 1);
    text(slide, n.t, n.x + 14, n.y + 10, n.w - 28, 22, { size: 16, color: C.ink, bold: true });
    text(slide, n.s, n.x + 14, n.y + 35, n.w - 28, 18, { size: 12, color: C.slate });
  });
  addArrow(slide, 500, 260, 44, C.teal);
  addArrow(slide, 580, 392, 64, C.violet);
  addArrow(slide, 572, 524, 72, C.coral);
  shape(slide, 952, 350, 236, 232, C.ink, "roundRect");
  text(slide, "TIDAK BOLEH DIINFERENSIKAN", 974, 376, 190, 42, { size: 14, color: C.mist, bold: true });
  ["Fakta yang hilang", "Niat atau kesalahan", "Diagnosis", "Kebenaran laporan"].forEach((item, i) => {
    dot(slide, 976, 438 + i * 34, C.coral, 9);
    text(slide, item, 994, 430 + i * 34, 160, 26, { size: 14, color: C.white });
  });
  footer(slide);
}

function addSlide7(pres) {
  const slide = pres.slides.add();
  slide.background.fill = C.warm;
  topLabel(slide, "Human review, consent, safety", 7);
  title(slide, "Tiga gerbang mencegah draf AI berubah menjadi keputusan otomatis.");

  const gates = [
    { x: 80, n: "01", label: "RUANG LINGKUP", body: "Pengguna memilih catatan mana yang boleh diproses.", c: C.teal, fill: C.mist },
    { x: 448, n: "02", label: "TINJAU PERISTIWA", body: "Setiap item diedit lalu diterima atau ditolak.", c: C.violet, fill: C.violetMist },
    { x: 816, n: "03", label: "PERSETUJUAN AKHIR", body: "Hanya hasil yang disetujui masuk ke pratinjau laporan.", c: C.coral, fill: C.coralMist },
  ];
  gates.forEach((g, i) => {
    shape(slide, g.x, 244, 300, 250, g.fill, "roundRect");
    shape(slide, g.x + 24, 270, 58, 58, g.c, "ellipse");
    text(slide, g.n, g.x + 24, 284, 58, 28, { size: 18, color: C.white, bold: true, align: "center" });
    text(slide, g.label, g.x + 24, 354, 250, 24, { size: 15, color: g.c, bold: true });
    text(slide, g.body, g.x + 24, 394, 250, 68, { size: 20, color: C.ink, bold: true });
    if (i < gates.length - 1) addArrow(slide, g.x + 300, 354, 68, C.line);
  });
  shape(slide, 80, 526, 1036, 92, C.ink, "roundRect");
  text(slide, "Selalu tersedia", 106, 552, 170, 24, { size: 14, color: C.mist, bold: true });
  const always = ["Label draf AI", "Edit manual", "Safe exit", "Referensi catatan", "Fallback offline"];
  always.forEach((item, i) => {
    pill(slide, item, 270 + i * 162, 544, 146, i === 2 ? C.coral : "#FFFFFF18", C.white);
  });
  footer(slide);
}

function addSlide8(pres) {
  const slide = pres.slides.add();
  slide.background.fill = C.white;
  topLabel(slide, "Kemampuan prototipe", 8);
  title(slide, "Prototipe menunjukkan sistem yang utuh, dengan status integrasi yang jujur.");

  shape(slide, 500, 242, 280, 280, C.tealDeep, "ellipse");
  text(slide, "AMANAKSES", 546, 324, 188, 26, { size: 15, color: C.mist, bold: true, align: "center" });
  text(slide, "Kendali\npengguna", 540, 366, 200, 80, { size: 32, color: C.white, bold: true, align: "center" });

  const caps = [
    { x: 78, y: 210, w: 300, h: 110, t: "Belajar aksesibel", s: "Konten, navigasi, safe exit", status: "INTERAKTIF", fill: C.mist, c: C.teal },
    { x: 902, y: 210, w: 300, h: 110, t: "Jurnal privat", s: "Catatan sintetis dan pilihan sumber", status: "INTERAKTIF", fill: C.mist, c: C.teal },
    { x: 78, y: 454, w: 300, h: 110, t: "Safe Timeline Assistant", s: "Draf, sumber, edit, keputusan", status: "INTERAKTIF", fill: C.violetMist, c: C.violet },
    { x: 902, y: 454, w: 300, h: 110, t: "Pratinjau laporan", s: "Alur consent dan review", status: "SIMULASI", fill: C.coralMist, c: C.coral },
  ];
  caps.forEach((cap) => {
    shape(slide, cap.x, cap.y, cap.w, cap.h, cap.fill, "roundRect");
    pill(slide, cap.status, cap.x + 18, cap.y + 14, 100, C.white, cap.c);
    text(slide, cap.t, cap.x + 18, cap.y + 54, cap.w - 36, 28, { size: 19, color: C.ink, bold: true });
    text(slide, cap.s, cap.x + 18, cap.y + 83, cap.w - 36, 20, { size: 13, color: C.slate });
  });
  shape(slide, 378, 264, 122, 3, C.line);
  shape(slide, 780, 264, 122, 3, C.line);
  shape(slide, 378, 508, 122, 3, C.line);
  shape(slide, 780, 508, 122, 3, C.line);
  text(slide, "Belum diklaim: penyimpanan produksi, integrasi kanal eksternal, keputusan hukum, atau verifikasi kebenaran.", 252, 606, 776, 30, {
    size: 15,
    color: C.coral,
    bold: true,
    align: "center",
  });
  footer(slide);
}

function addSlide9(pres) {
  const slide = pres.slides.add();
  slide.background.fill = C.ink;
  text(slide, "VALIDASI DAN BATAS", 58, 32, 320, 26, { size: 14, color: C.mist, bold: true });
  text(slide, "09", 1184, 30, 42, 28, { size: 14, color: "#FFFFFFAA", bold: true, align: "right" });
  text(slide, "Bukti teknis sudah ada; bukti pengguna masih harus diisi.", 58, 78, 1120, 58, { size: 40, color: C.white, bold: true });

  shape(slide, 58, 184, 400, 420, C.tealDeep, "roundRect");
  text(slide, "10/10", 88, 220, 330, 100, { size: 78, color: C.white, bold: true });
  text(slide, "skenario sintetis lulus", 92, 314, 300, 34, { size: 22, color: C.mist, bold: true });
  const passed = [
    "Struktur JSON valid",
    "Referensi sumber wajib",
    "Informasi hilang tidak ditebak",
    "Fallback aktif saat API gagal",
  ];
  passed.forEach((item, i) => {
    dot(slide, 92, 390 + i * 42, C.mist, 10);
    text(slide, item, 114, 382 + i * 42, 286, 28, { size: 16, color: C.white });
  });

  const checks = [
    { y: 184, t: "Build produksi", v: "LULUS", c: C.mist },
    { y: 278, t: "Lint", v: "LULUS", c: C.mist },
    { y: 372, t: "Keyboard + aksesibilitas dasar", v: "DIPERIKSA", c: C.violetMist },
    { y: 466, t: "Peer testing 3-5 mahasiswa", v: "[[ISI_HASIL]]", c: C.coralMist },
  ];
  checks.forEach((item) => {
    shape(slide, 492, item.y, 730, 74, item.c, "roundRect");
    text(slide, item.t, 520, item.y + 24, 470, 28, { size: 18, color: C.ink, bold: true });
    pill(slide, item.v, 1014, item.y + 20, 178, item.v.includes("ISI") ? C.coral : C.white, item.v.includes("ISI") ? C.white : C.tealDeep);
  });
  text(slide, "Keterbatasan saat ini: data hanya sintetis, integrasi Gemini live perlu bukti tambahan, dan hasil peer test belum dimasukkan.", 492, 566, 700, 48, {
    size: 15,
    color: "#D7E2DF",
  });
  footer(slide, true);
}

function addSlide10(pres) {
  const slide = pres.slides.add();
  slide.background.fill = C.warm;
  topLabel(slide, "Dampak dan arah pengembangan", 10);
  title(slide, "Nilai AmanAkses lahir ketika teknologi memperkuat agensi pengguna.");

  const ladder = [
    { y: 222, w: 520, fill: C.mist, label: "SEKARANG", body: "Mengurangi beban menyusun catatan dan kronologi." },
    { y: 328, w: 660, fill: C.violetMist, label: "BERIKUTNYA", body: "Uji partisipatif, deploy Vercel, dan evaluasi aksesibilitas lebih dalam." },
    { y: 434, w: 800, fill: C.coralMist, label: "POTENSI", body: "Integrasi pendampingan dan kanal rujukan dengan persetujuan eksplisit." },
  ];
  ladder.forEach((item) => {
    shape(slide, 58, item.y, item.w, 82, item.fill, "roundRect");
    text(slide, item.label, 82, item.y + 18, 150, 18, { size: 12, color: C.teal, bold: true });
    text(slide, item.body, 82, item.y + 42, item.w - 48, 28, { size: 18, color: C.ink, bold: true });
  });

  shape(slide, 896, 202, 326, 342, C.tealDeep, "roundRect");
  text(slide, "PRINSIP PENUTUP", 926, 234, 264, 24, { size: 13, color: C.mist, bold: true });
  text(slide, "AI membantu\nmenata.", 926, 292, 264, 76, { size: 34, color: C.white, bold: true });
  shape(slide, 926, 390, 234, 2, "#FFFFFF44");
  text(slide, "Manusia tetap\nmenentukan.", 926, 422, 264, 76, { size: 34, color: C.white, bold: true });

  text(slide, "[[ISI_NAMA_KELOMPOK]]  |  [[ISI_PROTOTYPE_URL]]", 58, 590, 770, 28, { size: 15, color: C.slate, bold: true });
  pill(slide, "TERIMA KASIH", 1010, 584, 180, C.coral, C.white);
  footer(slide);
}

export async function buildDeck() {
  await fs.mkdir(PREVIEW_DIR, { recursive: true });
  await fs.mkdir(LAYOUT_DIR, { recursive: true });
  await fs.mkdir(path.dirname(OUTPUT), { recursive: true });

  const presentation = Presentation.create({ slideSize: { width: 1280, height: 720 } });
  await addSlide1(presentation);
  addSlide2(presentation);
  addSlide3(presentation);
  addSlide4(presentation);
  await addSlide5(presentation);
  addSlide6(presentation);
  addSlide7(presentation);
  addSlide8(presentation);
  addSlide9(presentation);
  addSlide10(presentation);

  for (let i = 0; i < presentation.slides.count; i += 1) {
    const slide = presentation.slides.getItem(i);
    const preview = await presentation.export({ slide, format: "png", scale: 1 });
    const previewBytes = Buffer.from(await preview.arrayBuffer());
    await fs.writeFile(path.join(PREVIEW_DIR, `slide-${String(i + 1).padStart(2, "0")}.png`), previewBytes);
    try {
      const layout = await presentation.export({ slide, format: "layout" });
      await fs.writeFile(path.join(LAYOUT_DIR, `slide-${String(i + 1).padStart(2, "0")}.layout.json`), await layout.text(), "utf8");
    } catch (error) {
      await fs.writeFile(path.join(LAYOUT_DIR, `slide-${String(i + 1).padStart(2, "0")}.layout-error.txt`), String(error), "utf8");
    }
  }

  const pptx = await PresentationFile.exportPptx(presentation);
  await pptx.save(OUTPUT);
  return { output: OUTPUT, previewDir: PREVIEW_DIR, layoutDir: LAYOUT_DIR, slideCount: presentation.slides.count };
}
