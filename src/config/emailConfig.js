require("dotenv").config();

module.exports = {
    email: {
        service: "gmail",
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            ciphers: "SSLv3",
        },
    },
    emailTemplates: {
        JOB_OPPORTUNITY: {
            subject: "Exciting Job Opportunity from 247Hire",
        },
    },
};
