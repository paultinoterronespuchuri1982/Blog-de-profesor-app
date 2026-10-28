// src/middlewares/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.status(401).json({ message: 'Token ausente' });

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    { algorithms: ['HS256'] },
    (err, user) => {
      if (err) return res.status(403).json({ message: 'Token inválido ou expirado' });
      req.user = user;
      next();
    }
  );
};

module.exports = { authenticateToken };
