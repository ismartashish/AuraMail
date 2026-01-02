import express from "express";
import passport from "passport";
console.log("✅ AUTH ROUTES FILE LOADED");

const router = express.Router();

/* ============================
   START GOOGLE OAUTH
============================ */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/gmail.send",
    ],
    accessType: "offline", // refresh token
    prompt: "consent",
  })
);

/* ============================
   GOOGLE CALLBACK
============================ */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/#/`,
    session: true,
  }),
  (req, res) => {
    // ✅ ALWAYS redirect using HashRouter
    res.redirect(`${process.env.FRONTEND_URL}/#/dashboard`);
  }
);

/* ============================
   CURRENT USER
============================ */
router.get("/me", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ user: null });
  }
  res.json({ user: req.user });
});

/* ============================
   LOGOUT
============================ */
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect(`${process.env.FRONTEND_URL}/#/`);
  });
});

export default router;
