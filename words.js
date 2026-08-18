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
        // - Thay thế word-break bằng white-space: nowrap để tuyệt đối CẤM XUỐNG DÒNG.
        // - Giảm max font-size của tiếng Anh xuống 18px để các từ dài như TRANSPARENCY luôn nằm lọt lòng.
        // - Xóa bỏ mã màu #f1c40f, thay bằng opacity: 0.75 để màu tự ăn theo mặt trước/sau của thẻ.
        const cardHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; overflow: hidden;">
                <span style="font-size: clamp(11px, 1.5vw, 18px); font-weight: 900; white-space: nowrap; letter-spacing: -0.5px; width: 100%; text-align: center;">${word.en}</span>
                <span style="font-size: clamp(9px, 1.1vw, 12px); font-weight: 700; opacity: 0.75; text-transform: uppercase; margin-top: 5px; white-space: nowrap; width: 100%; text-align: center;">${word.vi}</span>
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