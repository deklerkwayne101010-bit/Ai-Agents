// Card utilities for poker hand evaluation
export const SUITS = ['♠', '♥', '♦', '♣'];
export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const getRankValue = (rank) => {
  const values = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };
  return values[rank];
};

export const createCard = (suit, rank) => ({ suit, rank, id: `${rank}${suit}` });

export const getAllCards = () => {
  const cards = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push(createCard(suit, rank));
    }
  }
  return cards;
};

export const isRedSuit = (suit) => suit === '♥' || suit === '♦';

// Hand evaluation
export const evaluateHand = (holeCards, communityCards) => {
  const allCards = [...holeCards, ...communityCards];
  if (allCards.length < 2) return { rank: 'High Card', strength: 0 };

  const ranks = allCards.map(c => getRankValue(c.rank)).sort((a, b) => b - a);
  const suits = allCards.map(c => c.suit);

  // Count rank frequencies
  const rankCounts = {};
  ranks.forEach(r => { rankCounts[r] = (rankCounts[r] || 0) + 1; });
  
  // Count suit frequencies
  const suitCounts = {};
  suits.forEach(s => { suitCounts[s] = (suitCounts[s] || 0) + 1; });

  const hasFlush = Object.values(suitCounts).some(count => count >= 5);
  
  // Check for straight
  const uniqueRanks = [...new Set(ranks)].sort((a, b) => a - b);
  let hasStraight = false;
  let straightCount = 0;
  for (let i = 1; i < uniqueRanks.length; i++) {
    if (uniqueRanks[i] === uniqueRanks[i - 1] + 1) {
      straightCount++;
      if (straightCount >= 4) hasStraight = true;
    } else {
      straightCount = 0;
    }
  }
  // Check A-2-3-4-5 straight
  if (uniqueRanks.includes(14) && uniqueRanks.includes(2) && uniqueRanks.includes(3) && 
      uniqueRanks.includes(4) && uniqueRanks.includes(5)) {
    hasStraight = true;
  }

  const fourOfAKind = Object.values(rankCounts).includes(4);
  const threeOfAKind = Object.values(rankCounts).includes(3);
  const pairs = Object.values(rankCounts).filter(count => count === 2).length;

  // Determine hand rank
  if (hasFlush && hasStraight) return { rank: 'Straight Flush', strength: 9 };
  if (fourOfAKind) return { rank: 'Four of a Kind', strength: 8 };
  if (threeOfAKind && pairs >= 1) return { rank: 'Full House', strength: 7 };
  if (hasFlush) return { rank: 'Flush', strength: 6 };
  if (hasStraight) return { rank: 'Straight', strength: 5 };
  if (threeOfAKind) return { rank: 'Three of a Kind', strength: 4 };
  if (pairs >= 2) return { rank: 'Two Pair', strength: 3 };
  if (pairs === 1) return { rank: 'Pair', strength: 2 };
  return { rank: 'High Card', strength: 1 };
};

// Check for draws
export const checkDraws = (holeCards, communityCards) => {
  const allCards = [...holeCards, ...communityCards];
  if (allCards.length < 3) return { flushDraw: false, straightDraw: false };

  const suits = allCards.map(c => c.suit);
  const suitCounts = {};
  suits.forEach(s => { suitCounts[s] = (suitCounts[s] || 0) + 1; });
  
  const flushDraw = Object.values(suitCounts).some(count => count >= 4);

  const ranks = allCards.map(c => getRankValue(c.rank)).sort((a, b) => a - b);
  const uniqueRanks = [...new Set(ranks)];
  let consecutive = 0;
  for (let i = 1; i < uniqueRanks.length; i++) {
    if (uniqueRanks[i] === uniqueRanks[i - 1] + 1) {
      consecutive++;
    } else {
      consecutive = 0;
    }
  }
  const straightDraw = consecutive >= 2;

  return { flushDraw, straightDraw };
};
