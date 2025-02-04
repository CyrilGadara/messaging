const express = require("express");
const NotificationController = require("../controllers/NotificationController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, NotificationController.getAllNotifications);

module.exports = router;
