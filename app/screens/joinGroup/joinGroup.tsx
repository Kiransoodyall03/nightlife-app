import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import TitleComponent from 'src/components/Title-Dark/title-animated';
import { joinGroupByInviteCode } from 'src/services/auth/groupService';
import styles from './styles';

type RootStackParamList = {
  JoinGroup: undefined;
  Group: undefined;
  // Add other screens as needed
};

type JoinGroupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'JoinGroup'>;

interface JoinGroupScreenProps {
  navigation: JoinGroupScreenNavigationProp;
}

const JoinGroupScreen: React.FC<JoinGroupScreenProps> = ({ navigation }) => {
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoinGroup = async (): Promise<void> => {
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await joinGroupByInviteCode(inviteCode.trim().toUpperCase());
      
      if (result.success) {
        Alert.alert(
          'Success',
          `You've joined the group "${result.group?.groupName}"!`,
          [{ text: 'OK', onPress: () => navigation.navigate('Group') }]
        );
      } else {
        setError(result.error || 'Failed to join group');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
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
        <TitleComponent text="Join Group" />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.titleText}>Enter Invite Code</Text>
        <Text style={styles.subtitleText}>
          Enter the 6-character code you received to join a NightLife group.
        </Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.codeInput}
            placeholder="ABCDEF"
            value={inviteCode}
            onChangeText={(text) => {
              // Convert to uppercase and limit to 6 chars
              setInviteCode(text.toUpperCase().slice(0, 6));
              setError(null);
            }}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
          />
        </View>
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        
        <TouchableOpacity
          style={[
            styles.joinButton,
            (!inviteCode.trim() || isLoading) && styles.disabledButton
          ]}
          onPress={handleJoinGroup}
          disabled={!inviteCode.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.joinButtonText}>Join Group</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Invite codes are typically 6 characters and expire after 24 hours.
          </Text>
        </View>
      </View>
    </View>
  );
};

export default JoinGroupScreen;