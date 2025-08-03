import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface AIChatbotProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({ 
  isVisible = false, 
  onToggle 
}) => {
  return (
    <View 
      style={{
        backgroundColor: '#1f2937',
        borderRadius: 12,
        padding: 16,
        margin: 16,
        minHeight: 120,
      }}
    >
      <Text style={{ 
        color: '#f3f4f6', 
        fontSize: 16, 
        fontWeight: '600',
        marginBottom: 8 
      }}>
        AI Chatbot Stub (Modal/Bottom Sheet)
      </Text>
      
      <Text style={{ 
        color: '#d1d5db', 
        fontSize: 12, 
        marginBottom: 12 
      }}>
        Investment assistant for mobile users
      </Text>
      
      <TouchableOpacity
        onPress={onToggle}
        style={{
          backgroundColor: '#3b82f6',
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 6,
          alignSelf: 'flex-start',
        }}
      >
        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '500' }}>
          {isVisible ? 'Close Chat' : 'Open Chat'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};