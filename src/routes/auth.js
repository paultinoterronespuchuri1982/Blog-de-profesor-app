// src/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { verifyPassword } = require('../utils/password');

const router = express.Router();

// Single teacher account, configured with environment variables:
// ADMIN_USERNAME and ADMIN_PASSWORD_HASH (see scripts/hash-password.js).
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Informe usuário e senha' });
  }

  const expectedUser = process.env.ADMIN_USERNAME;
  const storedHash = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedUser || !storedHash) {
    return res.status(500).json({ message: 'Autenticação não configurada' });
  }

  const ok = username === expectedUser && verifyPassword(password, storedHash);
  if (!ok) {
    return res.status(401).json({ message: 'Credenciais inválidas' });
  }

  const token = jwt.sign({ id: username }, process.env.ACCESS_TOKEN_SECRET, {
    algorithm: 'HS256',
    expiresIn: '1h',
  });
  return res.json({ token });
});

module.exports = router;
