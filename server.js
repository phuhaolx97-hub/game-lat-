const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { generateDeck } = require('./words');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const rooms = {}; 

io.on('connection', (socket) => {

    socket.on('createRoom', () => {
        let roomCode;
        do { 
            roomCode = Math.floor(1000 + Math.random() * 9000).toString(); 
        } while (rooms[roomCode]);

        rooms[roomCode] = {
            gmSocket: socket.id,
            players: [], 
            deck: [],
            scores: { P1: 0, P2: 0 },
            currentTurn: 'P1', 
            flippedCards: [],
            timeLeft: 0,
            timerInterval: null,
            isGameOver: false,
            isStarted: false 
        };
        socket.join(roomCode);
        socket.emit('roomCreated', roomCode); 
    });

    socket.on('joinRoom', ({ roomCode, playerName }) => {
        const room = rooms[roomCode];
        if (!room) return socket.emit('errorMsg', 'Phòng không tồn tại!');
        if (room.isStarted) return socket.emit('errorMsg', 'Trận đấu đã bắt đầu, không thể vào!');
        if (room.players.length >= 2) return socket.emit('errorMsg', 'Phòng đã đủ 2 người!');

        const role = room.players.length === 0 ? 'P1' : 'P2';
        room.players.push({ id: socket.id, name: playerName, role: role });
        
        socket.join(roomCode);
        socket.emit('joinSuccess', { role, roomCode }); 
        io.to(roomCode).emit('playerUpdate', room.players); 
    });

    socket.on('startGame', ({ roomCode, timeSetting }) => {
        const room = rooms[roomCode];
        if (room && room.gmSocket === socket.id && room.players.length === 2) {
            room.isStarted = true;
            room.timeLeft = timeSetting || 60;
            room.deck = generateDeck();

            io.to(roomCode).emit('gameStarted', { deck: room.deck, players: room.players });
            io.to(roomCode).emit('updateScore', room.scores);
            io.to(roomCode).emit('turnChanged', room.currentTurn); 
            io.to(roomCode).emit('timerUpdate', room.timeLeft); 

            room.timerInterval = setInterval(() => {
                if (room.timeLeft > 0 && !room.isGameOver) {
                    room.timeLeft--;
                    io.to(roomCode).emit('timerUpdate', room.timeLeft);
                } else if (room.timeLeft <= 0 && !room.isGameOver) {
                    room.isGameOver = true;
                    clearInterval(room.timerInterval);
                    io.to(roomCode).emit('gameOver', { scores: room.scores, players: room.players }); 
                }
            }, 1000);
        }
    });

    socket.on('flipCard', ({ roomCode, cardId, role }) => {
        const room = rooms[roomCode];
        if (!room || room.isGameOver || !room.isStarted) return; 
        if (room.currentTurn !== role || room.flippedCards.length >= 2) return; 
        
        const card = room.deck.find(c => c.id === cardId);
        if (card.isFlipped || card.isMatched) return;

        card.isFlipped = true;
        room.flippedCards.push(card);
        io.to(roomCode).emit('cardFlipped', cardId);

        if (room.flippedCards.length === 2) {
            const [card1, card2] = room.flippedCards;

            if (card1.matchId === card2.matchId) {
                card1.isMatched = true;
                card2.isMatched = true;
                
                room.scores[role] += 1; // 1 điểm mỗi lần lật đúng
                io.to(roomCode).emit('updateScore', room.scores);
                room.flippedCards = [];
                io.to(roomCode).emit('turnChanged', room.currentTurn); 
            } else {
                setTimeout(() => {
                    card1.isFlipped = false;
                    card2.isFlipped = false;
                    io.to(roomCode).emit('cardsUnflipped', [card1.id, card2.id]);
                    room.currentTurn = (room.currentTurn === 'P1') ? 'P2' : 'P1';
                    room.flippedCards = [];
                    io.to(roomCode).emit('turnChanged', room.currentTurn); 
                }, 1500);
            }
        }
    });

    socket.on('disconnect', () => {});
});

// Cổng mạng tương thích với Render.com
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Máy chủ đang chạy tại cổng ${PORT}`);
});