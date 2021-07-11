module.exports = {
    development: {
        client: 'sqlite3',
        connection: {
            filename: './data/test.db',
        },
        migrations: {
            directory: './data/migrations',
        },
        useNullAsDefault: true,
    },
    production: {
        client: 'sqlite3',
        connection: {
            filename: './data/test.db',
        },
        migrations: {
            directory: './data/migrations',
        },
        useNullAsDefault: true,
    },
};
