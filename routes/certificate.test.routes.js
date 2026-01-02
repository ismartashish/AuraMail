import express from "express";
import { generateCertificate } from "../utils/generateCertificate.js";
import { generateCertificateId } from "../utils/certificateId.js";

const router = express.Router();

router.get("/test", async (req, res) => {
  const certificateId = generateCertificateId();

  const pdf = await generateCertificate({
    name: "Ashish Kumar",
    event: "AuraMail AI Bootcamp",
    date: "10 Jan 2026",
    certificateId,
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "inline; filename=certificate.pdf"
  );

  res.send(pdf);
});

export default router;
