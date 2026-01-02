import express from "express";
const router = express.Router();

router.get("/:id", (req, res) => {
  const { id } = req.params;
  if (!id || id.length < 8) {
    return res.json({ valid: false });
  }

  res.json({
    valid: true,
    certificate: {
      certificateId: id,
      issuer: "AuraMail",
    },
  });
});

export default router;
