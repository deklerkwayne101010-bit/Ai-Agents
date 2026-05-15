import { useState, useEffect } from 'react';

const BankrollInput = ({ label, value, onChange, prefix = '$', min = 0 }) => {
  return (
    <div className="flex flex-col">
      <label className="text-gray-400 text-xs mb-1">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{prefix}</span>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 pl-7 pr-3 
                     text-white focus:outline-none focus:border-green-500 transition-colors"
        />
      </div>
    </div>
  );
};

const BankrollSection = ({ bankrollData, onChange }) => {
  const [localData, setLocalData] = useState(bankrollData);

  useEffect(() => {
    setLocalData(bankrollData);
  }, [bankrollData]);

  const updateField = (field, value) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onChange(newData);
  };

  // Calculate bankroll health
  const riskPercentage = localData.currentCall > 0 
    ? (localData.currentCall / localData.totalBankroll) * 100 
    : 0;
  
  let healthStatus = 'Safe';
  let healthColor = 'text-green-400';
  if (riskPercentage > 5) {
    healthStatus = 'Risky';
    healthColor = 'text-red-400';
  } else if (riskPercentage > 2) {
    healthStatus = 'Moderate';
    healthColor = 'text-yellow-400';
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 space-y-3">
      <h3 className="text-white font-semibold mb-2">Bankroll & Pot</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <BankrollInput
          label="Total Bankroll"
          value={localData.totalBankroll}
          onChange={(v) => updateField('totalBankroll', v)}
        />
        <BankrollInput
          label="Current Stack"
          value={localData.stackSize}
          onChange={(v) => updateField('stackSize', v)}
        />
        <BankrollInput
          label="Current Pot"
          value={localData.currentPot}
          onChange={(v) => updateField('currentPot', v)}
        />
        <BankrollInput
          label="To Call"
          value={localData.currentCall}
          onChange={(v) => updateField('currentCall', v)}
        />
      </div>

      {/* Health Indicator */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-700">
        <span className="text-gray-400 text-sm">Risk Level</span>
        <span className={`font-semibold ${healthColor}`}>{healthStatus}</span>
      </div>
    </div>
  );
};

export default BankrollSection;
