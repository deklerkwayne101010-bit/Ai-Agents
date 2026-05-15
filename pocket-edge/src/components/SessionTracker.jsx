import { motion } from 'framer-motion';

const SessionTracker = ({ stats, onReset }) => {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold">Session Stats</h3>
        <button
          onClick={onReset}
          className="text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          Reset All
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-900/50 rounded-lg p-2">
          <div className="text-2xl font-bold text-white">{stats.handsAnalyzed}</div>
          <div className="text-xs text-gray-500">Hands</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-2">
          <div className="text-2xl font-bold text-green-400">{stats.avgEquity}%</div>
          <div className="text-xs text-gray-500">Avg Equity</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-2">
          <div className="text-2xl font-bold text-blue-400">{stats.biggestEdge}%</div>
          <div className="text-xs text-gray-500">Best Edge</div>
        </div>
      </div>
    </div>
  );
};

export default SessionTracker;
