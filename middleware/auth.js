// middleware/auth.js
function requireAuth(req, res, next) {
  if (!req.session.authed) {
    return res
      .status(403)
      .json({ error: "Access Denied – Authentication Required" });
  }
  next();
}

module.exports = { requireAuth };
