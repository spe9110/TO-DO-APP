import logger from "../Config/logging.js";

export const authForRoles = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            // Normalize roles to array
            const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

            // Check if user is authenticated
            if (!req.user || !req.user.id) {
                logger.warn({
                    message: "Unauthorized access attempt - no user in request",
                    path: req.originalUrl,
                    method: req.method,
                });
                return next({ status: 401, message: "Unauthorized: User not authenticated" });
            }

            // Debug logs for role checking
            logger.info({
                message: "Role check initiated",
                userId: req.user.id,
                userRole: req.user.role,
                allowedRoles: roles,
                path: req.originalUrl,
                method: req.method,
            });

            // Check if role is allowed
            const hasAllowedRole = roles.some((role) =>
                req.user.role === role ||
                (Array.isArray(req.user.role) && req.user.role.includes(role))
            );

            if (!hasAllowedRole) {
                logger.warn({
                    message: "Access denied - insufficient role",
                    userId: req.user.id,
                    userRole: req.user.role,
                    requiredRoles: roles,
                    path: req.originalUrl,
                    method: req.method,
                });

                return res.status(403).json({
                    message: "Forbidden: You do not have permission to access this resource",
                    userRole: req.user.role,
                    requiredRoles: roles,
                });
            }

            logger.info({
                message: "Role authorized successfully",
                userId: req.user.id,
                role: req.user.role,
                path: req.originalUrl,
            });

            next();
        } catch (error) {
            logger.error({
                message: "Error in role authorization middleware",
                error: error.message,
                stack: error.stack,
                path: req.originalUrl,
                method: req.method,
            });

            return next({ status: 500, error });
        }
    };
};
