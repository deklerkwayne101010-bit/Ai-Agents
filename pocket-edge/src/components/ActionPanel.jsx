import { motion } from 'framer-motion';

const ActionPanel = ({ action, confidence, reasoning }) => {
  const getActionColor = (action) => {
    switch (action.toLowerCase()) {
      case 'raise': return 'bg-green-600 hover:bg-green-500';
      case 'call': return 'bg-blue-600 hover:bg-blue-500';
      case 'check': return 'bg-gray-600 hover:bg-gray-500';
      case 'fold': return 'bg-red-600 hover:bg-red-500';
      default: return 'bg-gray-600';
    }
  };

  const getActionGlow = (action) => {
    switch (action.toLowerCase()) {
      case 'raise': return 'shadow-green-500/30';
      case 'call': return 'shadow-blue-500/30';
      case 'check': return 'shadow-gray-500/30';
      case 'fold': return 'shadow-red-500/30';
      default: return 'shadow-gray-500/30';
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700"
    >
      {/* Main Action */}
      <div className="text-center mb-6">
        <span className="text-gray-400 text-sm uppercase tracking-wider">Recommended Action</span>
        <motion.div
          key={action}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`
            ${getActionColor(action)} ${getActionGlow(action)}
            text-white text-3xl sm:text-4xl font-bold py-4 px-8 rounded-xl mt-3
            shadow-lg inline-block min-w-[200px]
          `}
        >
          {action}
        </motion.div>
      </div>

      {/* Confidence Meter */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400 text-sm">Confidence</span>
          <span className="text-white font-semibold">{confidence}%</span>
        </div>
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              confidence >= 70 ? 'bg-green-500' :
              confidence >= 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
          />
        </div>
      </div>

      {/* Reasoning */}
      {reasoning.length > 0 && (
        <div className="space-y-2">
          {reasoning.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-2 text-sm text-gray-300"
            >
              <span className="text-green-400 mt-0.5">•</span>
              <span>{reason}</span>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ActionPanel;
