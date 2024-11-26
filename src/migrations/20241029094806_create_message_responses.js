/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("message_responses", function (table) {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.uuid("message_id").references("id").inTable("messages").onDelete("CASCADE");
        table.uuid("contact_id").references("id").inTable("contacts").onDelete("CASCADE");
        table.text("content").notNullable();
        table.enum("response_type", ["interested", "not_interested", "reson_followup", "other"]).notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("message_responses");
};
