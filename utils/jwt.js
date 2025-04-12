const jwt = require('jsonwebtoken');

exports.generateToken = (user) => {
  return jwt.sign({ id: user._id }, 'tu_clave_secreta', { expiresIn: '1d' });
};