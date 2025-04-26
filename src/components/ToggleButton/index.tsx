import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Animated, StyleSheet, View, StyleProp, ViewStyle } from 'react-native';

interface ToggleButtonProps {
  /** Current state of the toggle (true=on, false=off) */
  value: boolean;
  /** Function to call when toggle is pressed */
  onToggle: () => void;
  /** Whether the toggle is interactive */
  disabled?: boolean;
  /** Background color when toggle is on */
  activeColor?: string;
  /** Background color when toggle is off */
  inactiveColor?: string;
  /** Additional styles for the container */
  style?: StyleProp<ViewStyle>;
}

/**
 * A reusable toggle switch component with animation
 */
const ToggleButton: React.FC<ToggleButtonProps> = ({ 
  value, 
  onToggle, 
  disabled = false,
  activeColor = '#4cd964',
  inactiveColor = '#ccc',
  style
}) => {
  const [animation] = useState(new Animated.Value(value ? 1 : 0));

  useEffect(() => {
    Animated.timing(animation, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, animation]);

  // Calculate toggle position and background color based on animation value
  const togglePosition = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 24]
  });

  const backgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveColor, activeColor]
  });

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={onToggle}
      disabled={disabled}
      style={[styles.container, { opacity: disabled ? 0.6 : 1 }, style]}
    >
      <Animated.View style={[styles.background, { backgroundColor }]}>
        <Animated.View 
          style={[
            styles.circle, 
            { transform: [{ translateX: togglePosition }] }
          ]} 
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
  background: {
    width: 50,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
});

export default ToggleButton;