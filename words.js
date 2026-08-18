// File: words.js

// Danh sách 9 cặp từ vựng từ hình ảnh
const baseWords = [
    { en: "AI", vi: "Trí tuệ nhân tạo" },
    { en: "ALGORITHM", vi: "Thuật ngữ" }, 
    { en: "RESEARCH", vi: "Nghiên cứu" },
    { en: "SUMMARY", vi: "Tóm tắt" },
    { en: "DATABASE", vi: "Cơ sở dữ liệu" },
    { en: "LLMs", vi: "Ngôn ngữ lớn" },
    { en: "DATA", vi: "Dữ liệu" },
    { en: "TRANSPARENCY", vi: "Tính minh bạch" },
    { en: "ADVANTAGE", vi: "Lợi thế" }
];

function generateDeck() {
    let deck = [];
    
    baseWords.forEach(word => {
        // Thiết kế Layout: Tiếng Anh to ở trên, Tiếng Việt nhỏ màu vàng ở dưới
        const cardHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1.3;">
                <span style="font-size: 24px; font-weight: 900;">${word.en}</span>
                <span style="font-size: 14px; font-weight: 700; color: #f1c40f; text-transform: uppercase; margin-top: 4px;">${word.vi}</span>
            </div>
        `;
        
        deck.push({ text: cardHTML, matchId: word.en }); 
        deck.push({ text: cardHTML, matchId: word.en }); 
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