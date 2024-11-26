/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable("conversations", (table) => {
        table.enum("channel", ["whatsapp", "email", "sms"]).notNullable();
        table.enum("status", ["queued", "sent", "failed"]).defaultTo("queued");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable("conversations", (table) => {
        table.dropColumn("channel");
        table.dropColumn("status");
    });
};
