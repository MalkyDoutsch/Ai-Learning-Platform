import React from 'react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const alertStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconMap = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <div className={`border rounded-lg p-4 mb-4 flex items-center justify-between ${alertStyles[type]}`}>
      <div className="flex items-center space-x-2">
        <span className="text-lg">{iconMap[type]}</span>
        <span className="font-medium">{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 ml-4"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;