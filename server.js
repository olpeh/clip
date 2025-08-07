import express from "express";

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());

app.use(express.static("public"));

// In-memory store: pin -> { content, expiresAt: number, consumed: boolean }

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

app.post("/api/set", (req, res) => {
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
});

app.post("/api/status", (req, res) => {
  const { pin } = req.body || {};

  if (!isValidPin(pin)) {
    return res.status(400).json({ error: "PIN must be exactly 4 digits." });
  }

  cleanupIfExpired(pin);

  const entry = store.get(pin);

  if (!entry) {
    return res.json({ exists: false, consumed: false, expiresInSeconds: 0 });
  }

  const expiresIn = Math.max(
    0,
    Math.ceil((entry.expiresAt - Date.now()) / 1000)
  );

  if (expiresIn === 0) {
    store.delete(pin);

    return res.json({ exists: false, consumed: false, expiresInSeconds: 0 });
  }

  return res.json({
    exists: true,
    consumed: entry.consumed,
    expiresInSeconds: expiresIn,
  });
});

app.post("/api/consume", (req, res) => {
  const { pin } = req.body || {};

  if (!isValidPin(pin)) {
    return res.status(400).json({ error: "PIN must be exactly 4 digits." });
  }

  cleanupIfExpired(pin);

  const entry = store.get(pin);

  if (!entry) {
    return res.status(404).json({ error: "Not found or expired." });
  }

  if (entry.consumed) {
    return res.status(410).json({ error: "Content already copied once." });
  }

  if (Date.now() >= entry.expiresAt) {
    store.delete(pin);

    return res.status(404).json({ error: "Not found or expired." });
  }

  // Mark as consumed and return content

  entry.consumed = true;

  const content = entry.content;

  // Optionally clear content to further reduce exposure

  entry.content = "";

  return res.json({ ok: true, content });
});

app.listen(port, () => {
  console.log(`Public clipboard running on http://localhost:${port}`);
});
