const logger = require("../utils/logger");

const NotificationController = {
    getAllNotifications: async (req, res) => {
        try {
            // const notifications = await req.user.getNotifications();

            res.render("notifications", {
                notifications: [],
                user: req.user,
            });
        } catch (error) {
            logger.error("Error in NotificationController.getAllNotifications", error);
            res.status(500).render("error", {
                success: false,
                message: "Failed to get all notifications",
            });
        }
    },
};

Object.freeze(NotificationController);

module.exports = NotificationController;
