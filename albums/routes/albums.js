// routes/albums.js

const express = require('express');
const router = express.Router();
const albumController = require('../controllers/albums');
const { isAuthenticated } = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/authorizeRole');

// Tarkistus
console.log(albumController);

// Julkinen reitti
router.get('/getAllAlbums', albumController.getAllAlbumsPublic);

// Suojatut reitit
router.get('/', isAuthenticated, albumController.getAllAlbums);
router.get('/:id', isAuthenticated, albumController.getAlbumById);
router.post('/', isAuthenticated, albumController.addAlbum);
router.put('/:id', isAuthenticated, albumController.updateAlbum);
router.delete('/:id', isAuthenticated, albumController.deleteAlbum);

// Admin-reitti esimerkki (voit muokata)
router.get('/admin/only', isAuthenticated, authorizeRole('admin'), (req, res) => {
  res.json({ message: 'Tämä näkyy vain admin-roolille' });
});

module.exports = router;
