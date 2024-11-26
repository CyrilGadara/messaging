const twilio = require("twilio");
const config = require("../config/messagingConfig");
const logger = require("../utils/logger");

const client = twilio(config.twilio.accountSid, config.twilio.authToken);

const applyTemplate = (template, parameters) => {
    return Object.keys(parameters).reduce((acc, key, index) => {
        return acc.replace(`{{${index + 1}}}`, parameters[key]);
    }, template);
};

const sendSMS = async (to, template, parameters) => {
    if (!config.smsTemplates[template]) {
        logger.error(`Template ${template} not found`);
        throw new Error(`Template ${template} not found`);
    }

    const body = applyTemplate(config.smsTemplates[template], parameters);

    try {
        const message = await client.messages.create({
            body: body,
            from: config.twilio.phoneNumber,
            to: `+91${to}`,
        });

        logger.info(`SMS sent to ${to}: ${message.sid}`);
        return { success: true, messageId: message.sid, body: body };
    } catch (error) {
        logger.error(`Error in smsService.sendSMS: ${error.message}`);
        return { success: false, error: error.message };
    }
};

module.exports = { sendSMS };
