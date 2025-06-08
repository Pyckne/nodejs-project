const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const { hashPassword, comparePasswords } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const UserDTO = require('../dto/user.dto');
const userRepository = require('../repositories/user.repository');
const { sendWelcomeEmail, sendVerificationEmail } = require('../utils/mailer');

// Registro
router.post('/register', async (req, res) => {
  const { first_name, last_name, email, age, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya está registrado' });
    }

    const verificationCode = uuidv4().split('-')[0];

    const newUser = await User.create({
      first_name,
      last_name,
      email,
      age,
      password: hashPassword(password),
      verificationCode,
      verified: false,
    });

    await sendWelcomeEmail(email, first_name);
    await sendVerificationEmail(email, first_name, verificationCode);

    res.status(201).json({
      message: 'Usuario registrado. Se envió un correo para verificar tu cuenta.',
      userId: newUser._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar el usuario', error: error.message });
  }
});

// Verificar código
router.post('/verify', async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    if (user.verified) return res.status(400).json({ message: 'La cuenta ya está verificada' });

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: 'Código incorrecto' });
    }

    user.verified = true;
    user.verificationCode = null;
    await user.save();

    res.json({ message: 'Cuenta verificada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al verificar la cuenta', error: error.message });
  }
});

// Login
router.post('/login', passport.authenticate('login', { session: false }), async (req, res) => {
  try {
    const user = req.user;

    if (!user.verified) {
      return res.status(401).json({ message: 'Cuenta no verificada. Revisá tu email.' });
    }

    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1 hora
    });

    // Si viene desde un navegador (formulario), redirige a /home
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.redirect('/home');
    }

    // Si viene desde Postman/API, responde con JSON
    res.json({
      message: 'Login exitoso',
      user: {
        id: user._id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al hacer login', error: error.message });
  }
});

// Usuario actual
router.get('/current', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await userRepository.getById(req.user._id);
    const userDTO = new UserDTO(user);
    res.json({ user: userDTO });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuario', error: error.message });
  }
});

// Logout
router.post('/signout', (req, res) => {
  res.clearCookie('token');
  req.session.destroy(() => {
    // Si es un navegador (HTML), redirige al home
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.redirect('/home?logout=1');
    }

    // Si es una API (Postman, etc), responde con JSON
    res.json({ message: 'Sesión cerrada correctamente' });
  });
});

module.exports = router;