// app.js
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const Character = require('./models/Character.js'); // Importa tu modelo de personaje

const app = express();
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Conectado a Mongo Atlas'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos de la carpeta "public"
app.use(express.static('public'));

// ------------------------
// RUTAS DE LA API
// ------------------------

// CREATE
app.post('/api/characters', async (req, res) => {
  try {
    const { name, abilities, level } = req.body;
    
    // Validación para asegurarse de que "level" sea un número
    const levelNumber = Number(level);
    if (isNaN(levelNumber)) {
      return res.status(400).json({ error: 'El campo "nivel" debe ser un número válido.' });
    }
    
    const newCharacter = await Character.create({ name, abilities, level: levelNumber });
    return res.status(201).json(newCharacter);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
});


// READ (Todos los personajes)
app.get('/api/characters', async (req, res) => {
  try {
    const characters = await Character.find();
    return res.json(characters);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// UPDATE
app.put('/api/characters/:id', async (req, res) => {
  try {
    const { name, abilities, level } = req.body;

    // Validar que "level" sea un número
    const levelNumber = Number(level);
    if (isNaN(levelNumber)) {
      return res.status(400).json({ error: 'El campo "nivel" debe ser un número válido.' });
    }

    const updatedCharacter = await Character.findByIdAndUpdate(
      req.params.id,
      { name, abilities, level: levelNumber },
      { new: true }
    );
    return res.json(updatedCharacter);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
});


// DELETE
app.delete('/api/characters/:id', async (req, res) => {
  try {
    await Character.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Personaje eliminado correctamente' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Levantar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
