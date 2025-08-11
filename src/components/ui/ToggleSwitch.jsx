import React from 'react';

/**
 * A reusable toggle switch component
 * @param {Object} props - Component props
 * @param {boolean} props.checked - Whether the toggle is checked/active
 * @param {function(boolean): void} props.onChange - Callback function when toggle state changes
 * @param {string} [props.label] - Optional label to display next to the toggle
 * @param {'left'|'right'} [props.labelPosition='right'] - Position of the label ('left' or 'right')
 * @param {string} [props.className] - Additional CSS classes for the container
 * @returns {JSX.Element} ToggleSwitch component
 */
const ToggleSwitch = ({ 
  checked, 
  onChange, 
  label, 
  labelPosition = 'right',
  className = '' 
}) => {
  // Generate a unique ID for accessibility
  const id = `toggle-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex items-center ${className}`}>
      {label && labelPosition === 'left' && (
        <label 
          htmlFor={id} 
          className="mr-2 text-sm text-fg-50 cursor-pointer"
        >
          {label}
        </label>
      )}
      
      <button
        type="button"
        id={id}
        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ac-02 ${
          checked ? 'bg-ac-02' : 'bg-bg-40'
        }`}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
      >
        <span className="sr-only">Toggle {label || 'switch'}</span>
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      
      {label && labelPosition === 'right' && (
        <label 
          htmlFor={id} 
          className="ml-2 text-sm text-fg-50 cursor-pointer"
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default ToggleSwitch;
