// In-memory store: pin -> { content, expiresAt: number, consumed: boolean }
// Note: This will be reset on each function invocation in production
// For persistence, you'd need to use a database like Vercel KV, MongoDB, etc.

const store = new Map();
const EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

function isValidPin(pin) {
  return typeof pin === "string" && /^[0-9]{4}$/.test(pin);
}

function cleanupIfExpired(pin) {
  const entry = store.get(pin);
  if (!entry) return;
  if (Date.now() >= entry.expiresAt) {
    store.delete(pin);
  }
}

export default function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { pin, content } = req.body || {};

  if (!isValidPin(pin)) {
    return res.status(400).json({ error: "PIN must be exactly 4 digits." });
  }

  if (typeof content !== "string" || content.trim().length === 0) {
    return res
      .status(400)
      .json({ error: "Content must be a non-empty string." });
  }

  const expiresAt = Date.now() + EXPIRY_MS;
  store.set(pin, { content, expiresAt, consumed: false });

  return res.json({
    ok: true,
    expiresInSeconds: Math.ceil((expiresAt - Date.now()) / 1000),
  });
}
