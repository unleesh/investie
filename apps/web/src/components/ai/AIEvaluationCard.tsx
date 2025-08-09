import React from 'react';
import type { AIEvaluation } from '@investie/types';

interface AIEvaluationCardProps {
  evaluation: AIEvaluation;
  isLoading?: boolean;
}

export const AIEvaluationCard: React.FC<AIEvaluationCardProps> = ({ evaluation, isLoading = false }) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-lg p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 my-4">
        <div className="animate-pulse">
          <div className="flex justify-between items-start mb-4">
            <div className="h-5 bg-blue-200 rounded w-24"></div>
            <div className="flex space-x-2">
              <div className="h-4 bg-blue-200 rounded w-16"></div>
              <div className="h-4 bg-blue-200 rounded w-20"></div>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-blue-200 rounded w-full"></div>
            <div className="h-4 bg-blue-200 rounded w-5/6"></div>
            <div className="h-4 bg-blue-200 rounded w-4/6"></div>
          </div>
          <div className="h-3 bg-blue-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  // Rating configurations
  const ratingConfig = {
    bullish: {
      bgGradient: 'bg-gradient-to-r from-green-50 to-emerald-50',
      border: 'border-green-200',
      leftBorder: 'border-l-green-500',
      textColor: 'text-green-700',
      badgeColor: 'bg-green-100 text-green-800',
      icon: '📈'
    },
    bearish: {
      bgGradient: 'bg-gradient-to-r from-red-50 to-rose-50',
      border: 'border-red-200',
      leftBorder: 'border-l-red-500',
      textColor: 'text-red-700',
      badgeColor: 'bg-red-100 text-red-800',
      icon: '📉'
    },
    neutral: {
      bgGradient: 'bg-gradient-to-r from-gray-50 to-slate-50',
      border: 'border-gray-200',
      leftBorder: 'border-l-gray-500',
      textColor: 'text-gray-700',
      badgeColor: 'bg-gray-100 text-gray-800',
      icon: '📊'
    }
  };

  const config = ratingConfig[evaluation.rating];
  
  // Confidence level description
  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 80) return { label: 'High', color: 'text-green-600' };
    if (confidence >= 60) return { label: 'Medium', color: 'text-yellow-600' };
    return { label: 'Low', color: 'text-red-600' };
  };

  const confidenceLevel = getConfidenceLevel(evaluation.confidence);

  return (
    <div className={`rounded-lg p-6 border-l-4 ${config.bgGradient} ${config.border} ${config.leftBorder} my-6 shadow-sm`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{config.icon}</span>
          <h4 className="text-gray-900 text-lg font-semibold">AI Analysis</h4>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${config.badgeColor}`}>
            {evaluation.rating}
          </span>
          <div className="text-right">
            <div className={`text-sm font-semibold ${confidenceLevel.color}`}>
              {evaluation.confidence}%
            </div>
            <div className="text-xs text-gray-500">
              {confidenceLevel.label} confidence
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Summary */}
      <div className="mb-5">
        <p className={`text-sm leading-relaxed ${config.textColor}`}>
          {evaluation.summary}
        </p>
      </div>

      {/* Key Factors */}
      <div className="mb-4">
        <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
          Key Factors
        </h5>
        <div className="flex flex-wrap gap-2">
          {evaluation.keyFactors.map((factor, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-md bg-white border text-xs text-gray-700 shadow-sm"
            >
              {factor}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-white/50">
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <span>Timeframe: {evaluation.timeframe}</span>
          <span>•</span>
          <span>Source: {evaluation.source}</span>
        </div>
        <div className="text-xs text-gray-400">
          Updated: {new Date(evaluation.lastUpdated).toLocaleDateString()}
        </div>
      </div>

      {/* Confidence Progress Bar */}
      <div className="mt-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">Analysis Confidence</span>
          <span className="text-xs font-medium text-gray-700">{evaluation.confidence}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full transition-all duration-300 ${
              evaluation.confidence >= 80 ? 'bg-green-500' :
              evaluation.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, evaluation.confidence))}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};