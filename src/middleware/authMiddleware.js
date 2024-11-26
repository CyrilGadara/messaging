const { verifyToken } = require("../controllers/UserController");

const authMiddleware = {
    requireAuth: async (req, res, next) => {
        verifyToken(req, res, (err) => {
            if (err === "NoToken" || err === "Unauthorized") {
                return res.redirect("/auth");
            }
            next();
        });
    },

    requireAdmin: async (req, res, next) => {
        verifyToken(req, res, (err) => {
            if (err) {
                return res.redirect("/auth");
            }

            if (req.user.role !== "admin") {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            next();
        });
    },
    redirectIfAuthenticated: async (req, res, next) => {
        verifyToken(req, res, (err) => {
            if (!err) {
                return res.redirect("/campaigns");
            }
            next();
        });
    },
    verifyToken: async (req, res, next) => {
        verifyToken(req, res, (err) => {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            next();
        });
    },
};

module.exports = authMiddleware;
