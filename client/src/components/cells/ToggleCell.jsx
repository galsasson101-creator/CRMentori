import React from 'react';

export default function ToggleCell({ value, onChange }) {
  const isOn = Boolean(value);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      onClick={() => onChange && onChange(!isOn)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
        isOn ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
      } ${onChange ? 'cursor-pointer' : 'cursor-default opacity-70'}`}
      disabled={!onChange}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          isOn ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}
