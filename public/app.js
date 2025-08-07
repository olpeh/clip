async function postJSON(url, data) {
  const res = await fetch(url, {
    method: "POST",

    headers: { "Content-Type": "application/json" },

    body: JSON.stringify(data),
  });

  const text = await res.text();

  let json;

  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { error: "Invalid server response" };
  }

  if (!res.ok)
    throw Object.assign(new Error(json.error || res.statusText), {
      response: json,
      status: res.status,
    });

  return json;
}

function $(id) {
  return document.getElementById(id);
}

function isValidPin(pin) {
  return /^[0-9]{4}$/.test(pin);
}

function setStatus(el, msg, cls = "") {
  el.textContent = msg || "";

  el.className = `status ${cls}`.trim();
}

const setPinEl = $("set-pin");

const setContentEl = $("set-content");

const setBtn = $("set-btn");

const setStatusEl = $("set-status");

const getPinEl = $("get-pin");

const statusBtn = $("status-btn");

const statusEl = $("status");

const consumeBtn = $("consume-btn");

const previewEl = $("preview");

setBtn.addEventListener("click", async () => {
  const pin = (setPinEl.value || "").trim();

  const content = (setContentEl.value || "").trim();

  if (!isValidPin(pin)) {
    setStatus(setStatusEl, "PIN must be exactly 4 digits.", "err");
    return;
  }

  if (!content) {
    setStatus(setStatusEl, "Content cannot be empty.", "err");
    return;
  }

  setBtn.disabled = true;

  setStatus(setStatusEl, "Publishing...", "");

  try {
    const res = await postJSON("/api/set", { pin, content });

    setStatus(
      setStatusEl,
      `Published. Expires in ${res.expiresInSeconds}s.`,
      "ok"
    );

    setContentEl.value = "";
  } catch (e) {
    setStatus(setStatusEl, e.message || "Failed to publish.", "err");
  } finally {
    setBtn.disabled = false;
  }
});

statusBtn.addEventListener("click", async () => {
  const pin = (getPinEl.value || "").trim();

  if (!isValidPin(pin)) {
    setStatus(statusEl, "PIN must be exactly 4 digits.", "err");
    return;
  }

  statusBtn.disabled = true;

  setStatus(statusEl, "Checking...", "");

  try {
    const res = await postJSON("/api/status", { pin });

    if (!res.exists) {
      setStatus(statusEl, "No content found or it has expired.", "warn");

      consumeBtn.disabled = true;

      previewEl.value = "";

      return;
    }

    if (res.consumed) {
      setStatus(statusEl, "Content was already copied once.", "warn");

      consumeBtn.disabled = true;
    } else {
      setStatus(
        statusEl,
        `Available. Expires in ~${res.expiresInSeconds}s.`,
        "ok"
      );

      consumeBtn.disabled = false;
    }
  } catch (e) {
    setStatus(statusEl, e.message || "Failed to check status.", "err");
  } finally {
    statusBtn.disabled = false;
  }
});

consumeBtn.addEventListener("click", async () => {
  const pin = (getPinEl.value || "").trim();

  if (!isValidPin(pin)) {
    setStatus(statusEl, "PIN must be exactly 4 digits.", "err");
    return;
  }

  consumeBtn.disabled = true;

  setStatus(statusEl, "Retrieving...", "");

  try {
    const res = await postJSON("/api/consume", { pin });

    // Attempt to copy to clipboard immediately

    try {
      await navigator.clipboard.writeText(res.content);

      setStatus(
        statusEl,
        "Content copied to clipboard. This was the only copy allowed.",
        "ok"
      );
    } catch {
      setStatus(
        statusEl,
        "Retrieved. Could not auto-copy; please copy manually from the box below.",
        "warn"
      );
    }

    previewEl.value = res.content;
  } catch (e) {
    const msg =
      (e.response && e.response.error) ||
      e.message ||
      "Failed to retrieve content.";

    setStatus(statusEl, msg, "err");

    previewEl.value = "";
  }
});

// Improve UX: enable/disable consume on pin input

getPinEl.addEventListener("input", () => {
  consumeBtn.disabled = !isValidPin(getPinEl.value.trim());
});

consumeBtn.disabled = true;
