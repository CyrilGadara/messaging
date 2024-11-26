require("dotenv").config();

module.exports = {
    twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    },
    templates: {
        APPOINTMENT_REMINDER: "Your appointment is coming up on {{1}}",
        ORDER_NOTIFICATION: "Your {{1}} order of {{2}} has shipped and should be delivered on {{3}}. Details: {{4}}",
        VERIFICATION_CODE: "Your verification code is {{1}}",
        WELCOME_MESSAGE: "Hello {{name}}, welcome to our service! https://google.com",
        JOB_OPPORTUNITY:
            "Hi {{1}}! 👋 247Hire here. We've found a great job opportunity:\n\n🔹 Position: {{2}}\n🏢 Company: {{3}}\n📍 Location: {{4}}\n💼 Type: {{5}}\n\nInterested? Reply:\n👍 for more info\n👎 if not interested\n\nBest regards,\n247Hire Talent Specialist",
        INTERESTED_RESPONSE:
            "Great to hear you're interested in the {{1}} position at {{2}}! 🎉\n\nHere's the link to proceed further with your application: {{3}}\n\nGood luck!\n\nBest regards,\n247Hire Talent Specialist",
        NOT_INTERESTED_RESPONSE:
            "We understand this opportunity isn't the right fit for you. To help us improve our recommendations, could you please let us know why?\n\nReply with the number that best matches your reason:\n\n1️⃣ Not interested in this type of role\n2️⃣ Location doesn't suit me\n3️⃣ Compensation not in my expected range\n4️⃣ Not looking for new opportunities right now\n5️⃣ Other\n\nThank you for your feedback!\n\nBest regards,\n247Hire Talent Specialist",
        REASON_FOLLOWUP:
            "Thank you for your feedback. We've noted that you're not interested because: {{1}}\n\nWe'll use this information to improve our future recommendations for you.\n\nBest regards,\n247Hire Talent Specialist",
        LOGIN_NOTIFICATION: "Hello {{1}}, you've just logged in at {{2}} using {{3}}. If this wasn't you, please contact support immediately.",
    },
    smsTemplates: {
        JOB_OPPORTUNITY: "247Hire Job Alert: Hello {{1}}!\n We found a job for you: {{2}} at {{3}} in {{4}}. {{5}} position.\nApply here: {{6}}",
    },
};
