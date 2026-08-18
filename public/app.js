const socket = io(); 

const mainMenu = document.getElementById('mainMenu');
const hostPanel = document.getElementById('hostPanel');
const joinPanel = document.getElementById('joinPanel');
const gameArea = document.getElementById('gameArea');

const btnStartGame = document.getElementById('btnStartGame');
const playerListUI = document.getElementById('playerList');
const playerCountUI = document.getElementById('playerCount');
const waitingMsg = document.getElementById('waitingMsg');

let myRole = '';
let currentRoom = '';

document.getElementById('btnShowCreate').addEventListener('click', () => socket.emit('createRoom'));
document.getElementById('btnShowJoin').addEventListener('click', () => {
    mainMenu.style.display = 'none';
    joinPanel.style.display = 'inline-block';
});
document.getElementById('btnBackFromHost').addEventListener('click', () => location.reload());
document.getElementById('btnBackFromJoin').addEventListener('click', () => location.reload());

socket.on('roomCreated', (roomCode) => {
    myRole = 'GM';
    currentRoom = roomCode;
    mainMenu.style.display = 'none';
    hostPanel.style.display = 'inline-block';
    document.getElementById('hostRoomCode').innerText = roomCode;
});

document.getElementById('btnJoinRoom').addEventListener('click', () => {
    const roomCode = document.getElementById('joinRoomCode').value.trim();
    const playerName = document.getElementById('joinPlayerName').value.trim();
    if (roomCode.length !== 4) return alert("Mã phòng phải gồm 4 số!");
    if (!playerName) return alert("Vui lòng nhập tên của bạn!");
    socket.emit('joinRoom', { roomCode, playerName });
});

socket.on('playerUpdate', (players) => {
    playerCountUI.innerText = players.length;
    playerListUI.innerHTML = '';
    players.forEach(p => {
        const li = document.createElement('li');
        li.innerText = `🎮 ${p.name}`;
        playerListUI.appendChild(li);
    });

    if (players.length === 2 && myRole === 'GM') {
        btnStartGame.disabled = false;
        btnStartGame.style.background = "linear-gradient(45deg, #11998e 0%, #38ef7d 100%)";
    }
});

socket.on('joinSuccess', ({ role, roomCode }) => {
    myRole = role;
    currentRoom = roomCode;
    document.getElementById('btnJoinRoom').style.display = 'none';
    document.getElementById('joinRoomCode').disabled = true;
    document.getElementById('joinPlayerName').disabled = true;
    waitingMsg.style.display = 'block';
});

socket.on('errorMsg', (msg) => alert(msg));

btnStartGame.addEventListener('click', () => {
    const timeSetting = parseInt(document.getElementById('timeInput').value) || 60;
    socket.emit('startGame', { roomCode: currentRoom, timeSetting });
});

socket.on('gameStarted', ({ deck, players }) => {
    hostPanel.style.display = 'none';
    joinPanel.style.display = 'none';
    gameArea.style.display = 'block';
    
    document.getElementById('roomDisplay').innerText = currentRoom;
    document.getElementById('roleDisplay').innerText = myRole === 'GM' ? 'Quản trò' : 'Người chơi';
    document.getElementById('nameP1').innerText = players[0].name;
    document.getElementById('nameP2').innerText = players[1].name;

    const cardGrid = document.getElementById('cardGrid');
    cardGrid.innerHTML = ''; 
    
    if (myRole === 'GM') cardGrid.classList.add('gm-view');
    else cardGrid.classList.remove('gm-view');

    deck.forEach((card) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.id = card.id;
        
        cardElement.innerHTML = `
            <div class="card-front">${myRole === 'GM' ? card.text : ''}</div>
            <div class="card-back">${card.text}</div>
        `;

        cardElement.addEventListener('click', () => {
            if ((myRole === 'P1' || myRole === 'P2') && !cardElement.classList.contains('flipped') && !cardGrid.classList.contains('locked')) {
                socket.emit('flipCard', { roomCode: currentRoom, cardId: card.id, role: myRole });
            }
        });
        cardGrid.appendChild(cardElement);
    });
});

socket.on('cardFlipped', (cardId) => {
    const cardElement = document.querySelector(`.card[data-id='${cardId}']`);
    if (cardElement) cardElement.classList.add('flipped');
});

socket.on('cardsUnflipped', (cardIds) => {
    cardIds.forEach(id => {
        const cardElement = document.querySelector(`.card[data-id='${id}']`);
        if (cardElement) cardElement.classList.remove('flipped');
    });
});

socket.on('updateScore', (scores) => {
    document.getElementById('scoreP1').innerText = scores.P1;
    document.getElementById('scoreP2').innerText = scores.P2;
});

socket.on('turnChanged', (turn) => {
    const turnContainer = document.getElementById('turnIndicatorContainer');
    if (turn === 'P2') turnContainer.classList.add('turn-p2');
    else turnContainer.classList.remove('turn-p2');

    if (myRole === turn) document.getElementById('cardGrid').classList.remove('locked');
    else document.getElementById('cardGrid').classList.add('locked');
});

socket.on('timerUpdate', (timeLeft) => {
    document.querySelector('#timerDisplay span').innerText = timeLeft;
});

socket.on('gameOver', ({ scores, players }) => {
    document.getElementById('cardGrid').classList.add('locked');
    let winner = "HÒA NHAU!";
    if (scores.P1 > scores.P2) winner = `${players[0].name.toUpperCase()} CHIẾN THẮNG!`;
    else if (scores.P2 > scores.P1) winner = `${players[1].name.toUpperCase()} CHIẾN THẮNG!`;
    
    setTimeout(() => alert(`HẾT GIỜ! ${winner}`), 500);
});