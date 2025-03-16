// components/Button/index.tsx
import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle, ActivityIndicator, View } from 'react-native';
import styles from './styles';

export interface ButtonProps {
  onPress?: () => void;
  title?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'circle';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  customStyle?: ViewStyle;
}

export default function Button({ 
  onPress = () => {},
  title, 
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  customStyle
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        styles[`${variant}Button`],
        styles[`${size}Button`],
        disabled && styles.disabledButton,
        variant === 'circle' && styles.circleButton,
        customStyle,
        style
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={styles[`${variant}Text`]?.color || '#fff'} />
      ) : (
        <>
          {icon && icon}
          {title && (
            <Text style={[
              styles.text,
              styles[`${variant}Text`],
              styles[`${size}Text`],
              disabled && styles.disabledText,
              textStyle
            ]}>
              {title}
            </Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}