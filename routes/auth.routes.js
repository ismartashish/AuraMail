import express from "express";
import passport from "passport";

const router = express.Router();

// Start Google OAuth
router.get(
  "/google",
  passport.authenticate("google", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/gmail.send"
    ],
    accessType: "offline",   // 🔥 REQUIRED for refresh token
    prompt: "consent",       // 🔥 FORCE Google to re-ask permission
  })
);
// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "https://ismartashish.github.io/AuraMailer/",
  }),
  (req, res) => {
    res.redirect("https://ismartashish.github.io/AuraMailer/dashboard");
  }
);

// ✅ REQUIRED BY FRONTEND
router.get("/me", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ user: null });
  }
  res.json({ user: req.user });
});

// Logout
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("https://ismartashish.github.io/AuraMailer/");
  });
});

export default router;
