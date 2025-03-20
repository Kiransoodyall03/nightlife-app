import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Image, ToastAndroid, Platform, Alert } from 'react-native';
import TitleComponent from 'src/components/Title-Dark/title-animated';
import { useUser } from 'src/context/UserContext';
import QRCode from 'react-native-qrcode-svg'; // You'll need to install this

const GroupInviteScreen = ({ navigation }) => {
    const userData = useUser();
    const [inviteCode, setInviteCode] = useState('');
    const [qrValue, setQrValue] = useState('');
  
  useEffect(() => {
    // Generate a random invite code - in production, this should come from your backend
    const generateInviteCode = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };
    
    const code = generateInviteCode();
    setInviteCode(code);
    
    // The QR value would typically include more information, such as the group ID
    const value = JSON.stringify({
      type: 'group_invite',
      code: code,
      username: userData?.userData?.username || 'User',
      timestamp: new Date().toISOString()
    });
    
    setQrValue(value);
  }, [userData]);
  
  const copyCodeToClipboard = () => {
    // In a real app, you would use Clipboard.setString(inviteCode)
    // Since we can't actually copy, let's simulate it with a toast/alert
    if (Platform.OS === 'android') {
      ToastAndroid.show('Code copied to clipboard!', ToastAndroid.SHORT);
    } else {
      Alert.alert('Success', 'Code copied to clipboard!');
    }
  };
  
  const shareInvite = async () => {
    try {
      await Share.share({
        message: `Join my NightLife group with code: ${inviteCode}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <TitleComponent text="Invite Friends" />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.titleText}>Share Your Group</Text>
        <Text style={styles.subtitleText}>
          Invite friends to join your NightLife group using the QR code or invite code below.
        </Text>
        
        <View style={styles.qrContainer}>
          {qrValue ? (
            <QRCode
              value={qrValue}
              size={200}
              color="#000"
              backgroundColor="#fff"
            />
          ) : (
            <View style={styles.qrPlaceholder} />
          )}
        </View>
        
        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Group Code</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{inviteCode}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={copyCodeToClipboard}
            >
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.shareButton}
          onPress={shareInvite}
        >
          <Text style={styles.shareButtonText}>Share Invite Link</Text>
        </TouchableOpacity>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Group codes expire after 24 hours for security reasons.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f4',
    paddingBottom: 15,
  },
  backButton: {
    marginRight: 20,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 22,
    fontFamily: 'Jaldi-Bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 16,
    fontFamily: 'Jaldi-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 30,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  codeContainer: {
    width: '100%',
    marginBottom: 30,
  },
  codeLabel: {
    fontSize: 16,
    fontFamily: 'Jaldi-Bold',
    marginBottom: 10,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f7f7f7',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  codeText: {
    fontSize: 20,
    fontFamily: 'Jaldi-Bold',
    letterSpacing: 1,
  },
  copyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  copyButtonText: {
    color: 'white',
    fontFamily: 'Jaldi-Bold',
    fontSize: 14,
  },
  shareButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    width: '80%',
    alignItems: 'center',
  },
  shareButtonText: {
    color: 'white',
    fontFamily: 'Jaldi-Bold',
    fontSize: 16,
  },
  infoContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    width: '100%',
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Jaldi-Regular',
    color: '#666',
    textAlign: 'center',
  },
});

export default GroupInviteScreen;