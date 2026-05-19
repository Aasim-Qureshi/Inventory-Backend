const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

// In production, store this in your DB or env; seeded once.
// Run this once in a Node REPL to generate:
//   require("bcryptjs").hashSync("admin123", 10)
// then put the result in your .env as AUTH_PASSWORD_HASH
const getHash = () =>
  process.env.AUTH_PASSWORD_HASH || bcrypt.hashSync("admin123", 10);

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: "Password required" });

  const valid = bcrypt.compareSync(password, getHash());
  if (!valid) return res.status(401).json({ error: "Incorrect password" });

  req.session.authed = true;
  res.json({ ok: true });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// GET /api/auth/status  — called on app load to rehydrate session
router.get("/status", (req, res) => {
  res.json({ authed: !!req.session.authed });
});

// POST /api/auth/change-password
router.post("/change-password", (req, res) => {
  if (!req.session.authed)
    return res.status(403).json({ error: "Not authenticated" });

  const { current, next } = req.body;
  if (!bcrypt.compareSync(current, getHash()))
    return res.status(401).json({ error: "Current password is incorrect." });
  if (!next || next.length < 4)
    return res
      .status(400)
      .json({ error: "New password must be at least 4 characters." });

  // Persist the new hash. For a real app write to DB; here we update the env var in memory.
  // You should persist to your DB or a config file instead.
  process.env.AUTH_PASSWORD_HASH = bcrypt.hashSync(next, 10);
  res.json({ ok: true });
});

module.exports = router;
