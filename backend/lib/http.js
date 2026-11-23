// Helper respons & error untuk endpoint /api (selain register/login).
// Bentuk sukses : { data } atau { data, meta }
// Bentuk error  : { error: { code, message, details? } }

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const validationError = (details) =>
  new ApiError(422, "VALIDATION_ERROR", "Data yang dikirim tidak valid.", details);

export const notFound = (code, message) => new ApiError(404, code, message);

export const sendData = (res, data, status = 200) =>
  res.status(status).json({ data });

export const sendList = (res, data, meta) => res.status(200).json({ data, meta });

export function apiNotFound(req, res) {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: "Endpoint tidak ditemukan." },
  });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    const error = { code: err.code, message: err.message };
    if (err.details) error.details = err.details;
    return res.status(err.status).json({ error });
  }

  // JSON body rusak (dilempar express.json)
  if (err?.type === "entity.parse.failed" || err instanceof SyntaxError) {
    return res.status(400).json({
      error: { code: "INVALID_JSON", message: "Body JSON tidak valid." },
    });
  }
  if (err?.type === "entity.too.large") {
    return res.status(413).json({
      error: { code: "PAYLOAD_TOO_LARGE", message: "Body terlalu besar." },
    });
  }

  console.error("Kesalahan server:", err?.message);
  return res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan pada server." },
  });
}
