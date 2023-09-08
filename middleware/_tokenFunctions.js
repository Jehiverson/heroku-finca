const jwt = require('jsonwebtoken');

// Secreto para firmar y verificar el token
const secret = "ZwVyd#q*b}_@>fWC4N]m^5ddwP?F<>AaLm/@i;tMn@k2x0VJj'w<5|:{(Y~s_q=";

// Función para crear un token JWT
const createToken = (req, res) => {
  const token = jwt.sign(req.body.store, secret);
  res.status(200).json({token})
};

const validateToken = (token) => {
  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    throw new Error('Token inválido');
  }
};

module.exports = { createToken, validateToken };
