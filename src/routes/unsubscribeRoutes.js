const express = require("express");
const { body } = require("express-validator");
const UnsubscribeController = require("../controllers/UnsubscribeController");

const router = express.Router();

const validateUnsubscribe = [
    body("unsubscribReason")
        .optional({ checkFalsy: true })
        .isString()
        .withMessage("Reason must be a valid text")
        .trim()
        .isLength({ max: 500 })
        .withMessage("Reason must be less than 500 characters"),
];

router.get("/:campaignid/:contactid", UnsubscribeController.renderUnsubscribePage);

router.get("/:campaignid/:contactid/status", UnsubscribeController.checkUnsubscribeStatus);

router.post("/:campaignid/:contactid", validateUnsubscribe, UnsubscribeController.unsubscribe);

module.exports = router;
