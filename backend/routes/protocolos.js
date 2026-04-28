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

// ... (Tus rutas GET /:biomonitoreo_id y PUT /resolver/:id_protocolo se quedan igualitas que antes) ...