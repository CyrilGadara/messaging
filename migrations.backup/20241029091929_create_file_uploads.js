/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("file_uploads", function (table) {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
        table.string("original_filename").notNullable();
        table.string("stored_filename").notNullable();
        table.string("job_role").notNullable();
        table.string("location").notNullable();
        table.string("job_type").notNullable();
        table.string("company_name").notNullable();
        table.integer("total_records").defaultTo(0);
        table.integer("Processed_records").defaultTo(0);
        table.enum("status", ["pending", "processing", "completed", "failed"]).defaultTo("pending");
        table.json("error_logs");
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("file_uploads");
};
