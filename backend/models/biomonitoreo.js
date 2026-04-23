// Archivo: models/Biomonitoreo.js
const mongoose = require('mongoose');

const biomonitoreoSchema = new mongoose.Schema({
  nombre_proyecto: { type: String, required: true },
  fecha_creacion: { type: Date, default: Date.now },
  codigo_invitacion: { type: String, required: true, unique: true },
  
  // Relaciones (Apuntan a otras colecciones)
  zona_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Zona', required: true },
  responsable_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }],
  colaboradores_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }]
});

module.exports = mongoose.model('Biomonitoreo', biomonitoreoSchema);