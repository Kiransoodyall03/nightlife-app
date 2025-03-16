// GradientView.tsx
import React from 'react';
import { View, Platform, StyleProp, ViewStyle } from 'react-native';

interface GradientProps {
  colors: string[];
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  locations?: number[];
}

const GradientView: React.FC<GradientProps> = ({ colors, style, children, start, end, locations }) => {
  if (Platform.OS === 'web') {
    // Web implementation with CSS gradient
    return (
      <View
        style={[
          style,
          {
            backgroundImage: `linear-gradient(to bottom, ${colors.join(', ')})`,
          } as any,
        ]}
      >
        {children}
      </View>
    );
  } else {
    // Import dynamically to avoid import errors
    const LinearGradient = require('react-native-linear-gradient').default;
    return (
      <LinearGradient
        colors={colors}
        style={style}
        start={start || { x: 0, y: 0 }}
        end={end || { x: 0, y: 2 }}
        locations={locations}
      >
        {children}
      </LinearGradient>
    );
  }
};

export default GradientView;