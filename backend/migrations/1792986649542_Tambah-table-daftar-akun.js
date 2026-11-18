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
    id:{
        type:"serial",
        primaryKey:true,
    },

    nama:{
        type:"varchar(100)",
        notNull:true,
    },

    email:{
        type:"varchar(100)",
        notNull:true,
        unique:true,
    },

    pw:{
        type:"varchar(100)",
        notNull:true,
    },

    role:{
        type:"varchar(20)",
        notNull:false,
        default:"customer",
    },

    phone:{
        type:"varchar(20)",
    },

    created_at:{
        type:"timestamptz",
        notNull:true,
        default:pgm.func("current_timestamp"),
    },

    updated_at:{
        type:"timestamptz",
        notNull:false,
        default:pgm.func("current_timestamp"),
    },

    token_version:{
        type:"integer",
        notNull:false,
        default:0,
    },

    password_changed_at:{
        type:"timestamptz",
    }

    })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */

export const down = (pgm) => {
  pgm.dropTable("daftar_akun");
};