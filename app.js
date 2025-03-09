const mongoose = require('mongoose');
const express = require('exoress');
const cors = require('cors');
require('dotenv').config();

const Task = require('./models/Task.js')

const app = express();
const port = process.env.PORT || 3000;

//Middleware
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Conectado a Mongo Atlas'))
.catch(err => console.error(err));

//Rutas Crear tarea
app.post('/api/tasks', async (req, res) => {
    try {
      const { title, description, completed } = req.body;
      const newTask = await Task.create({ title, description, completed });
      return res.status(201).json(newTask);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

// 2, leer
app.get('/api/tasks', async (req, res) => {
    try {
      const tasks = await Task.find();
      return res.json(tasks);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

// 3, actualizar
app.put('/api/tasks/:id', async (req, res) => {
    try {
      const { title, description, completed } = req.body;
      const updatedTask = await Task.findByIdAndUpdate(
        req.params.id,
        { title, description, completed },
        { new: true } // para que retorne el documento actualizado
      );
      return res.json(updatedTask);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

// 4, eliminar
app.delete('/api/tasks/:id', async (req, res) => {
    try {
      await Task.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Task eliminada' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});