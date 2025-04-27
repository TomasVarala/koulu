const Album = require('../models/Album');
const CustomError = require('../utils/customError');

// Julkinen haku
const getAllAlbumsPublic = async (req, res) => {
  const albums = await Album.find();
  res.status(200).json({ data: albums });
};

// Kirjautuneelle käyttäjälle
const getAllAlbums = async (req, res) => {
  const albums = await Album.find();
  res.status(200).json({ data: albums });
};

const getAlbumById = async (req, res) => {
  const album = await Album.findById(req.params.id);
  if (!album) throw new CustomError('Album not found', 404);
  res.status(200).json(album);
};

const addAlbum = async (req, res) => {
  const newAlbum = new Album({ ...req.body, user: req.user.id });
  await newAlbum.save();
  res.status(201).json(newAlbum);
};

const updateAlbum = async (req, res) => {
  const album = await Album.findById(req.params.id);
  if (!album) throw new CustomError('Album not found', 404);

  // 🔒 Tarkista omistajuus jos ei admin
  if (req.user.role !== 'admin' && album.user.toString() !== req.user.id) {
    throw new CustomError('Forbidden: You do not own this album', 403);
  }

  const updatedAlbum = await Album.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json(updatedAlbum);
};

const deleteAlbum = async (req, res) => {
  const album = await Album.findById(req.params.id);

  if (!album) {
    // 🔥 SUORA RESPONSE eikä throw enää!
    return res.status(404).json({ message: 'Album not found' });
  }

  await album.deleteOne();
  res.status(204).send();
};


// ✅ Vie kaikki funktiot
module.exports = {
  getAllAlbumsPublic,
  getAllAlbums,
  getAlbumById,
  addAlbum,
  updateAlbum,
  deleteAlbum,
};
