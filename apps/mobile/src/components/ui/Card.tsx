import React from 'react';
import { View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  return (
    <View 
      style={[
        {
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 16,
          marginVertical: 8,
          marginHorizontal: 16,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3, // Android shadow
        },
        style
      ]}
    >
      {children}
    </View>
  );
};