import express from "express";
import multer from "multer";
import fs from "fs";
import { requireAuth } from "../middlewares/requireAuth.js";
import { parseExcel } from "../utils/parseExcel.js";
import { parseCSV } from "../utils/parseCSV.js";

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post(
  "/parse",
  requireAuth,               // 🔥 FIX
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const ext = req.file.originalname.split(".").pop().toLowerCase();

    try {
      let rows = [];

      if (ext === "xlsx" || ext === "xls") {
        rows = parseExcel(filePath);
      } else if (ext === "csv") {
        rows = await parseCSV(filePath);
      } else {
        return res.status(400).json({ error: "Unsupported file type" });
      }

      const valid = [];
      const invalid = [];

      rows.forEach((row, index) => {
        if (row.email && row.name) valid.push(row);
        else invalid.push({ row: index + 1, ...row });
      });

      res.json({
        success: true,
        total: rows.length,
        validCount: valid.length,
        invalidCount: invalid.length,
        preview: valid.slice(0, 5),
        data: valid,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to parse file" });
    } finally {
      fs.unlinkSync(filePath); // privacy-first
    }
  }
);

export default router;
