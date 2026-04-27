// Archivo: routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuarios');
const auth = require('../middleware/auth'); // <-- Importamos tu middleware
const Biomonitoreo = require('../models/biomonitoreo');

const router = express.Router();

// --- 1. RUTA DE REGISTRO ---
router.post('/registro', async (req, res) => {
  try {
    const { nombre, institucion, email, password, codigo } = req.body;
    console.log("Iniciando registro para:", email);

    // ... (Validaciones y hashing igual que antes) ...

    const nuevoUsuario = new Usuario({
      nombre,
      institucion,
      email,
      password: passwordEncriptada,
      rol: rolAsignado
    });

    await nuevoUsuario.save();
    console.log("Usuario guardado en BD con rol:", rolAsignado);

    if (proyectoEncontrado && rolAsignado === 'Colaborador') {
      proyectoEncontrado.colaboradores_id.push(nuevoUsuario._id);
      await proyectoEncontrado.save();
      console.log("Vinculado al proyecto:", proyectoEncontrado.nombre_proyecto);
    }

    // --- GENERACIÓN SEGURA DEL TOKEN ---
    const secret = process.env.JWT_SECRET || 'llave_temporal_de_emergencia';
    
    try {
      const token = jwt.sign(
        { id: nuevoUsuario._id, rol: nuevoUsuario.rol }, 
        secret, 
        { expiresIn: '30d' }
      );

      console.log("Token generado con éxito.");
      return res.status(201).json({ 
          mensaje: 'Usuario registrado exitosamente',
          token: token,
          rol: rolAsignado 
      });
    } catch (jwtError) {
      console.error("Error crítico al firmar el token:", jwtError);
      return res.status(500).json({ mensaje: 'Usuario creado pero fallo el inicio de sesión automático.' });
    }

  } catch (error) {
    console.error("Error general en registro:", error);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
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