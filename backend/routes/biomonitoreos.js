// Archivo: routes/biomonitoreos.js
const express = require('express');
const router = express.Router();
const Biomonitoreo = require('../models/biomonitoreo');
const auth = require('../middleware/auth');

// Función auxiliar para generar un código alfanumérico aleatorio (Ej. LERM-X9)
function generarCodigo() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// --- 1. CREAR UN NUEVO BIOMONITOREO ---
// URL: POST http://localhost:3000/api/biomonitoreos
router.post('/', auth, async (req, res) => {
  try {
    // REGLA: Solo Administradores o Responsables pueden crear
    if (req.usuario.rol === 'Colaborador') {
      return res.status(403).json({ mensaje: 'Los colaboradores no pueden crear proyectos.' });
    }

    const { nombre_proyecto, zona_id } = req.body;

    // Generamos el código único de invitación
    const codigo_invitacion = generarCodigo();

    const nuevoProyecto = new Biomonitoreo({
      nombre_proyecto,
      zona_id,
      codigo_invitacion,
      responsable_id: [req.usuario.id] // El creador se vuelve el responsable automáticamente
    });

    await nuevoProyecto.save();
    
    res.status(201).json({ 
      mensaje: 'Proyecto creado exitosamente', 
      proyecto: nuevoProyecto 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear el biomonitoreo' });
  }
});

// --- 2. UNIRSE A UN PROYECTO CON CÓDIGO ---
// URL: POST http://localhost:3000/api/biomonitoreos/unirse
router.post('/unirse', auth, async (req, res) => {
  try {
    const { codigo_invitacion } = req.body;

    // Buscamos si existe un proyecto con ese código
    const proyecto = await Biomonitoreo.findOne({ codigo_invitacion });

    if (!proyecto) {
      return res.status(404).json({ mensaje: 'Código de invitación inválido o no existe.' });
    }

    // APLICAMOS TOSTRING() PARA COMPARAR DE FORMA SEGURA
    const userIdText = req.usuario.id.toString();
    
    // Verificamos en el arreglo de colaboradores usando .some()
    const yaEsColaborador = proyecto.colaboradores_id.some(id => id.toString() === userIdText);
    
    // Verificamos al responsable directamente
    const yaEsResponsable = proyecto.responsable_id.toString() === userIdText;

    if (yaEsColaborador || yaEsResponsable) {
      return res.status(400).json({ mensaje: 'Ya eres miembro de este proyecto.' });
    }

    // Si todo está bien, agregamos su ID a la lista de colaboradores
    proyecto.colaboradores_id.push(req.usuario.id);
    await proyecto.save();

    res.json({ mensaje: 'Te has unido al proyecto exitosamente', proyecto });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al unirse al proyecto' });
  }
});

// --- 3. OBTENER MIS PROYECTOS (DASHBOARD) ---
// URL: GET http://localhost:3000/api/biomonitoreos
router.get('/', auth, async (req, res) => {
  try {
    // Buscamos los proyectos donde el usuario sea responsable O colaborador
    const misProyectos = await Biomonitoreo.find({
      $or: [
        { responsable_id: req.usuario.id },
        { colaboradores_id: req.usuario.id }
      ]
    })
    .populate('zona_id', 'nombre') // Populate nos trae el nombre de la zona, no solo su ID
    .populate('responsable_id', 'nombre') // Trae los nombres de los responsables
    .populate('colaboradores_id', 'nombre') // Trae los nombres de los colaboradores
    .sort({ fecha_creacion: -1 });

    res.json(misProyectos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener los proyectos' });
  }
});

// --- 4. REMOVER COLABORADOR ---
// URL: PUT http://localhost:3000/api/biomonitoreos/:id/remover-colaborador
router.put('/:id/remover-colaborador', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { colaborador_id } = req.body;

    const biomonitoreo = await Biomonitoreo.findById(id);
    if (!biomonitoreo) return res.status(404).json({ mensaje: 'Proyecto no encontrado' });

    // Verificar que el que hace la petición es el Responsable
    if (biomonitoreo.responsable_id.toString() !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'Solo el Responsable puede eliminar colaboradores' });
    }

    // Filtramos el arreglo para quitar al colaborador (usamos toString para comparar bien los ObjectIds)
    biomonitoreo.colaboradores_id = biomonitoreo.colaboradores_id.filter(
      colab => colab.toString() !== colaborador_id
    );

    await biomonitoreo.save();
    res.json({ mensaje: 'Colaborador removido exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al remover colaborador' });
  }
});

module.exports = router;