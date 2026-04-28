// Archivo: routes/protocolos.js
const express = require('express');
const router = express.Router();
const Protocolo = require('../models/protocolo');
const auth = require('../middleware/auth');

// --- 1. SINCRONIZAR (CREAR O ACTUALIZAR) PROTOCOLOS ---
router.post('/sincronizar', auth, async (req, res) => {
  try {
    const { protocolos } = req.body; 
    if (!Array.isArray(protocolos) || protocolos.length === 0) {
      return res.status(400).json({ mensaje: 'No se enviaron protocolos' });
    }

    const resultados = [];

    for (const prot of protocolos) {
      const { biomonitoreo_id, protocolo_numero, datos_formulario, datos_protocolo_5 } = prot;

      // 1. Buscamos si ESTE usuario ya tenía un borrador para ESTE protocolo
      let miProtocolo = await Protocolo.findOne({
        biomonitoreo_id,
        protocolo_numero,
        usuario_id: req.usuario.id
      });

      if (miProtocolo) {
        // ACTUALIZAMOS EL EXISTENTE (Evita los clones fantasmas)
        miProtocolo.datos_formulario = datos_formulario;
        if(datos_protocolo_5) miProtocolo.datos_protocolo_5 = datos_protocolo_5;
        miProtocolo.fecha_llenado = Date.now();
        await miProtocolo.save();
        
        resultados.push({ protocolo_numero, estado_asignado: miProtocolo.estado, mensaje: 'Actualizado correctamente' });
      } else {
        // ES NUEVO. Revisamos si alguien MÁS ya lo había aprobado para marcar conflicto
        const protocoloAprobado = await Protocolo.findOne({
          biomonitoreo_id,
          protocolo_numero,
          estado: 'aprobado'
        });

        let estadoFinal = protocoloAprobado ? 'en_conflicto' : 'aprobado';

        const nuevoProtocolo = new Protocolo({
          usuario_id: req.usuario.id,
          biomonitoreo_id,
          protocolo_numero,
          datos_formulario,
          datos_protocolo_5,
          estado: estadoFinal
        });

        await nuevoProtocolo.save();
        resultados.push({ protocolo_numero, estado_asignado: estadoFinal, mensaje: 'Creado correctamente' });
      }
    }

    res.status(201).json({ mensaje: 'Sincronización completada', detalles: resultados });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al sincronizar protocolos' });
  }
});

// --- 2. OBTENER PROTOCOLOS DE UN PROYECTO (Para el Dashboard Web) ---
// URL: GET http://localhost:3000/api/protocolos/:biomonitoreo_id
router.get('/:biomonitoreo_id', auth, async (req, res) => {
  try {
    const { biomonitoreo_id } = req.params;

    // Buscamos todos los protocolos de este proyecto
    // Populate nos trae los datos del usuario que lo llenó (para mostrar su nombre en la web)
    const protocolos = await Protocolo.find({ biomonitoreo_id })
                                      .populate('usuario_id', 'nombre email');

    res.json(protocolos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener los protocolos' });
  }
});

// --- 3. RESOLVER CONFLICTO (Solo Responsables/Administradores) ---
// URL: PUT http://localhost:3000/api/protocolos/resolver/:id_protocolo
router.put('/resolver/:id_protocolo', auth, async (req, res) => {
  try {
    // REGLA: Un colaborador no puede resolver conflictos
    if (req.usuario.rol === 'Colaborador') {
      return res.status(403).json({ mensaje: 'No tienes permisos para resolver conflictos.' });
    }

    const { id_protocolo } = req.params;
    const { accion } = req.body; // 'aprobar' o 'descartar'

    const protocolo = await Protocolo.findById(id_protocolo);
    if (!protocolo) {
      return res.status(404).json({ mensaje: 'Protocolo no encontrado' });
    }

    if (accion === 'aprobar') {
      // 1. Buscamos si había otro protocolo aprobado y lo pasamos a descartado (lo sustituimos)
      await Protocolo.findOneAndUpdate(
        { 
          biomonitoreo_id: protocolo.biomonitoreo_id, 
          protocolo_numero: protocolo.protocolo_numero, 
          estado: 'aprobado' 
        },
        { estado: 'descartado' }
      );

      // 2. Aprobamos este
      protocolo.estado = 'aprobado';
      await protocolo.save();
      
      return res.json({ mensaje: 'Protocolo aprobado exitosamente', protocolo });
      
    } else if (accion === 'descartar') {
      protocolo.estado = 'descartado';
      await protocolo.save();
      return res.json({ mensaje: 'Protocolo descartado', protocolo });
    } else {
      return res.status(400).json({ mensaje: 'Acción no válida. Usa "aprobar" o "descartar".' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al resolver el conflicto' });
  }
});

// --- NUEVA RUTA: OBTENER MI BORRADOR GUARDADO ---
router.get('/mi-borrador/:biomonitoreo_id/:protocolo_numero', auth, async (req, res) => {
  try {
    const { biomonitoreo_id, protocolo_numero } = req.params;
    const protocolo = await Protocolo.findOne({
      biomonitoreo_id,
      protocolo_numero,
      usuario_id: req.usuario.id
    });
    // Si no hay nada, mandamos un 404 para que la app sepa que está en blanco
    if (!protocolo) return res.status(404).json({ mensaje: 'No hay borrador' });
    
    res.json(protocolo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener borrador' });
  }
});

module.exports = router;