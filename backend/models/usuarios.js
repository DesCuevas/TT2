// Archivo: models/usuarios.js
const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  institucion: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { 
    type: String, 
    enum: ['Administrador', 'Responsable', 'Colaborador'], // <-- Agregamos Pendiente
    required: true
  },
  // <-- NUEVO: Aquí guardaremos las zonas a las que pertenece
  zonas_asignadas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Zona' }] 
});

module.exports = mongoose.model('Usuario', usuarioSchema);