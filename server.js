const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*" }
});

app.use(express.static('public'));

let players = {};

io.on('connection', (socket) => {
    console.log('Pemain terhubung:', socket.id);

    // Kirim data pemain yang sudah ada ke pendatang baru
    socket.emit('currentPlayers', players);

    // Event saat pemain baru bergabung
    socket.on('newPlayer', (userData) => {
        players[socket.id] = {
            id: socket.id,
            name: userData.name,
            x: 0, y: 0, z: 0,
            rotation: 0,
            boatLevel: 0
        };
        // Beritahu pemain lain ada orang baru
        socket.broadcast.emit('playerJoined', players[socket.id]);
    });

    // Update posisi dan rotasi
    socket.on('playerMovement', (movementData) => {
        if (players[socket.id]) {
            players[socket.id].x = movementData.x;
            players[socket.id].z = movementData.z;
            players[socket.id].rotation = movementData.rotation;
            players[socket.id].boatLevel = movementData.boatLevel;
            // Broadcast ke semua kecuali pengirim
            socket.broadcast.emit('playerMoved', players[socket.id]);
        }
    });

    // Putus koneksi
    socket.on('disconnect', () => {
        console.log('Pemain keluar:', socket.id);
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server aktif di port ${PORT}`);
});
