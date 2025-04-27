const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
  artist: String,
  title: String,
  year: Number,
  genre: String,
  tracks: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Album', albumSchema);
