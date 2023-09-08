const _tokenFunctions = require('./_tokenFunctions');

const protectRoute = (req, res, next) => {
    const token = req.header('Authorization');
    
    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }
  
    try {
      const decoded = _tokenFunctions.validateToken(token);
      req.user = decoded;   
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token no válido' });
    }
  };

  module.exports = { protectRoute }