/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  // Indeks pencarian untuk tabel vehicles yang sudah ada
  pgm.createIndex("vehicles", "active");
  pgm.createIndex("vehicles", "type");
  pgm.createIndex("vehicles", "category");

  // Hub kota
  pgm.createTable("locations", {
    id: { type: "varchar(20)", primaryKey: true },
    code: { type: "varchar(40)", notNull: true },
    name: { type: "varchar(80)", notNull: true },
    status: { type: "varchar(20)", notNull: true },
    city: { type: "varchar(60)", notNull: true },
    icon: { type: "varchar(20)" },
    color: { type: "varchar(20)" },
    sort_order: { type: "integer", notNull: true, default: 0 },
    active: { type: "boolean", notNull: true, default: true },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Relasi kendaraan <-> hub beserta jumlah unit (stock)
  pgm.createTable("vehicle_locations", {
    vehicle_id: {
      type: "integer",
      notNull: true,
      references: "vehicles",
      onDelete: "CASCADE",
    },
    location_id: {
      type: "varchar(20)",
      notNull: true,
      references: "locations",
      onDelete: "CASCADE",
    },
    stock: { type: "integer", notNull: true, default: 1 },
  });
  pgm.addConstraint("vehicle_locations", "vehicle_locations_pkey", {
    primaryKey: ["vehicle_id", "location_id"],
  });
  pgm.addConstraint("vehicle_locations", "vehicle_locations_stock_check", {
    check: "stock >= 0",
  });
  pgm.createIndex("vehicle_locations", "location_id");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.dropTable("vehicle_locations");
  pgm.dropTable("locations");
  pgm.dropIndex("vehicles", "category");
  pgm.dropIndex("vehicles", "type");
  pgm.dropIndex("vehicles", "active");
};
