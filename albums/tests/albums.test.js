/* global beforeAll, afterAll, describe, it, expect */
require('dotenv').config({ path: '.env.test' });

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../App');
const Album = require('../models/Album');
const User = require('../models/User');

let token;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Tyhjennä vanhat tiedot
  await Album.deleteMany({});
  await User.deleteMany({});

  // Luo testikäyttäjä
  const testUser = new User({
    name: 'Test User',
    email: 'test@example.com',
    password: 'testpassword',
  });
  await testUser.save();

  // Luo token testikäyttäjälle
  token = jwt.sign({ id: testUser._id, role: 'user' }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

  // Lisää testialbumit
  await Album.insertMany([
    { artist: 'Artist1', title: 'Title1', year: 2001, genre: 'Rock', tracks: 10, user: testUser._id },
    { artist: 'Artist2', title: 'Title2', year: 2002, genre: 'Jazz', tracks: 8, user: testUser._id },
    { artist: 'Artist3', title: 'Title3', year: 2003, genre: 'Pop', tracks: 12, user: testUser._id },
  ]);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('GET /api/albums', () => {
  it('should return all albums in the test database', async () => {
    const res = await request(app)
      .get('/api/albums')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.data).toHaveLength(3); // Tarkista että albumeita on 3
  });
});

describe('POST /api/albums', () => {
    it('should add a new album and increase album count by one', async () => {
      const newAlbum = {
        artist: 'Test Artist',
        title: 'Test Title',
        year: 2025,
        genre: 'Rock',
        tracks: 9
      };
  
      // Lähetä uusi albumi
      const postRes = await request(app)
        .post('/api/albums')
        .set('Authorization', `Bearer ${token}`)
        .send(newAlbum)
        .expect(201);
  
      // Tarkista että palautettu albumi on oikea
      expect(postRes.body.artist).toBe(newAlbum.artist);
      expect(postRes.body.title).toBe(newAlbum.title);
      expect(postRes.body.year).toBe(newAlbum.year);
      expect(postRes.body.genre).toBe(newAlbum.genre);
      expect(postRes.body.tracks).toBe(newAlbum.tracks);
  
      // Tarkista että albumeita on nyt 4
      const getRes = await request(app)
        .get('/api/albums')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
  
      expect(getRes.body.data).toHaveLength(4);
    });
  });
  
  describe('DELETE /api/albums/:id', () => {
    it('should delete an album and decrease album count by one', async () => {
      const getRes = await request(app)
        .get('/api/albums')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
  
      const albumIdToDelete = getRes.body.data[0]._id;
  
      await request(app)
        .delete(`/api/albums/${albumIdToDelete}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);
  
      const getResAfterDelete = await request(app)
        .get('/api/albums')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
  
      expect(getResAfterDelete.body.data).toHaveLength(3); // 4 → 3
    });
  
    it('should return 404 when trying to delete non-existing album', async () => {
      const nonExistingId = new mongoose.Types.ObjectId();
  
      const res = await request(app)
        .delete(`/api/albums/${nonExistingId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
  
      // 🔥 Varmistetaan että tulee oikea body
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toMatch(/Album not found/i);
    });
  });
  
  
  