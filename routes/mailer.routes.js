import express from "express";
import multer from "multer";
import { sendGmail } from "../services/gmail.service.js";
import { generateCertificate } from "../utils/generateCertificate.js";
import { generateCertificateId } from "../utils/certificateId.js";
import { generateCsvReport } from "../utils/generateCsvReport.js";
import { broadcastProgress } from "../utils/progressStore.js";

const router = express.Router();

/* ================= MULTER (MEMORY ONLY) ================= */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

/* ================= PREVIEW CERTIFICATE ================= */
router.post("/preview", upload.single("template"), async (req, res) => {
  try {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (!req.file) return res.status(400).json({ error: "Template missing" });

    const pdfBuffer = await generateCertificate({
      templateBuffer: req.file.buffer,
      name: "Preview User",
      event: "AuraMail Demo",
      date: new Date().toLocaleDateString(),
      certificateId: "PREVIEW",
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=preview.pdf",
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error("Preview error:", err);
    res.status(500).json({ error: "Preview failed" });
  }
});

/* ================= SEND CAMPAIGN ================= */
router.post(
  "/send",
  upload.fields([
    { name: "template", maxCount: 1 },
    { name: "attachments", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const { subject, html, mode } = req.body;
      if (!subject || !html)
        return res.status(400).json({ error: "Subject & body required" });

      const recipients = JSON.parse(req.body.recipients);
      if (!Array.isArray(recipients))
        return res.status(400).json({ error: "Invalid recipients" });

      const templateFile = req.files?.template?.[0];
      const extraFiles = req.files?.attachments || [];

      if (mode === "certificate" && !templateFile)
        return res.status(400).json({ error: "Template required" });

      const report = { total: recipients.length, sent: [], failed: [] };
      const csvRows = [];

      let processed = 0;

      for (const r of recipients) {
        try {
          let attachments = [];
          let emailHtml = html;

          if (mode === "certificate") {
            const certificateId = generateCertificateId();

            const pdf = await generateCertificate({
              templateBuffer: templateFile.buffer,
              name: r.name,
              event: r.event,
              date: r.date,
              certificateId,
            });

            attachments.push({
              filename: "certificate.pdf",
              mimeType: "application/pdf",
              content: pdf,
            });

            emailHtml = emailHtml.replace(
              /{{verify_link}}/g,
              `${process.env.FRONTEND_URL}/verify/${certificateId}`
            );
          }

          extraFiles.forEach((f) =>
            attachments.push({
              filename: f.originalname,
              mimeType: f.mimetype,
              content: f.buffer,
            })
          );

          emailHtml = emailHtml
            .replace(/{{name}}/g, r.name || "")
            .replace(/{{event}}/g, r.event || "");

          await sendGmail({
            accessToken: req.user.accessToken,
            refreshToken: req.user.refreshToken,
            from: req.user.email,
            to: r.email,
            subject,
            html: emailHtml,
            attachments,
          });

          report.sent.push(r.email);
          csvRows.push({ email: r.email, name: r.name, status: "SENT" });
        } catch (err) {
          report.failed.push(r.email);
          csvRows.push({
            email: r.email,
            name: r.name,
            status: "FAILED",
            reason: err.message,
          });
        }

        processed++;
        broadcastProgress({
          sent: processed,
          total: recipients.length,
        });
      }

      /* SEND CSV REPORT */
      const csvBuffer = generateCsvReport(csvRows);

      await sendGmail({
        accessToken: req.user.accessToken,
        refreshToken: req.user.refreshToken,
        from: req.user.email,
        to: req.user.email,
        subject: "AuraMail – Campaign Delivery Report",
        html: `<p>Campaign completed. CSV attached.</p>`,
        attachments: [
          {
            filename: "delivery-report.csv",
            mimeType: "text/csv",
            content: csvBuffer,
          },
        ],
      });

      res.json({ success: true, report });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
