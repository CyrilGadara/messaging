/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("contacts", function (table) {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.uuid("file_upload_id").references("id").inTable("file_uploads").onDelete("CASCADE");
        table.string("name").notNullable();
        table.string("email");
        table.string("phone_number");
        table.enum("whatsapp_status", ["not_sent", "sent", "responded"]).defaultTo("not_sent");
        table.enum("sms_status", ["not_sent", "sent"]).defaultTo("not_sent");
        table.enum("email_status", ["not_sent", "sent"]).defaultTo("not_sent");
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("contacts");
};
