import { createCanvas, loadImage } from "canvas";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";

export async function generateCertificate({
  templateBuffer,
  name,
  event,
  date,
  certificateId,
}) {
  /* 1️⃣ LOAD TEMPLATE IMAGE */
  const img = await loadImage(templateBuffer);

  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(img, 0, 0);

  /* 2️⃣ DRAW TEXT */
  ctx.textAlign = "center";
  ctx.fillStyle = "#000";

  ctx.font = "bold 60px Arial";
  ctx.fillText(name, img.width / 2, img.height / 2);

  ctx.font = "30px Arial";
  ctx.fillText(event, img.width / 2, img.height / 2 + 60);
  ctx.fillText(date, img.width / 2, img.height / 2 + 110);

  /* 3️⃣ QR CODE */
  const qrDataUrl = await QRCode.toDataURL(
    `http://localhost:5173/verify/${certificateId}`
  );
  const qrImg = await loadImage(qrDataUrl);

  ctx.drawImage(qrImg, img.width - 220, img.height - 220, 180, 180);

  /* 4️⃣ CONVERT CANVAS → PDF (CORRECT WAY) */
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [img.width, img.height],
      margin: 0,
    });

    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      resolve(Buffer.concat(buffers));
    });
    doc.on("error", reject);

    doc.image(canvas.toBuffer(), 0, 0);
    doc.end();
  });
}
