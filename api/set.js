const { createClient } = require("redis");

const EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

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

  const { pin, content } = req.body || {};

  if (!isValidPin(pin)) {
    return res.status(400).json({ error: "PIN must be exactly 4 digits." });
  }

  if (typeof content !== "string" || content.trim().length === 0) {
    return res
      .status(400)
      .json({ error: "Content must be a non-empty string." });
  }

  try {
    const expiresAt = Date.now() + EXPIRY_MS;
    const data = { content, expiresAt, consumed: false };

    // Store in Redis with automatic expiration (5 minutes)
    await redis.setEx(`clip:${pin}`, 300, JSON.stringify(data));

    return res.json({
      ok: true,
      expiresInSeconds: Math.ceil((expiresAt - Date.now()) / 1000),
    });
  } catch (error) {
    console.error("Error storing data:", error);
    return res.status(500).json({ error: "Failed to store data" });
  }
};
