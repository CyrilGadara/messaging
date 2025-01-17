/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .alterTable("contacts", function (table) {
            // Drop the old columns first
            table.dropColumn("whatsapp_status");
            table.dropColumn("sms_status");
            table.dropColumn("email_status");
        })
        .then(() => {
            // Now, recreate the columns with the updated enum values
            return knex.schema.alterTable("contacts", function (table) {
                table.enum("whatsapp_status", ["not_sent", "sent", "failed"]).defaultTo("not_sent");

                table.enum("sms_status", ["not_sent", "sent", "failed"]).defaultTo("not_sent");

                table.enum("email_status", ["not_sent", "sent", "failed"]).defaultTo("not_sent");
            });
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema
        .alterTable("contacts", function (table) {
            // Drop the new columns
            table.dropColumn("whatsapp_status");
            table.dropColumn("sms_status");
            table.dropColumn("email_status");
        })
        .then(() => {
            // Recreate the original columns without the 'failed' status
            return knex.schema.alterTable("contacts", function (table) {
                table.enum("whatsapp_status", ["not_sent", "sent"]).defaultTo("not_sent");

                table.enum("sms_status", ["not_sent", "sent"]).defaultTo("not_sent");

                table.enum("email_status", ["not_sent", "sent"]).defaultTo("not_sent");
            });
        });
};
