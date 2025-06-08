const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const User = require('../models/User');
const { comparePassword } = require('../utils/hash');

// Función para extraer el token JWT desde las cookies
const cookieExtractor = req => req.cookies?.token || null;

module.exports = function (passport) {
  // 🔐 Estrategia local para login
  passport.use('login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    session: false
  }, async (email, password, done) => {
    try {
      // Busca al usuario por email
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, { message: 'Usuario no encontrado' });
      }

      // 🚫 Verifica si el usuario ha confirmado su cuenta por email
      if (!user.verified) {
        return done(null, false, { message: 'Cuenta no verificada. Por favor verifica tu correo electrónico.' });
      }

      // Compara la contraseña proporcionada con la almacenada
      const isValid = comparePassword(password, user.password);
      if (!isValid) {
        return done(null, false, { message: 'Contraseña incorrecta' });
      }

      // ✅ Si todo está correcto, retorna el usuario
      return done(null, user);

    } catch (error) {
      // En caso de error del servidor
      return done(error);
    }
  }));

  // 🔐 Estrategia JWT para autenticación mediante token
  passport.use('jwt', new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
    secretOrKey: process.env.JWT_SECRET
  }, async (jwtPayload, done) => {
    try {
      const user = await User.findById(jwtPayload.id);
      if (!user) {
        return done(null, false, { message: 'Token inválido' });
      }
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }));
};