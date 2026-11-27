/** @type {import('node-pg-migrate').ColumnDefinitions | undefined} */
export const shorthands = undefined;

export const up = (pgm) => {
  // Normalize the existing default role before enforcing the three supported roles.
  pgm.sql(`UPDATE "daftar_akun" SET role = 'client' WHERE role IS NULL OR role = 'customer'`);
  pgm.alterColumn("daftar_akun", "role", {
    type: "varchar(20)",
    notNull: true,
    default: "client",
  });
  pgm.addConstraint("daftar_akun", "daftar_akun_role_check", {
    check: "role IN ('admin', 'perental', 'client')",
  });

  // Schema expected by connect-pg-simple; session contents stay on the server.
  pgm.createTable("user_sessions", {
    sid: { type: "varchar(255)", primaryKey: true, notNull: true },
    sess: { type: "json", notNull: true },
    expire: { type: "timestamptz", notNull: true },
  });
  pgm.createIndex("user_sessions", "expire");
};

export const down = (pgm) => {
  pgm.dropTable("user_sessions");
  pgm.dropConstraint("daftar_akun", "daftar_akun_role_check");
  pgm.alterColumn("daftar_akun", "role", {
    type: "varchar(20)",
    notNull: false,
    default: "customer",
  });
};
