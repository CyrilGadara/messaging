const nodemailer = require("nodemailer");
const config = require("../config/emailConfig");
const logger = require("../utils/logger");
const path = require("path");
const fs = require("fs");

let transporter;
const createTransporter = () => {
    return nodemailer.createTransport({
        service: config.email.service,
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure,
        auth: {
            user: config.email.auth.user,
            pass: config.email.auth.pass,
        },
        tls: config.email.tls,
    });
};

const applyTemplate = (template, parameters) => {
    let result = template;
    parameters.forEach((value, index) => {
        const placeholder = `{{${index + 1}}}`;
        result = result.replace(placeholder, value);
    });

    return result;
};

const sendEmail = async (to, templateName, parameters) => {
    try {
        if (!transporter) {
            transporter = createTransporter();
        }

        if (!config.emailTemplates[templateName]) {
            logger.error(`Template ${templateName} not found`);
            throw new Error(`Template ${templateName} not found`);
        }

        const templatePath = path.join(__dirname, "../emailTemplates", templateName + ".html");

        let htmlTeplate = fs.readFileSync(templatePath, "utf8");

        const html = applyTemplate(htmlTeplate, parameters);

        const mailOptions = {
            from: config.email.auth.user,
            to,
            subject: config.emailTemplates[templateName].subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions);

        logger.info(`Email sent to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId, html: html };
    } catch (error) {
        logger.error(`Error in emailService.sendEmail: ${error.message}`);
        return { success: false, error: error.message };
    }
};

module.exports = { sendEmail };
