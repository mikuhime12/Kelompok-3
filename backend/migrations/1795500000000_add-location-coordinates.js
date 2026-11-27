/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

// [TAMBAHAN BELAJAR] Simpan titik pusat tiap kota agar backend tidak perlu geocoding API.
/** @param pgm {import('node-pg-migrate').MigrationBuilder} */
export const up = (pgm) => {
  pgm.addColumn("locations", {
    latitude: { type: "double precision" },
    longitude: { type: "double precision" },
  });
};

/** @param pgm {import('node-pg-migrate').MigrationBuilder} */
export const down = (pgm) => {
  pgm.dropColumn("locations", ["latitude", "longitude"]);
};
