import express from "express";
import { addClient, removeClient } from "../utils/progressStore.js";
import { v4 as uuid } from "uuid";

const router = express.Router();

router.get("/progress", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.sendStatus(401);
  }

  const id = uuid();

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write(`data: ${JSON.stringify({ id })}\n\n`);
  addClient(id, res);

  req.on("close", () => {
    removeClient(id);
  });
});

export default router;
