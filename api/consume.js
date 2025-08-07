const { createClient } = require("redis");

// Create Redis client
const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

// Connect to Redis
redis.connect().catch(console.error);

function isValidPin(pin) {
  return typeof pin === "string" && /^[0-9]{4}$/.test(pin);
}

module.exports = async function handler(req, res) {
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

  const { pin } = req.body || {};

  if (!isValidPin(pin)) {
    return res.status(400).json({ error: "PIN must be exactly 4 digits." });
  }

  try {
    const key = `clip:${pin}`;
    const dataStr = await redis.get(key);

    if (!dataStr) {
      return res.status(404).json({ error: "Not found or expired." });
    }

    const entry = JSON.parse(dataStr);

    if (entry.consumed) {
      return res.status(410).json({ error: "Content already copied once." });
    }

    if (Date.now() >= entry.expiresAt) {
      await redis.del(key);
      return res.status(404).json({ error: "Not found or expired." });
    }

    // Mark as consumed and update in database
    entry.consumed = true;
    const content = entry.content;

    // Update the entry in Redis (keep the same expiration)
    await redis.set(key, JSON.stringify(entry));

    return res.json({ ok: true, content });
  } catch (error) {
    console.error("Error consuming data:", error);
    return res.status(500).json({ error: "Failed to retrieve data" });
  }
};
