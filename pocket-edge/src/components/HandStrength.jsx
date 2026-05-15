import { motion } from 'framer-motion';

const HandStrength = ({ handRank, preflopStrength, boardDanger, hasFlushDraw, hasStraightDraw }) => {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
      <h3 className="text-white font-semibold mb-3">Hand Analysis</h3>
      
      <div className="space-y-3">
        {/* Current Hand Rank */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Current Hand</span>
          <motion.span
            key={handRank}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-green-400 font-semibold"
          >
            {handRank}
          </motion.span>
        </div>

        {/* Preflop Strength */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-400 text-sm">Starting Strength</span>
            <span className="text-white text-sm">{preflopStrength}%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${preflopStrength}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full rounded-full ${
                preflopStrength >= 70 ? 'bg-green-500' :
                preflopStrength >= 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
            />
          </div>
        </div>

        {/* Board Danger */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Board Danger</span>
          <span className={`font-semibold ${
            boardDanger === 'High' ? 'text-red-400' :
            boardDanger === 'Medium' ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {boardDanger}
          </span>
        </div>

        {/* Draws */}
        <div className="flex gap-2 pt-2 border-t border-gray-700">
          {hasFlushDraw && (
            <span className="px-2 py-1 bg-blue-900/50 text-blue-400 text-xs rounded-full border border-blue-700">
              Flush Draw
            </span>
          )}
          {hasStraightDraw && (
            <span className="px-2 py-1 bg-purple-900/50 text-purple-400 text-xs rounded-full border border-purple-700">
              Straight Draw
            </span>
          )}
          {!hasFlushDraw && !hasStraightDraw && (
            <span className="text-gray-500 text-xs">No strong draws</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default HandStrength;
