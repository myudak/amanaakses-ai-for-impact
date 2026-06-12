import fs from "node:fs/promises";
import path from "node:path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { createCanvas, DOMMatrix, ImageData, Path2D } from "@napi-rs/canvas";

globalThis.DOMMatrix ??= DOMMatrix;
globalThis.ImageData ??= ImageData;
globalThis.Path2D ??= Path2D;

export async function renderPdf(pdfPath, outputDir, scale = 1.5) {
  await fs.mkdir(outputDir, { recursive: true });
  const data = new Uint8Array(await fs.readFile(pdfPath));
  const pdf = await getDocument({ data, useSystemFonts: true }).promise;

  for (let index = 1; index <= pdf.numPages; index += 1) {
    const page = await pdf.getPage(index);
    const viewport = page.getViewport({ scale });
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    const context = canvas.getContext("2d");
    await page.render({ canvas, canvasContext: context, viewport }).promise;
    await fs.writeFile(path.join(outputDir, `page-${index}.png`), canvas.toBuffer("image/png"));
  }

  return pdf.numPages;
}
