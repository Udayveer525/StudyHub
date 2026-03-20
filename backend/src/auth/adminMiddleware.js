// auth/adminMiddleware.js
// Must be used AFTER authMiddleware (requires req.user to be set)
module.exports = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
};