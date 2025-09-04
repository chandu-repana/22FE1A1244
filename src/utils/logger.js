// src/utils/logger.js
// Centralized logging that writes structured events to localStorage.
// Use this everywhere instead of console.log.

export function logEvent(type, message, details = {}) {
  const logs = JSON.parse(localStorage.getItem("logs") || "[]");
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    type,        // e.g., "info", "error", "action"
    message,
    details
  };
  logs.push(entry);
  localStorage.setItem("logs", JSON.stringify(logs));
}

export function getLogs() {
  return JSON.parse(localStorage.getItem("logs") || "[]");
}
