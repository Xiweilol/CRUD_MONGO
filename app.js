// app.js
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { body, validationResult } = require('express-validator'); // Importa express-validator

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

// Función helper para rechazar etiquetas HTML o scripts
const noHtml = (value) => {
  if (/<\/?[a-z][\s\S]*>/i.test(value)) {
    throw new Error('No se permiten etiquetas HTML o scripts.');
  }
  return true;
};

// ------------------------
// RUTAS DE LA API
// ------------------------

// CREATE
app.post(
  '/api/characters',
  [
    // Validación del campo "name"
    body('name')
      .notEmpty().withMessage('El nombre es obligatorio.')
      .custom(noHtml),
    // Validación de "abilities" como arreglo de strings sin HTML
    body('abilities')
      .isArray().withMessage('Las habilidades deben ser un arreglo.')
      .custom(abilities => {
        abilities.forEach(ability => {
          if (/<\/?[a-z][\s\S]*>/i.test(ability)) {
            throw new Error('Las habilidades no deben contener etiquetas HTML o scripts.');
          }
       });
        return true;
      }),
    // Validación de "level" como número entre 1 y 18
    body('level')
      .isNumeric().withMessage('El nivel debe ser un número válido.')
      .custom(value => {
        const levelNumber = Number(value);
        if (levelNumber < 1 || levelNumber > 18) {
          throw new Error('El nivel debe estar entre 1 y 18.');
        }
        return true;
      }),
    // Validación de "pasivo": debe ser un string no vacío y sin HTML
    body('pasivo')
      .notEmpty().withMessage('El pasivo es obligatorio.')
      .custom(noHtml),
    // Validación de "runas": debe ser un arreglo de strings sin HTML y con al menos un elemento
    body('runas')
      .isArray({ min: 1 }).withMessage('Las runas deben ser un arreglo con al menos un elemento.')
      .custom(runas => {
        runas.forEach(runa => {
          if (/<\/?[a-z][\s\S]*>/i.test(runa)) {
            throw new Error('Las runas no deben contener etiquetas HTML o scripts.');
          }
        });
        return true;
      })
  ],
  async (req, res) => {
    // Verifica si hay errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { name, abilities, level, pasivo, runas } = req.body;
      const newCharacter = await Character.create({ 
        name, 
        abilities, 
        level: Number(level),
        pasivo,
        runas
      });
      return res.status(201).json(newCharacter);
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }
);

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
app.put(
  '/api/characters/:id',
  [
    // Validar "name" si se envía (opcional)
    body('name')
      .optional()
      .notEmpty().withMessage('El nombre no debe estar vacío.')
      .custom(noHtml),
    // Validar "abilities" si se envía
    body('abilities')
      .optional()
      .isArray().withMessage('Las habilidades deben ser un arreglo.')
      .custom(abilities => {
        abilities.forEach(ability => {
          if (/<\/?[a-z][\s\S]*>/i.test(ability)) {
            throw new Error('Las habilidades no deben contener etiquetas HTML o scripts.');
          }
        });
        return true;
      }),
    // Validar "level" si se envía
    body('level')
      .optional()
      .isNumeric().withMessage('El nivel debe ser un número válido.')
      .custom(value => {
        const levelNumber = Number(value);
        if (levelNumber < 1 || levelNumber > 18) {
          throw new Error('El nivel debe estar entre 1 y 18.');
        }
        return true;
      }),
    // Validación opcional para "pasivo"
    body('pasivo')
      .optional()
      .notEmpty().withMessage('El pasivo no debe estar vacío.')
      .custom(noHtml),
    // Validación opcional para "runas"
    body('runas')
      .optional()
      .isArray({ min: 1 }).withMessage('Las runas deben ser un arreglo con al menos un elemento.')
      .custom(runas => {
        runas.forEach(runa => {
          if (/<\/?[a-z][\s\S]*>/i.test(runa)) {
            throw new Error('Las runas no deben contener etiquetas HTML o scripts.');
          }
        });
        return true;
      })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { name, abilities, level, pasivo, runas } = req.body;
      const updatedData = {};
      if (name !== undefined) updatedData.name = name;
      if (abilities !== undefined) updatedData.abilities = abilities;
      if (level !== undefined) updatedData.level = Number(level);
      if (pasivo !== undefined) updatedData.pasivo = pasivo;
      if (runas !== undefined) updatedData.runas = runas;
      
      const updatedCharacter = await Character.findByIdAndUpdate(
        req.params.id,
        updatedData,
        { new: true }
      );
      return res.json(updatedCharacter);
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }
);

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
