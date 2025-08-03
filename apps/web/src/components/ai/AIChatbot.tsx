import React, { useState } from 'react';

interface AIChatbotProps {
  className?: string;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({ className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`bg-gray-900 rounded-xl p-6 ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-white text-lg font-semibold">
            AI Chatbot Stub
          </h3>
          <p className="text-gray-300 text-sm mt-1">
            Investment assistant (Right sidebar for web)
          </p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg 
            className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-300 text-sm">
              Chat interface will be implemented in Phase 1
            </div>
          </div>
          
          <div className="flex">
            <input
              type="text"
              placeholder="Ask about investments..."
              className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-lg text-white text-sm font-medium transition-colors disabled:opacity-50"
              disabled
            >
              Send
            </button>
          </div>
        </div>
      )}

      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
        >
          Open Chat
        </button>
      )}
    </div>
  );
};