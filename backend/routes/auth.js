// Archivo: routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuarios');

const router = express.Router();

// --- 1. RUTA DE REGISTRO ---
// URL: POST http://localhost:3000/api/auth/registro
router.post('/registro', async (req, res) => {
  try {
    // 1. Recibimos los datos que manda la app de Flutter o la Web
    const { nombre, institucion, email, password, rol } = req.body;

    // 2. Revisamos si el correo ya existe en la base de datos
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'Ese correo ya está registrado' });
    }

    // 3. "Licuamos" (Encriptamos) la contraseña por seguridad
    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(password, salt);

    // 4. Creamos al nuevo usuario con la contraseña segura
    const nuevoUsuario = new Usuario({
      nombre,
      institucion,
      email,
      password: passwordEncriptada,
      rol
    });

    // 5. Lo guardamos en MongoDB
    await nuevoUsuario.save();
    res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor al registrar' });
  }
});

// --- 2. RUTA DE LOGIN ---
// URL: POST http://localhost:3000/api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Buscamos al usuario por su correo
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ mensaje: 'Correo o contraseña incorrectos' });
    }

    // 2. Comparamos la contraseña que escribió con la encriptada de la base de datos
    const contraseñaValida = await bcrypt.compare(password, usuario.password);
    if (!contraseñaValida) {
      return res.status(400).json({ mensaje: 'Correo o contraseña incorrectos' });
    }

    // 3. Creamos el "Gafete VIP" (Token JWT)
    // La palabra secreta para firmar el gafete viene de un archivo oculto .env
    const JWT_SECRET = process.env.JWT_SECRET || 'super_secreto_para_desarrollo_deep_bug';
    
    // Adentro del gafete guardamos su ID y su Rol para saber qué permisos tiene
    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol }, 
      JWT_SECRET, 
      { expiresIn: '30d' } // El gafete dura 30 días
    );

    // 4. Le entregamos el gafete y sus datos al celular/web
    res.json({
      mensaje: 'Login exitoso',
      token: token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor al iniciar sesión' });
  }
});

module.exports = router;