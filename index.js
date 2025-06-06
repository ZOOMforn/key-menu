const express = require("express");
const fs = require("fs");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const KEYS_FILE = "keys.json";

// Carrega keys do arquivo
function loadKeys() {
  if (!fs.existsSync(KEYS_FILE)) fs.writeFileSync(KEYS_FILE, "{}");
  return JSON.parse(fs.readFileSync(KEYS_FILE));
}

// Salva as keys no arquivo
function saveKeys(data) {
  fs.writeFileSync(KEYS_FILE, JSON.stringify(data, null, 2));
}

// Endpoint para gerar uma key nova
app.post("/generate", (req, res) => {
  const keys = loadKeys();
  const key = Math.random().toString(36).substring(2, 10).toUpperCase(); // Ex: 8 dígitos
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hora de validade
  keys[key] = expiresAt;
  saveKeys(keys);
  res.json({ key, expiresAt });
});

// Endpoint para validar uma key
app.get("/validate", (req, res) => {
  const key = req.query.key;
  if (!key) return
