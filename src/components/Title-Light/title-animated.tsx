import React from 'react';
import { Text, View, StyleSheet, Dimensions } from 'react-native';

interface TitleComponentProps {
  text: string;
}
const { width, height } = Dimensions.get('window');
var paddingVertical = height * 0.025;

const TitleComponent: React.FC<TitleComponentProps> = ({ text }) => {
  const calculateColor = (index: number, totalLength: number): string => {
    const startColor = [255, 255, 255]; // White
    const endColor = [0, 122, 255]; // Blue

    const r = Math.round(startColor[0] + ((endColor[0] - startColor[0]) * index) / (totalLength - 1));
    const g = Math.round(startColor[1] + ((endColor[1] - startColor[1]) * index) / (totalLength - 1));
    const b = Math.round(startColor[2] + ((endColor[2] - startColor[2]) * index) / (totalLength - 1));

    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <View style={styles.container}>
      {text.split('').map((char, index) => (
        <Text key={index} style={[styles.char, { color: calculateColor(index, text.length) }]}>
          {char}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: height * 0.035, // Increased from 0.025
    minHeight: 50, // Ensure minimum touch area
  },
  char: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 34, // Add lineHeight to prevent clipping
    includeFontPadding: false, // Remove default font padding
  },
});
export default TitleComponent;
