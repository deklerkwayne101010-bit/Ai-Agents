import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Card from './components/Card.jsx';
import CardPicker from './components/CardPicker.jsx';
import OddsRing from './components/OddsRing.jsx';
import ActionPanel from './components/ActionPanel.jsx';
import PlayerSelector from './components/PlayerSelector.jsx';
import BankrollSection from './components/BankrollSection.jsx';
import HandStrength from './components/HandStrength.jsx';
import SessionTracker from './components/SessionTracker.jsx';
import { runMonteCarloSimulation } from './utils/oddsEngine.js';
import { generateStrategy } from './utils/strategyEngine.js';
import { getAllCards } from './utils/cardUtils.js';

const defaultBankrollData = {
  totalBankroll: 1000,
  stackSize: 100,
  currentPot: 50,
  currentCall: 10
};

const defaultStats = {
  handsAnalyzed: 0,
  avgEquity: 0,
  biggestEdge: 0
};

function App() {
  // State
  const [holeCards, setHoleCards] = useState([]);
  const [communityCards, setCommunityCards] = useState([]);
  const [numPlayers, setNumPlayers] = useState(6);
  const [bankrollData, setBankrollData] = useState(defaultBankrollData);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState(null); // 'hole-0', 'hole-1', 'community-0', etc.
  const [odds, setOdds] = useState({ win: 0, tie: 0, loss: 0, equity: 0 });
  const [strategy, setStrategy] = useState(null);
  const [stats, setStats] = useState(defaultStats);
  const [isCalculating, setIsCalculating] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('pocketEdgeState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.holeCards) setHoleCards(parsed.holeCards);
        if (parsed.communityCards) setCommunityCards(parsed.communityCards);
        if (parsed.numPlayers) setNumPlayers(parsed.numPlayers);
        if (parsed.bankrollData) setBankrollData(parsed.bankrollData);
        if (parsed.stats) setStats(parsed.stats);
      } catch (e) {
        console.error('Failed to load saved state');
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    const state = { holeCards, communityCards, numPlayers, bankrollData, stats };
    localStorage.setItem('pocketEdgeState', JSON.stringify(state));
  }, [holeCards, communityCards, numPlayers, bankrollData, stats]);

  // Get all used card IDs
  const getUsedCardIds = useCallback(() => {
    const ids = new Set();
    holeCards.forEach(c => ids.add(c.id));
    communityCards.forEach(c => ids.add(c.id));
    return ids;
  }, [holeCards, communityCards]);

  // Handle card selection
  const handleCardSelect = (card) => {
    if (!pickerTarget) return;

    const [type, index] = pickerTarget.split('-');
    const idx = parseInt(index);

    if (type === 'hole') {
      const newCards = [...holeCards];
      newCards[idx] = card;
      setHoleCards(newCards);
    } else if (type === 'community') {
      const newCards = [...communityCards];
      newCards[idx] = card;
      setCommunityCards(newCards);
    }

    setPickerOpen(false);
    setPickerTarget(null);
  };

  const openPicker = (target) => {
    setPickerTarget(target);
    setPickerOpen(true);
  };

  const removeCard = (target) => {
    const [type, index] = target.split('-');
    const idx = parseInt(index);

    if (type === 'hole') {
      const newCards = holeCards.filter((_, i) => i !== idx);
      setHoleCards(newCards);
    } else if (type === 'community') {
      const newCards = communityCards.filter((_, i) => i !== idx);
      setCommunityCards(newCards);
    }
  };

  // Calculate odds and strategy
  useEffect(() => {
    if (holeCards.length < 2) {
      setOdds({ win: 0, tie: 0, loss: 0, equity: 0 });
      setStrategy(null);
      return;
    }

    setIsCalculating(true);

    // Use setTimeout to allow UI to update before heavy calculation
    const timer = setTimeout(() => {
      const calculatedOdds = runMonteCarloSimulation(holeCards, communityCards, numPlayers);
      setOdds(calculatedOdds);

      const newStrategy = generateStrategy(holeCards, communityCards, numPlayers, calculatedOdds, bankrollData);
      setStrategy(newStrategy);

      // Update stats
      setStats(prev => ({
        handsAnalyzed: prev.handsAnalyzed + 1,
        avgEquity: Math.round((prev.avgEquity * prev.handsAnalyzed + calculatedOdds.equity) / (prev.handsAnalyzed + 1)),
        biggestEdge: Math.max(prev.biggestEdge, calculatedOdds.equity)
      }));

      setIsCalculating(false);
    }, 50);

    return () => clearTimeout(timer);
  }, [holeCards, communityCards, numPlayers, bankrollData]);

  // Reset all
  const handleReset = () => {
    setHoleCards([]);
    setCommunityCards([]);
    setNumPlayers(6);
    setBankrollData(defaultBankrollData);
    setStats(defaultStats);
    localStorage.removeItem('pocketEdgeState');
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                PocketEdge
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">Poker Probability Trainer</p>
            </div>
            <button
              onClick={handleReset}
              className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Card Inputs */}
          <div className="space-y-6">
            {/* Hole Cards */}
            <section className="bg-gray-800/30 rounded-2xl p-4 sm:p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-gray-300">Your Hand</h2>
              <div className="flex gap-4 justify-center">
                {[0, 1].map((i) => (
                  <div key={i} className="relative group">
                    <Card
                      card={holeCards[i]}
                      placeholder={!holeCards[i]}
                      onClick={() => openPicker(`hole-${i}`)}
                      disabled={false}
                    />
                    {holeCards[i] && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeCard(`hole-${i}`); }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full 
                                   flex items-center justify-center text-white opacity-0 group-hover:opacity-100
                                   transition-opacity hover:bg-red-500"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Community Cards */}
            <section className="bg-gray-800/30 rounded-2xl p-4 sm:p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-gray-300">Community Cards</h2>
              <div className="flex gap-2 sm:gap-3 justify-center flex-wrap">
                {['Flop 1', 'Flop 2', 'Flop 3', 'Turn', 'River'].map((label, i) => (
                  <div key={i} className="relative group">
                    <Card
                      card={communityCards[i]}
                      placeholder={!communityCards[i]}
                      onClick={() => openPicker(`community-${i}`)}
                      disabled={false}
                      small
                    />
                    {communityCards[i] && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeCard(`community-${i}`); }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full 
                                   flex items-center justify-center text-white opacity-0 group-hover:opacity-100
                                   transition-opacity hover:bg-red-500 text-xs"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Player Selector */}
            <PlayerSelector numPlayers={numPlayers} onChange={setNumPlayers} />

            {/* Bankroll Section */}
            <BankrollSection bankrollData={bankrollData} onChange={setBankrollData} />
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* Odds Display */}
            <section className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-center text-gray-300">Win Probability</h2>
              <div className="flex justify-center">
                {holeCards.length >= 2 ? (
                  <OddsRing winPercentage={odds.win} />
                ) : (
                  <div className="text-gray-500 text-center py-8">
                    Select your hole cards to see odds
                  </div>
                )}
              </div>
              
              {holeCards.length >= 2 && (
                <div className="grid grid-cols-3 gap-4 mt-6 text-center">
                  <div>
                    <div className="text-green-400 text-2xl font-bold">{odds.win}%</div>
                    <div className="text-gray-500 text-xs">Win</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-2xl font-bold">{odds.tie}%</div>
                    <div className="text-gray-500 text-xs">Tie</div>
                  </div>
                  <div>
                    <div className="text-red-400 text-2xl font-bold">{odds.loss}%</div>
                    <div className="text-gray-500 text-xs">Loss</div>
                  </div>
                </div>
              )}
            </section>

            {/* Strategy Panel */}
            {strategy && holeCards.length >= 2 && (
              <ActionPanel
                action={strategy.action}
                confidence={strategy.confidence}
                reasoning={strategy.reasoning}
              />
            )}

            {/* Hand Strength */}
            {strategy && (
              <HandStrength
                handRank={strategy.handRank}
                preflopStrength={strategy.preflopStrength}
                boardDanger={strategy.boardDanger}
                hasFlushDraw={strategy.hasFlushDraw}
                hasStraightDraw={strategy.hasStraightDraw}
              />
            )}

            {/* Session Stats */}
            <SessionTracker stats={stats} onReset={handleReset} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Educational poker probability training tool only.</p>
          <p className="mt-1 text-xs">Not for real-money gambling. No automation or cheating features.</p>
        </div>
      </footer>

      {/* Card Picker Modal */}
      <CardPicker
        isOpen={pickerOpen}
        onClose={() => { setPickerOpen(false); setPickerTarget(null); }}
        onSelect={handleCardSelect}
        usedCardIds={getUsedCardIds()}
      />
    </div>
  );
}

export default App;
