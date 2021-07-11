exports.up = function (knex, Promise) {
    return knex.schema
        .createTable('estates', function (table) {
            table.increments('id').primary();
            table.enu('provider', ['etuovi']);
            table.string('provider_id').notNullable();
            table.string('url').notNullable();
            table.string('type');
            table.string('address', 500);
            table.integer('price');
            table.integer('year');
            table.integer('livable_size');
            table.integer('total_size');
            table.integer('floors');
            table.string('poster_photo_url');
            table.string('floor_plan_photo_url');
            table
                .integer('channel_id')
                .unsigned()
                .notNullable()
                .references('id')
                .inTable('channels')
                .onDelete('CASCADE');
            table
                .timestamp('created_at')
                .notNullable()
                .defaultTo(knex.fn.now());
            table
                .timestamp('updated_at')
                .notNullable()
                .defaultTo(knex.fn.now());
        })
        .createTable('users', function (table) {
            table.increments('id').primary();
            table.string('userId').notNullable();
            table
                .timestamp('created_at')
                .notNullable()
                .defaultTo(knex.fn.now());
            table
                .timestamp('updated_at')
                .notNullable()
                .defaultTo(knex.fn.now());
        })
        .createTable('channels', function (table) {
            table.increments('id').primary();
            table.string('channel_id').notNullable();
            table
                .timestamp('created_at')
                .notNullable()
                .defaultTo(knex.fn.now());
            table
                .timestamp('updated_at')
                .notNullable()
                .defaultTo(knex.fn.now());
        });
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTable('estates').dropTable('users');
};
