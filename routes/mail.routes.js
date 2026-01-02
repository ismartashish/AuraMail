import express from "express";
import { sendGmail } from "../services/gmail.service.js";
import { generateCertificate } from "../utils/generateCertificate.js";
import { generateCertificateId } from "../utils/certificateId.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = express.Router();

router.post("/send-certificates", requireAuth, async (req, res) => {
  const { subject, html, recipients } = req.body;

  const report = {
    total: recipients.length,
    sent: [],
    failed: [],
  };

  for (const recipient of recipients) {
    try {
      const certificateId = generateCertificateId();

      // 1️⃣ Generate certificate
      const pdfBuffer = await generateCertificate({
        name: recipient.name,
        event: recipient.event,
        date: recipient.date,
        certificateId,
      });

      // 2️⃣ Personalize email
      const personalizedHtml = html
        .replace(/{{name}}/g, recipient.name)
        .replace(/{{event}}/g, recipient.event)
        .replace(
          /{{verify_link}}/g,
          `https://auramail.com/verify/${certificateId}`
        );

      // 3️⃣ Send mail
      await sendGmail({
        accessToken: req.user.accessToken,
        refreshToken: req.user.refreshToken,
        from: req.user.email,
        to: recipient.email,
        subject,
        html: personalizedHtml,
        attachments: [
          {
            filename: "certificate.pdf",
            mimeType: "application/pdf",
            content: pdfBuffer,
          },
        ],
      });

      report.sent.push(recipient.email);
    } catch (err) {
      console.error("Failed:", recipient.email, err.message);
      report.failed.push(recipient.email);
    }
  }

  res.json({
    success: true,
    report,
  });
});

export default router;
