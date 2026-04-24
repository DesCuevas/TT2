// Archivo: models/Zona.js
const mongoose = require('mongoose');

const familiaSchema = new mongoose.Schema({
  nombre_familia: { type: String, required: true },
  orden: { type: String },
  valor_bmwp: { type: Number, required: true },
  tamano: { type: Number },
  imagen_url: { type: String }
});

const zonaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  codigo: { type: String, required: true, unique: true },
  catalogo_familias: [familiaSchema] // El arreglo de familias incrustado
});

module.exports = mongoose.model('Zona', zonaSchema);
