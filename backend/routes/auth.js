// Archivo: routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuarios');
const auth = require('../middleware/auth'); 
const Biomonitoreo = require('../models/Biomonitoreo');

const router = express.Router();

// --- 1. RUTA DE REGISTRO (CON LÓGICA DE CÓDIGOS) ---
router.post('/registro', async (req, res) => {
  try {
    // 1. Recibimos el código opcional además de los datos básicos
    const { nombre, institucion, email, password, codigo } = req.body;

    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'Ese correo ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(password, salt);

    // --- LÓGICA DE ASIGNACIÓN DE ROLES ---
    let rolAsignado = 'Pendiente'; // Rol por defecto
    let proyectoEncontrado = null;

    if (codigo) {
      const codigoLimpio = codigo.trim().toUpperCase();
      
      // A. ¿Es el código secreto de Responsable?
      if (codigoLimpio === (process.env.CODIGO_RESP || 'ADMIN-ENCB')) {
        rolAsignado = 'Responsable';
      } else {
        // B. ¿Es el código de invitación a un proyecto?
        proyectoEncontrado = await Biomonitoreo.findOne({ codigo_invitacion: codigoLimpio });
        
        if (proyectoEncontrado) {
          rolAsignado = 'Colaborador';
        } else {
          // Si el usuario puso un código pero no existe, devolvemos error
          return res.status(400).json({ mensaje: 'El código ingresado no es válido.' });
        }
      }
    }

    // 2. Creamos al nuevo usuario con el rol determinado
    const nuevoUsuario = new Usuario({
      nombre,
      institucion,
      email,
      password: passwordEncriptada,
      rol: rolAsignado
    });

    await nuevoUsuario.save();

    // 3. Si se unió como colaborador, lo vinculamos al proyecto de una vez
    if (proyectoEncontrado && rolAsignado === 'Colaborador') {
      proyectoEncontrado.colaboradores_id.push(nuevoUsuario._id);
      await proyectoEncontrado.save();
    }

    // 4. Generamos el Token con el rol ya asignado
    const JWT_SECRET = process.env.JWT_SECRET || 'super_secreto_para_desarrollo_deep_bug';
    const token = jwt.sign(
      { id: nuevoUsuario._id, rol: nuevoUsuario.rol }, 
      JWT_SECRET, 
      { expiresIn: '30d' }
    );

    res.status(201).json({ 
        mensaje: 'Usuario registrado exitosamente',
        token: token,
        rol: rolAsignado // Enviamos el rol para que Flutter sepa si ir a Onboarding o Dashboard
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor al registrar' });
  }
});

// --- 2. RUTA DE LOGIN ---
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

    const JWT_SECRET = process.env.JWT_SECRET || 'super_secreto_para_desarrollo_deep_bug';
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

// --- 3. RUTA DE ONBOARDING (Para usuarios que no pusieron código al registrarse) ---
router.post('/validar-codigo', auth, async (req, res) => {
    try {
        const { codigo } = req.body;
        const userId = req.usuario.id;

        const codigoProfesor = process.env.CODIGO_RESP || 'ADMIN-ENCB';
        if (codigo.toUpperCase() === codigoProfesor) {
            await Usuario.findByIdAndUpdate(userId, { rol: 'Responsable' });
            return res.status(200).json({ mensaje: '¡Bienvenido! Rol asignado: Responsable.' });
        }

        const proyecto = await Biomonitoreo.findOne({ codigo_invitacion: codigo.toUpperCase() });
        
        if (proyecto) {
            const yaEsMiembro = proyecto.colaboradores_id.includes(userId) || proyecto.responsable_id.includes(userId);
            
            if (!yaEsMiembro) {
                proyecto.colaboradores_id.push(userId);
                await proyecto.save();
                await Usuario.findByIdAndUpdate(userId, { rol: 'Colaborador' });
            }
            return res.status(200).json({ mensaje: `Te has unido al proyecto ${proyecto.nombre_proyecto} exitosamente.` });
        }

        return res.status(404).json({ mensaje: 'Código inválido o proyecto no encontrado.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error interno al validar el código.' });
    }
});

// --- 4. RUTA DE PERFIL ---
router.get('/perfil', auth, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select('-password');
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el perfil' });
  }
});

module.exports = router;