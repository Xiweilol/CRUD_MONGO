// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telefono: { type: String, required: true },
  // El campo "rol" ahora es opcional, y por defecto se asigna "user".
  rol: { type: String, default: 'user' },
  password: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
