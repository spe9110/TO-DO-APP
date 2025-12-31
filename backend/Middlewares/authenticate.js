import jwt from "jsonwebtoken";
import logger from "../Config/logging.js";

export const userAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Get token from either cookies or Authorization header
  const token =
    req.cookies?.AccessToken ||
    (authHeader && authHeader.startsWith("Bearer ") && authHeader.split(" ")[1]);

  if (!token) {
    logger.info("userAuth - no token provided", { path: req.path, method: req.method });
    req.user = null; // mark as not logged in
    return next();
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      logger.warn("userAuth - token invalid: no user id", { token });
      return next({ status: 401, message: "Invalid token. Not authorized!" });
    }

    // Attach the decoded user ID to request object
    req.user = { id: decoded.id, role: decoded.role };
    logger.info("userAuth - token verified successfully", { userId: decoded.id });

    return next();
  } catch (error) {
    logger.error("userAuth - token verification failed", { error: error.message, token });
    return next({ status: 403, message: "Invalid or expired token." });
  }
};