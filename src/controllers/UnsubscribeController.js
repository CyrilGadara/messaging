const ContactModel = require("../models/ContactModel");
const UnsubscribeModel = require("../models/UnsubscribeModel");
const logger = require("../utils/logger");
const { validationResult } = require("express-validator");

const UnsubscribeController = {
    renderUnsubscribePage: async (req, res) => {
        try {
            res.render("unsubscribe/unsubscribe");
        } catch (error) {
            logger.error("Error in UnsubscribeController.unsubscribe: ", error);
            res.status(500).send("Internal server error");
        }
    },
    unsubscribe: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: errors.array(),
                });
            }

            const contact = await ContactModel.findById(req.params.contactid);

            const isAlreadyUnsubscribed = await UnsubscribeModel.isUnsibscribed(contact.email, contact.phone_number);
            if (isAlreadyUnsubscribed) {
                console.log(isAlreadyUnsubscribed);
                return res.status(400).json({
                    success: false,
                    message: "You have already unsubscribed from this campaign.",
                });
            }

            const unsubscribeData = {
                email: contact.email,
                phoneNumber: contact.phone_number,
                reason: req.body.unsubscribeReason,
            };

            console.log(unsubscribeData);

            const result = await UnsubscribeModel.unsubscribe(unsubscribeData);

            res.status(200).json({ success: true });
        } catch (error) {
            logger.error("Error in UnsubscribeController.unsubscribe: ", error);
            res.status(500).render("error", {
                message: "Internal server error",
            });
        }
    },
    checkUnsubscribeStatus: async (req, res) => {
        try {
            const contact = await ContactModel.findById(req.params.contactid);

            const isUnsubscribed = await UnsubscribeModel.isUnsibscribed(contact.email, contact.phone_number);
            console.log(isUnsubscribed);
            res.status(200).json({
                success: true,
                unsubscribed: isUnsubscribed,
            });
        } catch (error) {
            logger.error("Error in UnsubscribeController.checkUnsubscribeStatus: ", error);
            res.status(500).json({
                success: false,
                message: "Failed to check unsubscribe status",
            });
        }
    },
};

Object.freeze(UnsubscribeController);

module.exports = UnsubscribeController;
