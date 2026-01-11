const { createClient } = require("redis");

// Create Redis client
const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

// Connect to Redis
redis.connect().catch(console.error);

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Ping Redis to keep the connection alive
    const pong = await redis.ping();
    const timestamp = new Date().toISOString();

    return res.status(200).json({
      ok: true,
      message: "Redis ping successful",
      pong,
      timestamp,
    });
  } catch (error) {
    console.error("Error pinging Redis:", error);
    return res.status(500).json({
      ok: false,
      error: "Failed to ping Redis",
      message: error.message,
    });
  }
};
