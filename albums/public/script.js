/* global document, window, localStorage */

const result = document.querySelector('.result');
const baseUrl = `${window.location.origin}/api/albums`;

const fetchAlbums = async () => {
    try {
        const token = localStorage.getItem('accessToken'); // 🔥 Haetaan token

        const response = await fetch(baseUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // 🔥 Lähetetään Authorization header
            }
        });

        const data = await response.json();

        const albums = data.data.map((album) => {
            return `<ul>
                <li><strong>Artist:</strong> ${album.artist}</li>
                <li><strong>Title:</strong> ${album.title}</li>
                <li><strong>Year:</strong> ${album.year}</li>
                <li><strong>Genre:</strong> ${album.genre}</li>
                <li><strong>Tracks:</strong> ${album.tracks}</li>
            </ul>`;
        });

        result.innerHTML = albums.join('');
    } catch (error) {
        console.log(error);
        result.innerHTML = `<div class="alert alert-danger">Could not fetch album data</div>`;
    }
};

fetchAlbums();
