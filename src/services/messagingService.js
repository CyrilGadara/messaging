const ExcelJS = require("exceljs");
const logger = require("../utils/logger");

const BATCH_SIZE = 50;
const DELAY_BETWEEN_MESSAGES = 1000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const messagingService = {
    processExcelFile: async (file) => {
        try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(file);

            const worksheet = workbook.worksheets[0];

            if (!worksheet) {
                throw new Error("No worksheet found in the excel file");
            }

            const contacts = [];
            const invalidRows = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber > 1) {
                    const contact = {
                        name: row.getCell(1).value,
                        email: row.getCell(2).value,
                        phone: row.getCell(3).value,
                    };

                    // Check if email is an object and extract the email address
                    if (contact.email && typeof contact.email === "object") {
                        contact.email = contact.email.text; // Extract the email from the object
                    }

                    //Validate contact data
                    const validationErrors = [];
                    if (!contact.name) validationErrors.push("Name is required");
                    if (!contact.phone && !contact.email) validationErrors.push("Either phone or email is required");

                    // Check if phone is a string, a number, or a nested object
                    if (contact.phone) {
                        if (typeof contact.phone === "object") {
                            validationErrors.push("Phone number contains an invalid format");
                        } else if (!String(contact.phone).match(/^[1-9]\d{9}$/)) {
                            validationErrors.push("Invalid phone number");
                        }
                    }

                    if (validationErrors.length === 0) {
                        contacts.push(contact);
                    } else {
                        invalidRows.push({ rowNumber, data: contact, errors: validationErrors });
                    }

                    console.log(contacts);
                    console.log(invalidRows);
                }
            });

            return {
                success: true,
                contacts,
                invalidRows,
                totalValid: contacts.length,
                totalInvalid: invalidRows.length,
            };
        } catch (error) {
            logger.error("Error in messagingService.processExcelFile: ", error);
            throw new Error("Failed to process excel file");
        }
    },
};

Object.freeze(messagingService);

module.exports = messagingService;
