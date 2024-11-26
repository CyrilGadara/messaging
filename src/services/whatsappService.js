const twilio = require("twilio");
const config = require("../config/messagingConfig");
const logger = require("../utils/logger");

const createTwilioClient = () => {
    return twilio(config.twilio.accountSid, config.twilio.authToken);
};

const applyTemplate = async (template, parameters) => {
    const result = Object.keys(parameters).reduce((acc, key, index) => {
        return acc.replace(`{{${index + 1}}}`, parameters[key]);
    }, template);
    return result;
};

const whatsappService = (client) => ({
    sendWhatsappMessage: async (to, template, parameters) => {
        // logger.info(`Attempting to send WhatsApp message. Template: ${template}, To: ${to}`);

        if (!config.templates[template]) {
            logger.error(`Template "${template}" not found in config`);
            throw new Error(`Template "${template}" not found`);
        }

        const rawTemplate = config.templates[template];
        // logger.info(`Raw template: ${rawTemplate}`);

        const body = await applyTemplate(rawTemplate, parameters);
        // logger.info(`Processed message body: ${body}`);

        try {
            const message = await client.messages.create({
                body: body,
                from: `whatsapp:${config.twilio.whatsappNumber}`,
                to: `whatsapp:+91${to}`,
            });
            console.log("+++++++++++++++++++++++++++++++++");
            console.log(message);
            console.log("+++++++++++++++++++++++++++++++++");
            logger.info(`WhatsApp message sent to ${to}: ${message.sid}`);
            return { success: true, message: message.sid, body: body };
        } catch (error) {
            logger.error(`Error in whatsappService.sendWhatsappMessage: ${error.message}`);
            return { success: false, error: error.message };
        }
    },
    sendChatWhatsappMessage: async (to, chatmessage) => {
        try {
            const message = await client.messages.create({
                body: chatmessage,
                from: `whatsapp:${config.twilio.whatsappNumber}`,
                to: `whatsapp:+91${to}`,
            });

            console.log("+++++++++++++++++++++++++++++++++");
            console.log(message);
            console.log("+++++++++++++++++++++++++++++++++");
            logger.info(`WhatsApp message sent to ${to}: ${message.sid}`);
            return { success: true, message: message.sid, body: message.body };
        } catch (error) {
            logger.error(`Error in whatsappService.sendChatWhatsappMessage: ${error.message}`);
            return { success: false, error: error.message };
        }
    },
    getWhatsAppMessageStatus: async (messageSid) => {
        try {
            const message = await client.messages(messageSid).fetch();
            return { success: true, status: message.status };
        } catch (error) {
            logger.error(`Error in whatsappService.getWhatsAppMessageStatus: ${error.message}`);
            return { success: false, error: error.message };
        }
    },
    sendWhatsAppResponseMessage: async (from, template, parameters) => {
        const sendTo = from;
        if (!config.templates[template]) {
            logger.error(`Template ${template} not found`);
            throw new Error(`Template ${template} not found`);
        }

        const body = await applyTemplate(config.templates[template], parameters);

        try {
            const message = await client.messages.create({
                body: body,
                from: `whatsapp:${config.twilio.whatsappNumber}`,
                to: `${sendTo}`,
            });

            logger.info(`Whatsapp response message sent to ${sendTo}: ${message.sid}`);
            return { success: true, message: message.sid, body: body };
        } catch (error) {
            logger.error(`Error in whatsappService.sendWhatsAppResponseMessage: ${error.message}`);
            return { success: false, error: error.message };
        }
    },
});

const whatsappServiceInstance = whatsappService(createTwilioClient());

module.exports = whatsappServiceInstance;
