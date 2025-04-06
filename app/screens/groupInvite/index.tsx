import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Share, 
  Platform, 
  ToastAndroid, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import TitleComponent from 'src/components/Title-Dark/title-animated';
import { useUser } from 'src/context/UserContext';
import QRCode from 'react-native-qrcode-svg';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from 'src/services/firebase/config';
import * as Clipboard from 'expo-clipboard';
import styles from './styles';
import { NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  GroupInvite: { groupId: string };
  DrawerNavigator: undefined;
};

type GroupInviteScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GroupInvite'>;
type GroupInviteScreenRouteProp = RouteProp<RootStackParamList, 'GroupInvite'>;

interface GroupInviteScreenProps {
  navigation: GroupInviteScreenNavigationProp;
  route: GroupInviteScreenRouteProp;
}

const GroupInviteScreen: React.FC<GroupInviteScreenProps> = ({ navigation, route }) => {
  const { userData } = useUser();
  const [inviteCode, setInviteCode] = useState<string>('');
  const [qrValue, setQrValue] = useState<string>('');
  const [groupName, setGroupName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroupAndGenerateCode = async () => {
      // Safely retrieve the groupId from route params
      const groupId = route.params?.groupId;
      if (!groupId) {
        setError('Group ID is missing. Please select a group first.');
        setLoading(false);
        return;
      }

      try {
        // Fetch group details using the groupId (group details are stored in the group document)
        const groupDoc = await getDoc(doc(db, 'groups', groupId));
        if (!groupDoc.exists()) {
          setError('Group not found');
          setLoading(false);
          return;
        }
        const groupData = groupDoc.data();
        setGroupName(groupData.groupName);

        // Generate a random invite code
        const generateInviteCode = (): string => {
          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
          let code = '';
          for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return code;
        };

        const code = generateInviteCode();

        // Update the group document with the invite code and expiry (using a server timestamp if needed)
        await updateDoc(doc(db, 'groups', groupId), {
          inviteCode: code,
          inviteExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // expires in 24 hours
        });

        setInviteCode(code);

        // Prepare the QR code value with group details
        const value = JSON.stringify({
          type: 'group_invite',
          groupId: groupId,
          code: code,
          groupName: groupData.groupName,
          invitedBy: userData?.username || 'User',
          timestamp: new Date().toISOString()
        });
        setQrValue(value);
        setLoading(false);
      } catch (error) {
        console.error('Error generating invite:', error);
        setError('Failed to generate invite code');
        setLoading(false);
      }
    };

    fetchGroupAndGenerateCode();
  }, [route.params, userData]);

  const copyCodeToClipboard = async (): Promise<void> => {
    await Clipboard.setStringAsync(inviteCode);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Code copied to clipboard!', ToastAndroid.SHORT);
    } else {
      Alert.alert('Success', 'Code copied to clipboard!');
    }
  };

  const shareInvite = async (): Promise<void> => {
    try {
      await Share.share({
        message: `Join my NightLife group "${groupName}" with code: ${inviteCode}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDone = (): void => {
    navigation.navigate('DrawerNavigator');
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Generating invite code...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        <Text style={styles.groupNameText}>{groupName}</Text>
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
        
        <TouchableOpacity
          style={styles.doneButton}
          onPress={handleDone}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GroupInviteScreen;
