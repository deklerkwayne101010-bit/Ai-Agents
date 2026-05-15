import { motion, AnimatePresence } from 'framer-motion';
import { getAllCards, isRedSuit } from '../utils/cardUtils.js';

const CardPicker = ({ isOpen, onClose, onSelect, usedCardIds }) => {
  const allCards = getAllCards();
  const suits = ['♠', '♥', '♦', '♣'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 
                       sm:w-full sm:max-w-lg bg-gray-900 rounded-2xl shadow-2xl z-50 
                       overflow-hidden border border-gray-700"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Select a Card</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ×
              </button>
            </div>

            {/* Card Grid */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {suits.map((suit) => (
                <div key={suit} className="mb-4">
                  <div className="text-gray-400 text-sm mb-2 pl-1">{suit}</div>
                  <div className="grid grid-cols-13 gap-1">
                    {allCards
                      .filter((c) => c.suit === suit)
                      .map((card) => {
                        const isUsed = usedCardIds.has(card.id);
                        const isRed = isRedSuit(suit);

                        return (
                          <motion.button
                            key={card.id}
                            whileHover={!isUsed ? { scale: 1.15 } : {}}
                            whileTap={!isUsed ? { scale: 0.9 } : {}}
                            onClick={() => !isUsed && onSelect(card)}
                            disabled={isUsed}
                            className={`
                              aspect-[3/4] rounded-md text-xs sm:text-sm font-bold
                              flex items-center justify-center
                              transition-all duration-150
                              ${
                                isUsed
                                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                  : `${isRed ? 'bg-red-900/30 text-red-400 hover:bg-red-800/50' : 'bg-blue-900/30 text-blue-400 hover:bg-blue-800/50'} 
                                     cursor-pointer shadow-md hover:shadow-lg`
                              }
                            `}
                          >
                            {card.rank}
                          </motion.button>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CardPicker;
