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
let p1Name = 'Player 1';
let p2Name = 'Player 2';

document.getElementById('btnShowCreate').addEventListener('click', () => socket.emit('createRoom'));
document.getElementById('btnShowJoin').addEventListener('click', () => {
    mainMenu.style.display = 'none'; joinPanel.style.display = 'inline-block';
});
document.getElementById('btnBackFromHost').addEventListener('click', () => location.reload());
document.getElementById('btnBackFromJoin').addEventListener('click', () => location.reload());

socket.on('roomCreated', (roomCode) => {
    myRole = 'GM'; currentRoom = roomCode;
    mainMenu.style.display = 'none'; hostPanel.style.display = 'inline-block';
    document.getElementById('hostRoomCode').innerText = roomCode;
});

document.getElementById('btnJoinRoom').addEventListener('click', () => {
    const roomCode = document.getElementById('joinRoomCode').value.trim();
    const playerName = document.getElementById('joinPlayerName').value.trim();
    if (roomCode.length !== 4) return alert("Mã phòng phải gồm 4 số!");
    if (!playerName) return alert("Vui lòng nhập tên!");
    socket.emit('joinRoom', { roomCode, playerName });
});

socket.on('playerUpdate', (players) => {
    playerCountUI.innerText = players.length; playerListUI.innerHTML = '';
    players.forEach(p => {
        const li = document.createElement('li'); li.innerText = `🎮 ${p.name}`; playerListUI.appendChild(li);
    });
    if (players.length === 2 && myRole === 'GM') {
        btnStartGame.disabled = false;
        btnStartGame.style.background = "linear-gradient(45deg, #11998e, #38ef7d)";
    }
});

socket.on('joinSuccess', ({ role, roomCode }) => {
    myRole = role; currentRoom = roomCode;
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
    hostPanel.style.display = 'none'; joinPanel.style.display = 'none'; gameArea.style.display = 'block';
    
    document.getElementById('roomDisplay').innerText = currentRoom;
    document.getElementById('roleDisplay').innerText = myRole === 'GM' ? 'Quản trò' : 'Người chơi';
    
    // Lưu tên để hiển thị lúc đổi lượt
    p1Name = players[0].name; p2Name = players[1].name;
    document.getElementById('nameP1').innerText = p1Name;
    document.getElementById('nameP2').innerText = p2Name;

    const cardGrid = document.getElementById('cardGrid'); cardGrid.innerHTML = ''; 
    if (myRole === 'GM') cardGrid.classList.add('gm-view');
    else cardGrid.classList.remove('gm-view');

    deck.forEach((card) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card'); cardElement.dataset.id = card.id;
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

// XỬ LÝ GIAO DIỆN KHI ĐỔI LƯỢT
socket.on('turnChanged', (turn) => {
    const boxP1 = document.getElementById('boxP1');
    const boxP2 = document.getElementById('boxP2');
    const turnNameUI = document.getElementById('currentTurnName');
    const turnBar = document.getElementById('turnBar');

    // Reset màu thanh 15s về mặc định
    turnBar.style.background = turn === 'P1' ? '#00f2fe' : '#38ef7d';

    if (turn === 'P1') {
        boxP1.className = 'score-box active-p1';
        boxP2.className = 'score-box';
        turnNameUI.innerText = p1Name;
        turnNameUI.style.color = '#00f2fe';
    } else {
        boxP1.className = 'score-box';
        boxP2.className = 'score-box active-p2';
        turnNameUI.innerText = p2Name;
        turnNameUI.style.color = '#38ef7d';
    }

    // Khóa/mở khóa lưới thẻ bài
    if (myRole === turn) document.getElementById('cardGrid').classList.remove('locked');
    else document.getElementById('cardGrid').classList.add('locked');
});

// XỬ LÝ THANH 15 GIÂY (MỚI)
socket.on('turnTimerUpdate', (timeLeft) => {
    const turnBar = document.getElementById('turnBar');
    const turnTimeText = document.getElementById('turnTimeText');
    
    turnTimeText.innerText = timeLeft + 's';
    
    // Tính phần trăm chiều dài thanh bar
    const percentage = (timeLeft / 15) * 100;
    turnBar.style.width = percentage + '%';

    // Báo động đỏ khi dưới 5s
    if (timeLeft <= 5 && timeLeft > 0) {
        turnBar.classList.add('danger-bar');
        turnTimeText.classList.add('danger-text');
    } else {
        turnBar.classList.remove('danger-bar');
        turnTimeText.classList.remove('danger-text');
    }
});

socket.on('timerUpdate', (timeLeft) => {
    document.querySelector('#timerDisplay span').innerText = timeLeft;
});

socket.on('gameOver', ({ scores, players }) => {
    document.getElementById('cardGrid').classList.add('locked');
    let winner = "HÒA NHAU!";
    if (scores.P1 > scores.P2) winner = `${players[0].name.toUpperCase()} CHIẾN THẮNG!`;
    else if (scores.P2 > scores.P1) winner = `${players[1].name.toUpperCase()} CHIẾN THẮNG!`;
    
    // Dọn dẹp thanh 15s
    document.getElementById('turnTimeText').innerText = "HẾT GIỜ";
    document.getElementById('turnBar').style.width = '0%';
    
    setTimeout(() => alert(`HẾT GIỜ VÁN ĐẤU! ${winner}`), 500);
});