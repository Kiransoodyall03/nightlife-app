// src/context/NotificationContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

type NotificationType = 'success' | 'error';

interface NotificationContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  showSuccess: () => {},
  showError: () => {}
});

export const NotificationProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>('success');
  const [fadeAnim] = useState(new Animated.Value(0));

  const showNotification = (message: string, type: NotificationType) => {
    setMessage(message);
    setType(type);
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      setTimeout(hideNotification, 3000);
    });
  };

  const hideNotification = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => setMessage(''));
  };

  return (
    <NotificationContext.Provider
      value={{
        showSuccess: (msg) => showNotification(msg, 'success'),
        showError: (msg) => showNotification(msg, 'error')
      }}
    >
      {children}
      {message && (
        <Animated.View
          style={[
            styles.notification,
            styles[type],
            { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-100, 0]
            }) }] }
          ]}
          pointerEvents="none"
        >
          <Text style={styles.notificationText}>{message}</Text>
        </Animated.View>
      )}
    </NotificationContext.Provider>
  );
};

const styles = StyleSheet.create({
  notification: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 15,
    borderRadius: 8,
    maxWidth: '80%',
    zIndex: 1000
  },
  success: {
    backgroundColor: '#4CAF50',
  },
  error: {
    backgroundColor: '#F44336',
  },
  notificationText: {
    color: 'white',
    fontSize: 14,
  }
});

export const useNotification = () => useContext(NotificationContext);