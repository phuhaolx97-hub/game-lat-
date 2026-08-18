// File: words.js

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
        // Dùng clamp() để chữ tự động co giãn to/nhỏ tùy theo độ lớn của màn hình
        // Dùng word-break: break-word; để chữ dài tự động rớt xuống dòng thay vì tràn ra ngoài
        const cardHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%;">
                <span style="font-size: clamp(14px, 1.8vw, 24px); font-weight: 900; word-break: break-word; width: 100%; text-align: center; line-height: 1.1;">${word.en}</span>
                <span style="font-size: clamp(10px, 1.1vw, 14px); font-weight: 700; color: #f1c40f; text-transform: uppercase; margin-top: 8px; word-break: break-word; width: 100%; text-align: center; line-height: 1.1;">${word.vi}</span>
            </div>
        `;
        
        deck.push({ text: cardHTML, matchId: word.en }); 
        deck.push({ text: cardHTML, matchId: word.en }); 
    });

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