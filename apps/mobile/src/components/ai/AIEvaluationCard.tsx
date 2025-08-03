import React from 'react';
import { View, Text } from 'react-native';
import type { AIEvaluation } from '@investie/types';

interface AIEvaluationCardProps {
  evaluation: AIEvaluation;
}

export const AIEvaluationCard: React.FC<AIEvaluationCardProps> = ({ evaluation }) => {
  const ratingColor = evaluation.rating === 'bullish' ? '#22c55e' : 
                     evaluation.rating === 'bearish' ? '#ef4444' : 
                     '#6b7280';

  return (
    <View 
      style={{
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        padding: 12,
        marginVertical: 8,
        borderLeftWidth: 4,
        borderLeftColor: ratingColor,
      }}
    >
      <Text style={{ 
        color: '#1f2937', 
        fontSize: 14, 
        fontWeight: '600',
        marginBottom: 6 
      }}>
        AI Evaluation Stub
      </Text>
      
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        marginBottom: 8 
      }}>
        <Text style={{ 
          color: ratingColor, 
          fontSize: 12, 
          fontWeight: '500',
          textTransform: 'uppercase'
        }}>
          {evaluation.rating}
        </Text>
        <Text style={{ color: '#6b7280', fontSize: 12 }}>
          {evaluation.confidence}% confidence
        </Text>
      </View>
      
      <Text style={{ 
        color: '#4b5563', 
        fontSize: 12, 
        lineHeight: 16,
        marginBottom: 8
      }}>
        {evaluation.summary}
      </Text>
      
      <Text style={{ color: '#9ca3af', fontSize: 10 }}>
        Key factors: {evaluation.keyFactors.join(', ')}
      </Text>
    </View>
  );
};