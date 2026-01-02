import express from "express";
import cors from "cors";
import session from "express-session";
import mongoose from "mongoose";
import passport from "passport";
import verifyRoutes from "./routes/verify.routes.js";
import "./auth/passport.js";
import progressRoutes from "./routes/progress.routes.js";
import authRoutes from "./routes/auth.routes.js";
import mailRoutes from "./routes/mail.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import mailerRoutes from "./routes/mailer.routes.js";
import certTestRoutes from "./routes/certificate.test.routes.js";

// ✅ CREATE APP FIRST
const app = express();
app.use("/api/verify", verifyRoutes);

// ✅ GLOBAL MIDDLEWARE FIRST
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());
app.use("/api/mailer", progressRoutes);
app.use(session({
  secret: "auramail-secret",
  resave: false,
  saveUninitialized: false,
   cookie: {
    httpOnly: true,
    sameSite: "lax",   // 🔥 REQUIRED for OAuth redirect
    secure: false,    // 🔥 MUST be false on localhost (http)
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// ✅ ROUTES AFTER MIDDLEWARE
app.use("/auth", authRoutes);
app.use("/api/mail", mailRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/mailer", mailerRoutes);
app.use("/api/certificate", certTestRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("AuraMail Backend Running ✅");
});

// DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.error(err));

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
