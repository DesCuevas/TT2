// Archivo: routes/protocolos.js
const express = require('express');
const router = express.Router();
const Protocolo = require('../models/protocolo');
const auth = require('../middleware/auth');
const Biomonitoreo = require('../models/biomonitoreo');

require('dotenv').config(); // <-- CRÍTICO para que process.env funcione

// --- CONFIGURACIÓN DE CLOUDINARY PARA BASE64 ---
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- 1. SINCRONIZAR (CREAR O ACTUALIZAR) PROTOCOLOS ---
router.post('/sincronizar', auth, async (req, res) => {
  try {
    const { protocolos } = req.body; 
    if (!Array.isArray(protocolos) || protocolos.length === 0) {
      return res.status(400).json({ mensaje: 'No se enviaron protocolos' });
    }

    const resultados = [];

    for (const prot of protocolos) {
      // Usamos 'let' porque vamos a modificar datos_formulario si trae imagen
      let { biomonitoreo_id, protocolo_numero, datos_formulario, datos_protocolo_5 } = prot;

      // ====================================================================
      // --- NUEVA MAGIA: INTERCEPTAR FOTO BASE64 Y SUBIR A CLOUDINARY ---
      // ====================================================================
      if (datos_formulario && datos_formulario.foto_base64) {
        try {
          console.log(`[Protocolo ${protocolo_numero}] Subiendo imagen a Cloudinary...`);
          
          // Le decimos a Cloudinary que es un archivo Base64 tipo JPEG/PNG
          const base64ParaCloudinary = `data:image/jpeg;base64,${datos_formulario.foto_base64}`;
          
          // Lo subimos a la carpeta que definiste
          const uploadRes = await cloudinary.uploader.upload(base64ParaCloudinary, {
            folder: 'deepbug_fotos_campo' 
          });

          // Guardamos la URL pública limpia
          datos_formulario.foto_url = uploadRes.secure_url;
          
          // ¡CRÍTICO! Borramos el texto gigante para no explotar la base de datos MongoDB
          delete datos_formulario.foto_base64;
          
          console.log("✅ Imagen subida con éxito:", uploadRes.secure_url);
        } catch (error) {
          console.error("❌ Error subiendo la foto a Cloudinary:", error);
          // Si falla, el código continuará y guardará el formulario, pero sin foto_url
        }
      }
      // ====================================================================

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

        // --- AVISARLE AL PROYECTO QUE YA SE LLENÓ EL PROTOCOLO ---
        if (protocolo_numero === 1) {
          const inSitu = datos_formulario.parametros_in_situ || {};
          const inSituLleno = Object.values(inSitu).some(valor => valor === true);
          const estadoCalculado = inSituLleno ? 2 : 1; 

          await Biomonitoreo.findByIdAndUpdate(biomonitoreo_id, {
            $set: { 'estado_protocolos.protocolo1': estadoCalculado }
          });
        }
        
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

        // --- AVISARLE AL PROYECTO QUE YA SE LLENÓ EL PROTOCOLO ---
        if (protocolo_numero === 1) {
          const inSitu = datos_formulario.parametros_in_situ || {};
          const inSituLleno = Object.values(inSitu).some(valor => valor === true);
          const estadoCalculado = inSituLleno ? 2 : 1; 

          await Biomonitoreo.findByIdAndUpdate(biomonitoreo_id, {
            $set: { 'estado_protocolos.protocolo1': estadoCalculado }
          });
        }
      
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
router.get('/:biomonitoreo_id', auth, async (req, res) => {
  try {
    const { biomonitoreo_id } = req.params;
    const protocolos = await Protocolo.find({ biomonitoreo_id })
                                      .populate('usuario_id', 'nombre email');
    res.json(protocolos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener los protocolos' });
  }
});

// --- 3. RESOLVER CONFLICTO (Solo Responsables/Administradores) ---
router.put('/resolver/:id_protocolo', auth, async (req, res) => {
  try {
    if (req.usuario.rol === 'Colaborador') {
      return res.status(403).json({ mensaje: 'No tienes permisos para resolver conflictos.' });
    }

    const { id_protocolo } = req.params;
    const { accion } = req.body; 

    const protocolo = await Protocolo.findById(id_protocolo);
    if (!protocolo) {
      return res.status(404).json({ mensaje: 'Protocolo no encontrado' });
    }

    if (accion === 'aprobar') {
      await Protocolo.findOneAndUpdate(
        { 
          biomonitoreo_id: protocolo.biomonitoreo_id, 
          protocolo_numero: protocolo.protocolo_numero, 
          estado: 'aprobado' 
        },
        { estado: 'descartado' }
      );

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

// --- 4. OBTENER MI BORRADOR GUARDADO ---
router.get('/mi-borrador/:biomonitoreo_id/:protocolo_numero', auth, async (req, res) => {
  try {
    const { biomonitoreo_id, protocolo_numero } = req.params;
    const protocolo = await Protocolo.findOne({
      biomonitoreo_id,
      protocolo_numero,
      usuario_id: req.usuario.id
    });
    
    if (!protocolo) return res.status(404).json({ mensaje: 'No hay borrador' });
    
    res.json(protocolo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener borrador' });
  }
});

module.exports = router;