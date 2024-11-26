/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .alterTable("job_campaigns", function (table) {
            table.dropColumn("status");
        })
        .then(function () {
            return knex.schema.alterTable("job_campaigns", function (table) {
                table.enum("status", ["ready", "processing", "completed", "failed"]).defaultTo("ready");
            });
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema
        .alterTable("job_campaigns", function (table) {
            table.dropColumn("status");
        })
        .then(function () {
            return knex.schema.alterTable("job_campaigns", function (table) {
                table.enum("status", ["ready", "processubg", "completed", "failed"]).defaultTo("ready");
            });
        });
};
