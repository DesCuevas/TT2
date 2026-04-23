// Archivo: routes/zonas.js
const express = require('express');
const router = express.Router();
const Zona = require('../models/zonas'); // <-- Ojo aquí con el nombre de tu modelo
const auth = require('../middleware/auth'); // Importamos a nuestro Guardia
const upload = require('../middleware/upload');


// --- 1. OBTENER TODAS LAS ZONAS Y SUS CATÁLOGOS ---
// URL: GET http://localhost:3000/api/zonas
// Nota: Pusimos 'auth' a la mitad. Esto obliga a que pase por el guardia primero.
router.get('/', auth, async (req, res) => {
  try {
    const zonas = await Zona.find();
    res.json(zonas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener las zonas' });
  }
});

// --- 2. CREAR UNA NUEVA ZONA ---
// URL: POST http://localhost:3000/api/zonas
router.post('/', auth, async (req, res) => {
  try {
    // REGLA DE NEGOCIO: Solo Responsable o Administrador pueden crear Zonas
    if (req.usuario.rol === 'Colaborador') {
      return res.status(403).json({ mensaje: 'No tienes permisos para crear zonas o catálogos.' });
    }

    // Si tiene permiso, creamos la zona con lo que nos manden en el JSON
    const nuevaZona = new Zona(req.body);
    await nuevaZona.save();
    
    res.status(201).json({ mensaje: 'Zona creada exitosamente', zona: nuevaZona });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear la zona' });
  }
});

// RUTA PARA AGREGAR UNA FAMILIA A UNA ZONA EXISTENTE
// URL: POST http://localhost:3000/api/zonas/:zonaId/familia
router.post('/:zonaId/familia', [auth, upload.single('imagen')], async (req, res) => {
  try {
    // REGLA RN13: Candado de seguridad para el rol
    if (req.usuario.rol === 'Colaborador') {
      return res.status(403).json({ mensaje: 'No tienes permisos para modificar catálogos.' });
    }

    const { zonaId } = req.params;
    const { nombre_familia, orden, valor_bmwp, tamano } = req.body;

    console.log("Archivo atrapado por Multer:", req.file);
    // Validación por si el frontend no envió la imagen
    if (!req.file) {
      return res.status(400).json({ mensaje: 'Debes incluir una imagen para la familia.' });
    }

    const zona = await Zona.findById(zonaId);
    if (!zona) return res.status(404).json({ mensaje: 'Zona no encontrada' });

    const nuevaFamilia = {
      nombre_familia,
      orden,
      valor_bmwp,
      tamano,
      imagen_url: req.file.path // <-- El link que nos dio Cloudinary
    };

    zona.catalogo_familias.push(nuevaFamilia);
    await zona.save();

    res.json({ mensaje: 'Familia agregada al catálogo', zona });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al subir familia' });
  }
});

module.exports = router;