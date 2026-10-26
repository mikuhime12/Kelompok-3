/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */

export const up = (pgm) => {
    pgm.createTable("daftar_akun", {
        id:"id", 
        nama:{
            type:"varchar(100)",
            notNull: true,
        },
        email:{
            type:"varchar(100)",
            notNull: true,
            unique: true,
        },
        pw:{
            type:"varchar(100)",
            notNull: true,
        },
        
    })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */

export const down = (pgm) => {
  pgm.dropTable("migration_test");
};