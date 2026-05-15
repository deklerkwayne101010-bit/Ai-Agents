import { motion } from 'framer-motion';

const OddsRing = ({ winPercentage, size = 180 }) => {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (winPercentage / 100) * circumference;

  // Color based on percentage
  const getColor = (pct) => {
    if (pct >= 60) return '#22C55E'; // Green
    if (pct >= 40) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1F2937"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(winPercentage)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 6px ${getColor(winPercentage)}66)`
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={winPercentage}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-4xl sm:text-5xl font-bold text-white"
        >
          {winPercentage.toFixed(1)}%
        </motion.span>
        <span className="text-gray-400 text-sm mt-1">Win Rate</span>
      </div>
    </div>
  );
};

export default OddsRing;
