const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const { hashPassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');
const router = express.Router();
const UserDTO = require('../dto/user.dto');
const userRepository = require('../repositories/user.repository');

// Registro
router.post('/register', async (req, res) => {
  const { first_name, last_name, email, age, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya está registrado' });
    }

    const newUser = await User.create({
      first_name,
      last_name,
      email,
      age,
      password: hashPassword(password),
    });

    res.status(201).json({ message: 'Usuario registrado correctamente', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar el usuario', error: error.message });
  }
});

// Login
router.post('/login', passport.authenticate('login', { session: false }), (req, res) => {
  try {
    const user = req.user;
    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1 hora
    }).json({
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

// Usuario actual (/current)
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
  res.clearCookie('token').json({ message: 'Sesión cerrada correctamente' });
});

module.exports = router;