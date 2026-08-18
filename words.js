// File: words.js

const baseWords = [
    "ELICIT", 
    "LLMs", 
    "AI", 
    "DATABASE", 
    "DATA", 
    "TRANSPARENCY", 
    "RESEARCH", 
    "ALGORITHM", 
    "SUMMARY"
];

function generateDeck() {
    let deck = [];
    
    baseWords.forEach(word => {
        deck.push({ text: word, matchId: word }); 
        deck.push({ text: word, matchId: word }); 
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

// Dòng này rất quan trọng để server.js có thể lấy được hàm
module.exports = { generateDeck };