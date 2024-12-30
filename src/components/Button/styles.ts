// components/Button/styles.ts
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  button: {
    borderRadius: 50, // Make it circular
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent', // Transparent background
    borderWidth: 2,
  },
  
  // Variant styles
  primaryButton: {
    borderColor: '#007AFF',
  },
  secondaryButton: {
    borderColor: '#6C757D',
  },
  outlineButton: {
    borderColor: '#007AFF',
  },
  dangerButton: {
    borderColor: '#DC3545',
  },

  // Size styles - making them square to ensure circle shape
  smallButton: {
    width: 40,
    height: 40,
  },
  mediumButton: {
    width: 56,
    height: 56,
  },
  largeButton: {
    width: 72,
    height: 72,
  },

  // Text styles
  text: {
    fontWeight: '600',
  },

  // Text variant styles
  primaryText: {
    color: '#007AFF',
  },
  secondaryText: {
    color: '#6C757D',
  },
  outlineText: {
    color: '#007AFF',
  },
  dangerText: {
    color: '#DC3545',
  },

  // Text size styles
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },

  // Disabled styles
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});