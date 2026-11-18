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
    pgm.createTable("vehicles", {

    id:{
        type:"serial",
        primaryKey:true,
    },

    slug:{
        type:"varchar(60)",
        notNull:true,
        unique:true,
    },

    name:{
        type:"varchar(120)",
        notNull:true,
    },

    category:{
        type:"varchar(40)",
        notNull:true,
    },

    type:{
        type:"varchar(10)",
        notNull:true,
    },

    year:{
        type:"varchar(10)",
    },

    badge:{
        type:"varchar(20)",
    },

    badge_color:{
        type:"varchar(20)",
    },

    description:{
        type:"text",
    },

    image:{
        type:"text",
    },

    fallback_image:{
        type:"text",
    },

    seats:{
        type:"varchar(20)",
    },

    transmission:{
        type:"varchar(40)",
    },

    fuel:{
        type:"varchar(40)",
    },

    price:{
        type:"integer",
        notNull:true,
    },

    price_unit:{
        type:"varchar(20)",
    },

    rating:{
        type:"numeric(2,1)",
    },

    trips:{
        type:"integer",
        notNull:true,
        default:0,
    },

    supports_self:{
        type:"boolean",
        notNull:true,
        default:true,
    },

    supports_driver:{
        type:"boolean",
        notNull:true,
        default:true,
    },

    active:{
        type:"boolean",
        notNull:true,
        default:true,
    },

    created_at:{
        type:"timestamptz",
        notNull:true,
        default:pgm.func("current_timestamp"),
    },

    updated_at:{
        type:"timestamptz",
        notNull:true,
        default:pgm.func("current_timestamp"),
    }

  })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable,("vehicles")
};
