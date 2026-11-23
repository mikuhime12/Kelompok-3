/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.createTable("bookings", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    // NULL untuk booking tamu
    account_id: {
      type: "integer",
      references: "daftar_akun",
      onDelete: "SET NULL",
    },
    vehicle_id: { type: "integer", notNull: true, references: "vehicles" },
    location_id: {
      type: "varchar(20)",
      notNull: true,
      references: "locations",
    },
    rental_type: { type: "varchar(10)", notNull: true },
    pickup_at: { type: "timestamptz", notNull: true },
    return_at: { type: "timestamptz", notNull: true },
    duration_days: { type: "integer", notNull: true },
    status: {
      type: "varchar(30)",
      notNull: true,
      default: "pending_confirmation",
    },
    customer_name: { type: "varchar(100)", notNull: true },
    customer_phone: { type: "varchar(20)", notNull: true },
    vehicle_subtotal: { type: "integer", notNull: true, default: 0 },
    driver_subtotal: { type: "integer", notNull: true, default: 0 },
    discount: { type: "integer", notNull: true, default: 0 },
    total: { type: "integer", notNull: true },
    currency: { type: "varchar(3)", notNull: true, default: "IDR" },
    access_token: { type: "varchar(64)", notNull: true, unique: true },
    idempotency_key: { type: "varchar(100)", unique: true },
    cancel_reason: { type: "text" },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.addConstraint("bookings", "bookings_return_after_pickup", {
    check: "return_at > pickup_at",
  });
  pgm.addConstraint("bookings", "bookings_total_check", {
    check: "total = vehicle_subtotal + driver_subtotal - discount",
  });
  pgm.addConstraint("bookings", "bookings_rental_type_check", {
    check: "rental_type IN ('self', 'driver')",
  });
  pgm.addConstraint("bookings", "bookings_status_check", {
    check:
      "status IN ('pending_confirmation', 'confirmed', 'ongoing', 'completed', 'cancelled', 'rejected')",
  });

  pgm.createIndex("bookings", "status");
  pgm.createIndex("bookings", ["vehicle_id", "pickup_at", "return_at"]);
  pgm.createIndex("bookings", "account_id");
  pgm.createIndex("bookings", "location_id");

  // Penguncian rentang waktu per unit. Jumlah lock aktif yang tumpang tindih
  // dibatasi <= vehicle_locations.stock lewat pengecekan aplikasi di dalam
  // transaksi (baris vehicle_locations di-lock FOR UPDATE), sehingga hub dengan
  // stock > 1 tetap benar. Constraint eksklusi GiST tidak dipakai karena akan
  // melarang dua booking tumpang tindih walau stock-nya lebih dari satu.
  pgm.createTable("vehicle_availability_locks", {
    id: { type: "serial", primaryKey: true },
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
    },
    booking_id: {
      type: "uuid",
      notNull: true,
      references: "bookings",
      onDelete: "CASCADE",
    },
    pickup_at: { type: "timestamptz", notNull: true },
    return_at: { type: "timestamptz", notNull: true },
    status: { type: "varchar(20)", notNull: true, default: "active" },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });
  pgm.addConstraint("vehicle_availability_locks", "locks_status_check", {
    check: "status IN ('active', 'released')",
  });
  pgm.addConstraint("vehicle_availability_locks", "locks_return_after_pickup", {
    check: "return_at > pickup_at",
  });
  pgm.createIndex("vehicle_availability_locks", [
    "vehicle_id",
    "location_id",
    "status",
    "pickup_at",
    "return_at",
  ]);
  pgm.createIndex("vehicle_availability_locks", "booking_id");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.dropTable("vehicle_availability_locks");
  pgm.dropTable("bookings");
};
