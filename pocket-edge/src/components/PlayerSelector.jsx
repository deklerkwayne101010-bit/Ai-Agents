import { motion } from 'framer-motion';

const PlayerSelector = ({ numPlayers, onChange }) => {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <label className="text-gray-300 font-medium">Number of Players</label>
        <span className="text-green-400 font-bold text-lg">{numPlayers}</span>
      </div>
      
      <input
        type="range"
        min="2"
        max="10"
        value={numPlayers}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
      />
      
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>2</span>
        <span>6</span>
        <span>10</span>
      </div>
    </div>
  );
};

export default PlayerSelector;
