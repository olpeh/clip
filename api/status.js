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
      return res.json({ exists: false, consumed: false, expiresInSeconds: 0 });
    }

    const entry = JSON.parse(dataStr);
    const expiresIn = Math.max(
      0,
      Math.ceil((entry.expiresAt - Date.now()) / 1000)
    );

    if (expiresIn === 0) {
      await redis.del(key);
      return res.json({ exists: false, consumed: false, expiresInSeconds: 0 });
    }

    return res.json({
      exists: true,
      consumed: entry.consumed,
      expiresInSeconds: expiresIn,
    });
  } catch (error) {
    console.error("Error checking status:", error);
    return res.status(500).json({ error: "Failed to check status" });
  }
};
