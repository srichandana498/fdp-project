// src/lib/firestoreSafe.js
// Utilities to make Firestore writes safe by stripping invalid values.

export function sanitize(value) {
  if (value === undefined) return undefined;
  if (typeof value === "number" && !Number.isFinite(value)) return undefined;

  if (Array.isArray(value)) {
    return value.map(sanitize).filter((v) => v !== undefined);
  }

  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const s = sanitize(v);
      if (s !== undefined) out[k] = s;
    }
    return out;
  }
  return value;
}

export function safeDoc(obj) {
  const d = sanitize(obj);
  // convert empty strings to null so Firestore accepts them
  for (const k in d) if (d[k] === "") d[k] = null;
  return d;
}
