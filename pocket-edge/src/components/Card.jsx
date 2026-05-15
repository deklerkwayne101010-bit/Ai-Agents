import { motion } from 'framer-motion';
import { isRedSuit } from '../utils/cardUtils.js';

const Card = ({ card, onClick, disabled, placeholder, small }) => {
  if (placeholder) {
    return (
      <motion.div
        whileHover={!disabled ? { scale: 1.05 } : {}}
        onClick={onClick}
        className={`
          ${small ? 'w-12 h-16 text-sm' : 'w-16 h-24 sm:w-20 sm:h-28'} 
          rounded-lg border-2 border-dashed border-gray-600 
          bg-gray-800/30 flex items-center justify-center cursor-pointer
          hover:border-green-500 hover:bg-gray-700/30 transition-colors
        `}
      >
        <span className="text-gray-500 text-2xl">+</span>
      </motion.div>
    );
  }

  const isRed = isRedSuit(card.suit);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={!disabled ? { scale: 1.08, y: -5 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={!disabled ? onClick : undefined}
      className={`
        ${small ? 'w-12 h-16 text-sm' : 'w-16 h-24 sm:w-20 sm:h-28'} 
        rounded-lg bg-gradient-to-br from-white to-gray-100 
        shadow-lg flex flex-col items-center justify-center cursor-pointer
        select-none relative overflow-hidden
        ${disabled ? 'opacity-50 grayscale' : ''}
      `}
    >
      <div className={`absolute inset-0 bg-gradient-to-br from-transparent to-black/5`} />
      <span className={`text-xl sm:text-2xl font-bold z-10 ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
        {card.rank}
      </span>
      <span className={`text-2xl sm:text-3xl z-10 ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
        {card.suit}
      </span>
    </motion.div>
  );
};

export default Card;
