const express = require("express");
const ConversationController = require("../controllers/ConversationController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router(); // Create a new router

router.get("/api/:contactid/:campaignid/messages", requireAuth, ConversationController.getAllMessages);

router.post("/api/:contactid/:campaignid/messages", requireAuth, ConversationController.create);

module.exports = router;
