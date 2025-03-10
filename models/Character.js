const mongoose = require('mongoose');

const CharacterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  abilities: {
    type: [String],
    required: true,
    validate: {
      validator: function(arr) {
        return arr.length === 4;
      },
      message: 'Debes proporcionar exactamente 4 habilidades'
    }
  },
  level: {
    type: Number,
    default: 1
  },
  pasivo: {
    type: String,
    required: true
  },
  runas: {
    type: [String],
    required: true
  }
});

module.exports = mongoose.model('Character', CharacterSchema);
