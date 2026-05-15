// Strategy engine for beginner-friendly recommendations
import { getPreflopStrength, assessBoardDanger } from './oddsEngine.js';
import { evaluateHand, checkDraws } from './cardUtils.js';

export const generateStrategy = (holeCards, communityCards, numPlayers, odds, bankrollData) => {
  const { win, equity } = odds;
  const { totalBankroll, currentPot, currentCall, stackSize } = bankrollData;

  // Calculate pot odds
  const potOdds = currentPot > 0 ? (currentCall / (currentPot + currentCall)) * 100 : 0;
  
  // Get hand evaluation
  const handEval = evaluateHand(holeCards, communityCards);
  const draws = checkDraws(holeCards, communityCards);
  const preflopStrength = getPreflopStrength(holeCards);
  const boardDanger = assessBoardDanger(communityCards);

  // Determine recommended action
  let action = 'Check';
  let confidence = 50;
  let aggressionLevel = 'Passive';
  let suggestedBetSize = 0;
  let reasoning = [];

  const isPreflop = communityCards.length === 0;
  const isEarlyStreet = communityCards.length <= 2;
  const manyPlayers = numPlayers >= 6;
  const fewPlayers = numPlayers <= 3;

  // Bankroll risk assessment
  const riskPercentage = currentCall > 0 ? (currentCall / totalBankroll) * 100 : 0;
  let bankrollHealth = 'Safe';
  if (riskPercentage > 5) bankrollHealth = 'Risky';
  else if (riskPercentage > 2) bankrollHealth = 'Moderate';

  // Decision logic
  if (isPreflop) {
    // Preflop strategy
    if (preflopStrength >= 70) {
      action = 'Raise';
      confidence = 80 + (preflopStrength - 70) * 2;
      aggressionLevel = 'Aggressive';
      suggestedBetSize = Math.min(currentPot * 2.5, stackSize * 0.1);
      reasoning.push('You have a strong starting hand.');
    } else if (preflopStrength >= 45) {
      action = 'Call';
      confidence = 60;
      aggressionLevel = 'Neutral';
      suggestedBetSize = currentCall;
      reasoning.push('Your hand has decent potential.');
    } else {
      action = 'Fold';
      confidence = 70;
      aggressionLevel = 'Passive';
      reasoning.push('Consider folding weak starting hands.');
    }

    if (manyPlayers && preflopStrength < 60) {
      action = 'Fold';
      confidence += 10;
      reasoning.push('Many players increase the chance someone has a strong hand.');
    }
  } else {
    // Postflop strategy
    const hasStrongHand = handEval.strength >= 4; // Three of a kind or better
    const hasGoodDraw = draws.flushDraw || draws.straightDraw;
    const goodPotOdds = equity >= potOdds;

    if (hasStrongHand) {
      action = 'Raise';
      confidence = 75 + (handEval.strength - 4) * 5;
      aggressionLevel = 'Aggressive';
      suggestedBetSize = Math.min(currentPot * 0.75, stackSize * 0.15);
      reasoning.push(`You have ${handEval.rank.toLowerCase()}. Consider building the pot.`);
      
      if (boardDanger.level === 'High' && manyPlayers) {
        reasoning.push('This board is dangerous against multiple players.');
        confidence -= 15;
      }
    } else if (hasGoodDraw && goodPotOdds) {
      action = 'Call';
      confidence = 65;
      aggressionLevel = 'Neutral';
      suggestedBetSize = currentCall;
      reasoning.push('Your draw odds may justify a call.');
      
      if (draws.flushDraw && draws.straightDraw) {
        reasoning.push('You have a combo draw - strong potential!');
        confidence += 10;
      }
    } else if (win >= 60) {
      action = 'Raise';
      confidence = 70;
      aggressionLevel = 'Aggressive';
      suggestedBetSize = Math.min(currentPot * 0.5, stackSize * 0.1);
      reasoning.push('You likely have the strongest hand.');
    } else if (win >= 40 && goodPotOdds) {
      action = 'Call';
      confidence = 55;
      aggressionLevel = 'Neutral';
      suggestedBetSize = currentCall;
      reasoning.push('Pot odds support a call.');
    } else if (win < 30 && !hasGoodDraw) {
      action = 'Fold';
      confidence = 75;
      aggressionLevel = 'Passive';
      reasoning.push('Low equity suggests folding.');
    } else {
      action = 'Check';
      confidence = 50;
      aggressionLevel = 'Passive';
      reasoning.push('Consider checking to see a free card.');
    }

    // Adjust for player count
    if (manyPlayers && win < 50 && !hasStrongHand) {
      if (action === 'Raise') {
        action = 'Call';
        reasoning.push('Many players make bluffing risky.');
      }
    }

    if (fewPlayers && win >= 50) {
      aggressionLevel = 'Aggressive';
      reasoning.push('Fewer players means you can be more aggressive.');
    }
  }

  // Bankroll warning
  if (bankrollHealth === 'Risky') {
    reasoning.push('⚠️ Your bankroll risk is currently high.');
    if (action === 'Raise') {
      action = 'Call';
      reasoning.push('Consider reducing bet size due to bankroll risk.');
    }
  }

  // Cap confidence
  confidence = Math.min(95, Math.max(20, confidence));

  return {
    action,
    confidence: Math.round(confidence),
    aggressionLevel,
    suggestedBetSize: Math.round(suggestedBetSize * 100) / 100,
    reasoning,
    bankrollHealth,
    potOdds: Math.round(potOdds * 10) / 10,
    handRank: handEval.rank,
    preflopStrength: preflopStrength,
    boardDanger: boardDanger.level,
    hasFlushDraw: draws.flushDraw,
    hasStraightDraw: draws.straightDraw
  };
};
