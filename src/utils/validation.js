// src/utils/validation.js
export function isValidUrl(value) {
  if (!value || typeof value !== "string") return false;
  try {
    // Accepts http(s) and data://, mailto etc; requirement expects proper URL format so using URL parser
    const u = new URL(value);
    return !!u.protocol && (u.protocol === "http:" || u.protocol === "https:");
  } catch {
    return false;
  }
}

// shortcodes: alphanumeric, 3-15 chars (reasonable length)
export function isValidShortcode(code) {
  if (!code) return false;
  return /^[A-Za-z0-9]{3,15}$/.test(code);
}

export function parseValidityMinutes(value) {
  if (value === "" || value === null || value === undefined) return 30; // default 30 minutes
  const n = parseInt(value, 10);
  if (Number.isNaN(n) || n <= 0) return null;
  return n;
}
