const express = require("express");
const fs = require("fs");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const KEYS_FILE = "keys.json";

// Função para carregar as keys do arquivo JSON
function loadKeys() {
  if (!fs.existsSync(KEYS_FILE)) fs.writeFileSync(KEYS_FILE, "{}");
  return JSON.parse(fs.readFileSync(KEYS_FILE));
}

// Função para salvar as keys no arquivo JSON
function saveKeys(data) {
  fs.writeFileSync(KEYS_FILE, JSON.stringify(data, null, 2));
}

// Endpoint para gerar uma key nova
app.post("/generate", (req, res) => {
  const keys = loadKeys();
  const key = Math.random().toString(36).substring(2, 10).toUpperCase(); // Gera key com 8 caracteres
  const expiresAt = Date.now() + 60 * 60 * 1000; // Validade de 1 hora
  keys[key] = expiresAt;
  saveKeys(keys);
  res.json({ key, expiresAt });
});

// Endpoint para validar uma key
app.get("/validate", (req, res) => {
  const key = req.query.key;
  if (!key) return res.status(400).json({ valid: false, reason: "Key não fornecida" });

  const keys = loadKeys();
  const expiresAt = keys[key];

  if (!expiresAt) return res.status(404).json({ valid: false, reason: "Key não encontrada" });

  if (Date.now() > expiresAt) {
    delete keys[key];
    saveKeys(keys);
    return res.status(403).json({ valid: false, reason: "Key expirada" });
  }

  res.json({ valid: true });
});

// Inicia o servidor
app.listen(port, () => {
  console.log("Servidor rodando na porta " + port);
});
