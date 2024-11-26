/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("users", function (table) {
        // table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.string("username", 255).notNullable().unique();
        table.string("email", 255).notNullable().unique();
        table.string("password", 255).notNullable();
        table.enum("role", ["user", "admin"]).notNullable().defaultTo("user");
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
};

/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("users");
};
