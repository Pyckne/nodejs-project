const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const User = require('../models/User');
const { comparePassword } = require('../utils/hash');

// Extrae el token desde las cookies
const cookieExtractor = req => req.cookies?.token || null;

module.exports = function (passport) {
  // 🔐 Estrategia Local (login con email y contraseña)
  passport.use('login', new LocalStrategy({
    usernameField: 'email', // por defecto busca 'username', lo cambiamos a 'email'
    passwordField: 'password',
    session: false
  }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) return done(null, false, { message: 'Usuario no encontrado' });

      const isValid = comparePassword(password, user.password);
      if (!isValid) return done(null, false, { message: 'Contraseña incorrecta' });

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  // 🪪 Estrategia JWT para verificar sesión a través del token en la cookie
  passport.use('jwt', new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
    secretOrKey: 'tu_clave_secreta' // 🔐 Esta clave debe coincidir con la usada en generateToken()
  }, async (jwtPayload, done) => {
    try {
      const user = await User.findById(jwtPayload.id);
      if (!user) return done(null, false, { message: 'Usuario no encontrado con este token' });
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }));
};