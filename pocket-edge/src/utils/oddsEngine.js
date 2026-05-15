// Monte Carlo simulation for poker odds calculation
import { getAllCards, getRankValue, evaluateHand } from './cardUtils.js';

export const runMonteCarloSimulation = (holeCards, communityCards, numPlayers, simulations = 5000) => {
  if (holeCards.length < 2) {
    return { win: 0, tie: 0, loss: 0, equity: 0 };
  }

  const allCards = getAllCards();
  const usedCardIds = new Set([
    ...holeCards.map(c => c.id),
    ...communityCards.map(c => c.id)
  ]);

  const availableCards = allCards.filter(c => !usedCardIds.has(c.id));

  let wins = 0;
  let ties = 0;

  for (let i = 0; i < simulations; i++) {
    // Shuffle available cards
    const shuffled = [...availableCards];
    for (let j = shuffled.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
    }

    // Deal remaining community cards if needed
    let simCommunityCards = [...communityCards];
    const cardsNeeded = 5 - communityCards.length;
    for (let j = 0; j < cardsNeeded && shuffled.length > 0; j++) {
      simCommunityCards.push(shuffled.pop());
    }

    // Evaluate player hand
    const playerHand = evaluateHand(holeCards, simCommunityCards);

    // Deal opponent hands and evaluate
    let playerWins = true;
    let isTie = false;

    for (let p = 0; p < numPlayers - 1; p++) {
      if (shuffled.length < 2) break;
      
      const oppHoleCards = [shuffled.pop(), shuffled.pop()];
      const oppHand = evaluateHand(oppHoleCards, simCommunityCards);

      if (oppHand.strength > playerHand.strength) {
        playerWins = false;
        break;
      } else if (oppHand.strength === playerHand.strength) {
        // Compare high cards for ties
        const playerRanks = [...holeCards, ...simCommunityCards]
          .map(c => getRankValue(c.rank))
          .sort((a, b) => b - a);
        const oppRanks = [...oppHoleCards, ...simCommunityCards]
          .map(c => getRankValue(c.rank))
          .sort((a, b) => b - a);

        for (let r = 0; r < Math.min(playerRanks.length, oppRanks.length); r++) {
          if (oppRanks[r] > playerRanks[r]) {
            playerWins = false;
            break;
          } else if (oppRanks[r] < playerRanks[r]) {
            break;
          }
        }
        
        if (playerWins && oppHand.strength === playerHand.strength) {
          isTie = true;
        }
      }
    }

    if (playerWins && !isTie) {
      wins++;
    } else if (isTie) {
      ties++;
    }
  }

  const winPercent = (wins / simulations) * 100;
  const tiePercent = (ties / simulations) * 100;
  const lossPercent = 100 - winPercent - tiePercent;
  const equity = winPercent + (tiePercent / 2);

  return {
    win: Math.round(winPercent * 10) / 10,
    tie: Math.round(tiePercent * 10) / 10,
    loss: Math.round(lossPercent * 10) / 10,
    equity: Math.round(equity * 10) / 10
  };
};

// Preflop hand strength estimation
export const getPreflopStrength = (holeCards) => {
  if (holeCards.length !== 2) return 0;

  const [card1, card2] = holeCards;
  const v1 = getRankValue(card1.rank);
  const v2 = getRankValue(card2.rank);
  
  const highCard = Math.max(v1, v2);
  const lowCard = Math.min(v1, v2);
  const isPair = v1 === v2;
  const isSuited = card1.suit === card2.suit;
  const isConnected = Math.abs(v1 - v2) === 1;
  const oneGap = Math.abs(v1 - v2) === 2;

  let strength = 0;

  // Pair strength
  if (isPair) {
    strength = 50 + (highCard / 14) * 50;
  } else {
    // High card strength
    strength = (highCard / 14) * 30;
    
    // Suited bonus
    if (isSuited) strength += 10;
    
    // Connected cards bonus
    if (isConnected) strength += 15;
    else if (oneGap) strength += 10;
    
    // Both cards above 10
    if (lowCard >= 10) strength += 15;
  }

  return Math.min(100, Math.round(strength));
};

// Board danger assessment
export const assessBoardDanger = (communityCards) => {
  if (communityCards.length === 0) return { level: 'Low', score: 0 };

  const ranks = communityCards.map(c => getRankValue(c.rank));
  const suits = communityCards.map(c => c.suit);

  const suitCounts = {};
  suits.forEach(s => { suitCounts[s] = (suitCounts[s] || 0) + 1; });
  
  const rankCounts = {};
  ranks.forEach(r => { rankCounts[r] = (rankCounts[r] || 0) + 1; });

  let dangerScore = 0;

  // Flush potential
  const maxSuitCount = Math.max(...Object.values(suitCounts));
  if (maxSuitCount >= 3) dangerScore += 20;
  if (maxSuitCount >= 4) dangerScore += 30;

  // Straight potential
  const uniqueRanks = [...new Set(ranks)].sort((a, b) => a - b);
  let consecutive = 0;
  for (let i = 1; i < uniqueRanks.length; i++) {
    if (uniqueRanks[i] === uniqueRanks[i - 1] + 1) {
      consecutive++;
    } else {
      consecutive = 0;
    }
  }
  if (consecutive >= 2) dangerScore += 20;
  if (consecutive >= 3) dangerScore += 30;

  // Paired board
  if (Object.values(rankCounts).some(c => c >= 2)) {
    dangerScore += 15;
  }

  // High cards on board
  const highCards = ranks.filter(r => r >= 12).length;
  dangerScore += highCards * 5;

  let level = 'Low';
  if (dangerScore >= 50) level = 'High';
  else if (dangerScore >= 25) level = 'Medium';

  return { level, score: Math.min(100, dangerScore) };
};
