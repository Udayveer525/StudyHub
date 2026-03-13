// auth/optionalAuth.middleware.js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // If no token, set user to null and continue (Guest mode)
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify token. If successful, attach payload (which contains userId)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
  } catch (err) {
    // If token is expired/invalid, downgrade them to a Guest instead of crashing
    req.user = null;
  }
  
  next();
};