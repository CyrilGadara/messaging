/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("messages", function (table) {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
        table.uuid("contact_id").references("id").inTable("contacts").onDelete("CASCADE");
        table.uuid("file_upload_id").references("id").inTable("file_uploads").onDelete("CASCADE");
        table.enum("type", ["whatsapp", "email", "sms"]).notNullable();
        table.string("template_name").notNullable();
        table.text("content").notNullable;
        table.enum("status", ["pending", "queued", "sent", "failed"]).defaultTo("pending");
        table.string("external_id");
        table.timestamp("sent_at").defaultTo(knex.fn.now());
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("messages");
};
