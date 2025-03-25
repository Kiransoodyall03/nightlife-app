// CreateGroupScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import TitleComponent from 'src/components/Title-Dark/title-animated';
import { useUser } from 'src/context/UserContext';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from 'src/services/firebase/config';
import { GroupData } from 'src/services/auth/types';
import styles from './styles';

type RootStackParamList = {
  CreateGroup: { filterId?: string } | undefined;
  GroupInvite: { groupId: string };
  FilterGroup: { onSave: (filterId: string) => void };
  Home: undefined;
};

type CreateGroupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateGroup'>;
type CreateGroupScreenRouteProp = RouteProp<RootStackParamList, 'CreateGroup'>;

interface CreateGroupScreenProps {
  navigation: CreateGroupScreenNavigationProp;
  route: CreateGroupScreenRouteProp;
}

const CreateGroupScreen: React.FC<CreateGroupScreenProps> = ({ navigation, route }) => {
  const { userData } = useUser();
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterId, setFilterId] = useState<string>('');

  // Update filterId if passed via route params (fallback, in case of re-entry)
  useEffect(() => {
    if (route.params && route.params.filterId) {
      setFilterId(route.params.filterId);
    }
  }, [route.params]);

  const validateForm = (): boolean => {
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return false;
    }
    
    if (!userData?.uid) {
      setError('You must be logged in to create a group');
      return false;
    }
    
    return true;
  };

  const handleCreateGroup = async (): Promise<void> => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Create a new document reference in the groups collection
      const groupRef = doc(collection(db, 'groups'));
      const groupId = groupRef.id;
      
      // Create the group data object (include filterId if set)
      const newGroup: GroupData = {
        groupId,
        groupName: groupName.trim(),
        members: [userData?.uid || ''],
        createdAt: new Date(),
        isActive: true,
        filterId: filterId || '',
      };
      
      // Save the group to Firestore using a server timestamp for consistency
      await setDoc(groupRef, {
        ...newGroup,
        createdAt: serverTimestamp(),
      });
      
      // Reset form and navigate to the GroupInvite screen
      setGroupName('');
      navigation.navigate('GroupInvite', { groupId });
      
    } catch (error) {
      console.error('Error creating group:', error);
      setError('Failed to create group. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Pass a callback to the FilterGroup screen so that it can update the filterId
  const handleSetFilters = () => {
    navigation.push('FilterGroup', { onSave: (filter: string) => setFilterId(filter) });
  };
  
  return (
    <View style={[styles.container, { backgroundColor: '#fff' }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={[styles.backButtonText, { color: '#000' }]}>←</Text>
        </TouchableOpacity>
        {/* Assume TitleComponent can accept a prop (e.g. lightTheme) to render a light style */}
        <TitleComponent text="Create Group"/>
      </View>
      
      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.sectionTitle, { color: '#000' }]}>Group Details</Text>
        
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: '#000' }]}>Group Name</Text>
          <TextInput
            style={[styles.textInput, { color: '#000', backgroundColor: '#f2f2f2' }]}
            placeholder="Enter a name for your group"
            placeholderTextColor="#999"
            value={groupName}
            onChangeText={setGroupName}
            maxLength={30}
          />
        </View>
        
        {error && (
          <Text style={[styles.errorText, { color: 'red' }]}>{error}</Text>
        )}

        <TouchableOpacity
          style={styles.filterButton}
          onPress={handleSetFilters}
        >
          <Text style={[styles.filterButtonText, { color: '#000' }]}>
            {filterId ? 'Edit Group Filters' : 'Set Group Filters'}
          </Text>
        </TouchableOpacity>
        
        <Text style={[styles.infoText, { color: '#000' }]}>
          After creating your group, you'll be able to invite friends and 
          set up custom filters for finding the perfect nightlife spots.
        </Text>
        
        <TouchableOpacity
          style={[
            styles.createButton,
            (!groupName.trim() || isLoading) && styles.disabledButton
          ]}
          onPress={handleCreateGroup}
          disabled={!groupName.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.createButtonText}>Create Group</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default CreateGroupScreen;
