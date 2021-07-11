import knex from 'knex';
import { camelCase, snakeCase } from 'lodash';

export default knex({
    client: 'sqlite3',
    connection: {
        filename: process.env.SQLITE_DATABASE!,
    },
});

export type TDBResult = Record<string, unknown>;

/* Converts property names from Postgres snakecase format to camelCase */
export function dbToJS<T>(results: TDBResult): T;
export function dbToJS<T>(results: TDBResult[]): T[];
export function dbToJS<T>(results: TDBResult | TDBResult[]): T | T[] {
    if (Array.isArray(results)) {
        const sanitizedResults = results.map((result) => {
            const sanitizedResult = {} as TDBResult;
            for (const key in result) {
                sanitizedResult[camelCase(key)] = result[key];
            }
            return sanitizedResult as T;
        });
        return sanitizedResults as T[];
    }
    const sanitizedResult = {} as TDBResult;
    for (const key in results) {
        sanitizedResult[camelCase(key)] = results[key];
    }
    return sanitizedResult as T;
}

/* Converts property names to Postgres snakecase format */
export function JSToDB(results: unknown | unknown[]): TDBResult | TDBResult[] {
    if (Array.isArray(results)) {
        const sanitizedResults = results.map((result) => {
            const sanitizedResult = {} as TDBResult;
            for (const key in result) {
                sanitizedResult[snakeCase(key)] = result[key];
            }
            return sanitizedResult as TDBResult;
        });
        return sanitizedResults as TDBResult[];
    }
    const sanitizedResult = {} as TDBResult;
    const unknownResults = results as Record<string, unknown>;
    for (const key in unknownResults) {
        sanitizedResult[snakeCase(key)] = unknownResults[key];
    }
    return sanitizedResult as TDBResult;
}
