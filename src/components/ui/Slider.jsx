import React from 'react';

// Custom Slider component with proper contrast for dark theme
const Slider = ({ 
  min = 0, 
  max = 100, 
  step = 1, 
  value, 
  onChange, 
  className = '',
  ...props 
}) => {
  // Handle slider change
  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    onChange?.(newValue);
  };

  // Calculate fill percentage
  const fillPercentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`relative ${className}`}>
      {/* Background track */}
      <div className="w-full h-1 bg-bg-40 rounded-lg relative">
        {/* Fill track */}
        <div 
          className="h-full bg-fg-70 rounded-lg transition-all duration-150"
          style={{ width: `${fillPercentage}%` }}
        />
      </div>
      
      {/* Slider input */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="absolute top-0 w-full h-1 appearance-none cursor-pointer slider-custom bg-transparent"
        {...props}
      />
      <style jsx>{`
        .slider-custom::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: var(--fg-60);
          cursor: pointer;
          border: 2px solid var(--bg-60);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider-custom::-webkit-slider-thumb:hover {
          background: var(--fg-50);
          transform: scale(1.1);
        }
        
        .slider-custom::-webkit-slider-thumb:active {
          background: var(--fg-40);
          transform: scale(1.2);
        }
        
        .slider-custom::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: var(--fg-50);
          cursor: pointer;
          border: 2px solid var(--bg-60);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider-custom::-moz-range-thumb:hover {
          background: var(--fg-40);
          transform: scale(1.1);
        }
        
        .slider-custom::-moz-range-thumb:active {
          background: var(--fg-30);
          transform: scale(1.2);
        }
        
        .slider-custom::-webkit-slider-track {
          height: 4px;
          background: transparent;
          border-radius: 2px;
        }
        
        .slider-custom::-moz-range-track {
          height: 4px;
          background: transparent;
          border-radius: 2px;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default Slider;