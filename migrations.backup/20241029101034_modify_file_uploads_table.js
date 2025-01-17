/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .alterTable("file_uploads", (table) => {
            table.dropColumn("original_filename");
            table.dropColumn("stored_filename");
        })
        .then(() => {
            return knex.schema.renameTable("file_uploads", "job_campaigns");
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.renameTable("job_campaigns", "file_uploads").then(() => {
        return knex.schema.alterTable("file_uploads", (table) => {
            table.string("original_filename").notNullable();
            table.string("stored_filename").notNullable();
        });
    });
};
