// CreateGroupScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import TitleComponent from 'src/components/Title-Dark/title-animated';
import { useUser } from 'src/context/UserContext';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from 'src/services/firebase/config';
import { GroupData } from 'src/services/auth/types';
import styles from './styles';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
  const { userData, updateActiveGroups } = useUser();
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterId, setFilterId] = useState<string>('');
  const [groupImage, setGroupImage] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  
  const storage = getStorage();

  // Update filterId if passed via route params (fallback, in case of re-entry)
  useEffect(() => {
    if (route.params && route.params.filterId) {
      setFilterId(route.params.filterId);
    }
  }, [route.params]);

  // Request permission for image library
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your photo library to upload a group image.');
      }
    })();
  }, []);

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

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setGroupImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const uploadGroupImage = async (groupId: string): Promise<string | null> => {
    if (!groupImage) return null;
    
    try {
      setImageUploading(true);
      
      // Convert image to blob
      const response = await fetch(groupImage);
      const blob = await response.blob();
      
      // Create a reference to the storage location
      const storageRef = ref(storage, `group-images/${groupId}`);
      
      // Upload the image
      await uploadBytes(storageRef, blob);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload group image');
      return null;
    } finally {
      setImageUploading(false);
    }
  };

  const handleCreateGroup = async (): Promise<void> => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Create a new document reference in the groups collection
      const groupRef = doc(collection(db, 'groups'));
      const groupId = groupRef.id;
      
      // Upload the group image if selected
      const imageUrl = await uploadGroupImage(groupId);
      
      // Generate an invite code that expires in 24 hours
      const inviteCode = generateInviteCode();
      const inviteExpiry = new Date();
      inviteExpiry.setHours(inviteExpiry.getHours() + 24);
      
      // Create the group data object (include filterId if set)
      const newGroup: GroupData = {
        groupId,
        groupName: groupName.trim(),
        members: [userData?.uid || ''],
        createdAt: new Date(),
        isActive: true,
        filterId: filterId || '',
        inviteCode,
        inviteExpiry
      };
      
      // Add the image URL if available
      if (imageUrl) {
        newGroup.groupImage = imageUrl;
      }
      
      // Save the group to Firestore using a server timestamp for consistency
      await setDoc(groupRef, {
        ...newGroup,
        createdAt: serverTimestamp(),
        inviteExpiry: serverTimestamp()
      });
      
      // Set this group as active for the creator
      if (userData?.uid) {
        await updateActiveGroups(groupId, true);
      }
      
      // Reset form and navigate to the GroupInvite screen
      setGroupName('');
      setGroupImage(null);
      navigation.navigate('GroupInvite', { groupId });
      
    } catch (error) {
      console.error('Error creating group:', error);
      setError('Failed to create group. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a random invite code
  const generateInviteCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Omit similar looking characters
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
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
        <TitleComponent text="Create Group"/>
      </View>
      
      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.contentContainer}>
        {/* Group Image Selector */}
        <View style={styles.imagePickerContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
            {groupImage ? (
              <Image source={{ uri: groupImage }} style={styles.groupImagePreview} />
            ) : (
              <View style={styles.placeholderContainer}>
                <MaterialCommunityIcons name="camera-plus" size={40} color="#6200EE" />
                <Text style={styles.placeholderText}>Add Group Photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        
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
            (!groupName.trim() || isLoading || imageUploading) && styles.disabledButton
          ]}
          onPress={handleCreateGroup}
          disabled={!groupName.trim() || isLoading || imageUploading}
        >
          {isLoading || imageUploading ? (
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