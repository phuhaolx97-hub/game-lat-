// File: words.js

// Danh sách các "Hình ảnh" động vật (Dùng Emoji độ phân giải cao để thay thế hình ảnh)
const baseAnimals = [
    { id: "Sư tử", img: "🦁" },
    { id: "Hổ", img: "🐯" }, 
    { id: "Gấu trúc", img: "🐼" },
    { id: "Cáo", img: "🦊" },
    { id: "Heo", img: "🐷" },
    { id: "Ếch", img: "🐸" },
    { id: "Khỉ", img: "🐵" },
    { id: "Cánh cụt", img: "🐧" },
    { id: "Koala", img: "🐨" }
];

function generateDeck() {
    let deck = [];
    
    baseAnimals.forEach(animal => {
        // Biến Emoji thành một bức ảnh khổng lồ có đổ bóng
        const cardHTML = `
            <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
                <span class="animal-icon" style="font-size: clamp(40px, 5vw, 65px); filter: drop-shadow(0px 8px 6px rgba(0,0,0,0.2)); margin-top: -5px;">${animal.img}</span>
            </div>
        `;
        
        deck.push({ text: cardHTML, matchId: animal.id }); 
        deck.push({ text: cardHTML, matchId: animal.id }); 
    });

    // Trộn bài ngẫu nhiên
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck.map((card, index) => ({
        id: index,
        text: card.text,
        matchId: card.matchId,
        isFlipped: false,
        isMatched: false
    }));
}

module.exports = { generateDeck };