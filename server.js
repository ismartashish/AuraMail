import express from "express";
import cors from "cors";
import session from "express-session";
import mongoose from "mongoose";
import passport from "passport";

import "./auth/passport.js";

import authRoutes from "./routes/auth.routes.js";
import verifyRoutes from "./routes/verify.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import mailRoutes from "./routes/mail.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import mailerRoutes from "./routes/mailer.routes.js";
import certTestRoutes from "./routes/certificate.test.routes.js";

const app = express();

/* ===============================
   REQUIRED FOR RENDER
================================ */
app.set("trust proxy", 1); // 🔥 REQUIRED for secure cookies

/* ===============================
   GLOBAL MIDDLEWARE
================================ */
app.use(
  cors({
    origin: "https://ismartashish.github.io",
    credentials: true,
  })
);

app.use(express.json());

/* ===============================
   SESSION (OAUTH SAFE)
================================ */
app.use(
  session({
    name: "auramail.sid",
    secret: process.env.JWT_SECRET || "auramail-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "none", // 🔥 REQUIRED for cross-site OAuth
      secure: true,     // 🔥 REQUIRED on Render (https)
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

/* ===============================
   PASSPORT
================================ */
app.use(passport.initialize());
app.use(passport.session());

/* ===============================
   ROUTES
================================ */
app.use("/auth", authRoutes);
app.use("/api/verify", verifyRoutes);
app.use("/api/mailer", progressRoutes);
app.use("/api/mail", mailRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/mailer", mailerRoutes);
app.use("/api/certificate", certTestRoutes);

/* ===============================
   TEST ROUTES (IMPORTANT)
================================ */
app.get("/", (req, res) => {
  res.send("AuraMail Backend Running ✅");
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", oauth: true });
});

/* ===============================
   DATABASE
================================ */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.error(err));

/* ===============================
   SERVER
================================ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
