// src/utils/storage.js
// All mapping and click-tracking helpers.

export function getAllMappings() {
  return JSON.parse(localStorage.getItem("urlMappings") || "{}");
}

export function saveAllMappings(obj) {
  localStorage.setItem("urlMappings", JSON.stringify(obj));
}

export function getUrlMapping(code) {
  const all = getAllMappings();
  return all[code] || null;
}

export function mappingExists(code) {
  const all = getAllMappings();
  return Object.prototype.hasOwnProperty.call(all, code);
}

export function saveUrlMapping(code, data) {
  const all = getAllMappings();
  all[code] = data;
  saveAllMappings(all);
}

export function removeMapping(code) {
  const all = getAllMappings();
  delete all[code];
  saveAllMappings(all);
}

export function incrementClick(code) {
  const mappings = getAllMappings();
  const rec = mappings[code];
  if (!rec) return;
  rec.clicks = (rec.clicks || 0) + 1;
  rec.clickHistory = rec.clickHistory || [];
  rec.clickHistory.push(new Date().toISOString());
  mappings[code] = rec;
  saveAllMappings(mappings);
}
