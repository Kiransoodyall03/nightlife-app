import React from 'react';
import { Text, View, StyleSheet, Dimensions } from 'react-native';

interface TitleComponentProps {
  text: string;
}
const { width, height } = Dimensions.get('window');


const TitleComponent: React.FC<TitleComponentProps> = ({ text }) => {
  const calculateColor = (index: number, totalLength: number): string => {
    const startColor = [0, 0, 0]; // White
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
  },
  char: {
    fontSize: 30,
    fontWeight: 'bold',
  },
});

export default TitleComponent;
