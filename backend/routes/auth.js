// Archivo: routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuarios');
const auth = require('../middleware/auth'); // <-- Importamos tu middleware
const Biomonitoreo = require('../models/Biomonitoreo');

const router = express.Router();

// --- 1. RUTA DE REGISTRO ---
router.post('/registro', async (req, res) => {
  try {
    const { nombre, institucion, email, password } = req.body;

    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'Ese correo ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(password, salt);

    const nuevoUsuario = new Usuario({
      nombre,
      institucion,
      email,
      password: passwordEncriptada,
      rol: 'Pendiente' // Siempre forzamos a Pendiente al inicio
    });

    await nuevoUsuario.save();

    // NUEVO: Creamos el Token inmediatamente después de registrarlo
    const JWT_SECRET = process.env.JWT_SECRET;
    const token = jwt.sign(
      { id: nuevoUsuario._id, rol: nuevoUsuario.rol }, 
      JWT_SECRET, 
      { expiresIn: '30d' }
    );

    res.status(201).json({ 
        mensaje: 'Usuario registrado exitosamente',
        token: token // Lo devolvemos para que Flutter lo guarde
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor al registrar' });
  }
});

// --- 2. RUTA DE LOGIN (Se queda exactamente igual que el tuyo) ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ email });
    
    if (!usuario) {
      return res.status(400).json({ mensaje: 'Correo o contraseña incorrectos' });
    }

    const contraseñaValida = await bcrypt.compare(password, usuario.password);
    if (!contraseñaValida) {
      return res.status(400).json({ mensaje: 'Correo o contraseña incorrectos' });
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol }, 
      JWT_SECRET, 
      { expiresIn: '30d' }
    );

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

// --- 3. RUTA DE ONBOARDING (Validar Códigos) ---
// Usamos tu middleware auth para proteger la ruta
router.post('/validar-codigo', auth, async (req, res) => {
    try {
        const { codigo } = req.body;
        const userId = req.usuario.id; // Viene del token decodificado por tu middleware

        // 1. Validar si es el súper código de Responsable
        const codigoProfesor = process.env.CODIGO_RESP;
        if (codigo.toUpperCase() === codigoProfesor) {
            await Usuario.findByIdAndUpdate(userId, { rol: 'Responsable' });
            return res.status(200).json({ mensaje: '¡Bienvenido! Rol asignado: Responsable.' });
        }

        // 2. Validar si es el código de un Biomonitoreo (Invitación a proyecto)
        const proyecto = await Biomonitoreo.findOne({ codigo_invitacion: codigo.toUpperCase() });
        
        if (proyecto) {
            // Revisamos si ya está adentro para no duplicarlo
            const yaEsMiembro = proyecto.colaboradores_id.includes(userId) || proyecto.responsable_id.includes(userId);
            
            if (!yaEsMiembro) {
                // Lo metemos al proyecto
                proyecto.colaboradores_id.push(userId);
                await proyecto.save();
                
                // Le actualizamos su rol
                await Usuario.findByIdAndUpdate(userId, { rol: 'Colaborador' });
            }
            return res.status(200).json({ mensaje: `Te has unido al proyecto ${proyecto.nombre_proyecto} exitosamente.` });
        }

        // 3. Si no es ninguno de los dos
        return res.status(404).json({ mensaje: 'Código inválido o proyecto no encontrado.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error interno al validar el código.' });
    }
});

// Ruta para obtener el perfil del usuario actual
router.get('/perfil', auth, async (req, res) => {
  try {
    // Buscamos al usuario por el ID que viene en el Token
    const usuario = await Usuario.findById(req.usuario.id).select('-password'); // Excluimos la contraseña
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el perfil' });
  }
});

module.exports = router;