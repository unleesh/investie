import React from 'react';
import type { AIEvaluation } from '@investie/types';

interface AIEvaluationCardProps {
  evaluation: AIEvaluation;
}

export const AIEvaluationCard: React.FC<AIEvaluationCardProps> = ({ evaluation }) => {
  const ratingStyles = {
    bullish: 'border-l-green-500 bg-green-50',
    bearish: 'border-l-red-500 bg-red-50',
    neutral: 'border-l-gray-500 bg-gray-50'
  };

  const ratingTextColors = {
    bullish: 'text-green-700',
    bearish: 'text-red-700',
    neutral: 'text-gray-700'
  };

  return (
    <div className={`rounded-lg p-4 border-l-4 ${ratingStyles[evaluation.rating]} my-4`}>
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-gray-900 text-sm font-semibold">AI Evaluation</h4>
        <div className="flex items-center space-x-3">
          <span className={`text-xs font-medium uppercase ${ratingTextColors[evaluation.rating]}`}>
            {evaluation.rating}
          </span>
          <span className="text-gray-500 text-xs">
            {evaluation.confidence}% confidence
          </span>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm leading-relaxed mb-3">
        {evaluation.summary}
      </p>
      
      <div className="text-gray-400 text-xs">
        <span className="font-medium">Key factors:</span> {evaluation.keyFactors.join(', ')}
      </div>
    </div>
  );
};