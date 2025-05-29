import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  Modal,
  Dimensions 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useUser } from '../../../src/context/UserContext';
import { useAuth } from '../../../src/services/auth/useAuth';
import { modalStyles } from './styles'; // Import the separate styles file
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage';
import { getApp } from 'firebase/app';
import * as ImagePicker from 'expo-image-picker';

const { height: screenHeight } = Dimensions.get('window');

interface Filter {
  id: string;
  name: string;
}

interface GroupCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onGroupCreated?: () => void;
  selectedFilters?: string[];
  onNavigateToFilters?: (currentData: { groupName: string; groupImage: string | null; filters: Filter[] }) => void;
}

const GroupCreateModal: React.FC<GroupCreateModalProps> = ({
  visible,
  onClose,
  onGroupCreated
}) => {
  const [groupName, setGroupName] = useState<string>('');
  const [groupImage, setGroupImage] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [showInterests, setShowInterests] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const { pickImage } = useUser();
  const { createGroup, loading, error } = useAuth();
  const storage = getStorage(getApp());

  // Available interests
  const availableInterests = [
    'acai_shop', 
        'afghani_restaurant', 'african_restaurant', 'american_restaurant', 
        'asian_restaurant', 'bagel_shop', 'bakery', 
        'bar', 'bar_and_grill', 'barbecue_restaurant', 
        'brazilian_restaurant', 'breakfast_restaurant', 'brunch_restaurant', 
        'buffet_restaurant', 'cafe', 'cafeteria', 
        'candy_store', 'cat_cafe', 'chinese_restaurant', 
        'chocolate_factory', 'chocolate_shop', 'coffee_shop', 
        'confectionery', 'deli', 'dessert_restaurant', 
        'dessert_shop', 'diner', 'dog_cafe', 
        'donut_shop', 'fast_food_restaurant', 'fine_dining_restaurant', 
        'food_court', 'french_restaurant', 'greek_restaurant', 
        'hamburger_restaurant', 'ice_cream_shop', 'indian_restaurant', 
        'indonesian_restaurant', 'italian_restaurant', 'japanese_restaurant', 
        'juice_shop', 'korean_restaurant', 'lebanese_restaurant', 
        'meal_delivery', 'meal_takeaway', 'mediterranean_restaurant', 
        'mexican_restaurant', 'middle_eastern_restaurant', 'pizza_restaurant', 
        'pub', 'ramen_restaurant', 'restaurant', 
        'sandwich_shop', 'seafood_restaurant', 'spanish_restaurant', 
        'steak_house', 'sushi_restaurant', 'tea_house',
        'thai_restaurant', 'turkish_restaurant', 'vegan_restaurant', 
        'vegetarian_restaurant', 'vietnamese_restaurant', 'wine_bar',
        'casino', 'night_club','karaoke',
        'event_venue', 'comedy_club', 'concert_hall',
        'convention_center'
  ];

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      setGroupName('');
      setGroupImage(null);
      setSelectedInterests([]);
      setShowInterests(false);
      setIsUploading(false);
    }
  }, [visible]);

  const handleUploadImage = async () => {
    try {
      setIsUploading(true);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setGroupImage(uri);
      }
    } catch (error) {
      console.error("Error selecting image:", error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const uploadImageToFirebase = async (uri: string): Promise<string> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const filename = `group_images/${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const storageRef = ref(storage, filename);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interest)) {
        return prev.filter(item => item !== interest);
      } else {
        return [...prev, interest];
      }
    });
  };

  const handleShowInterests = () => {
    setShowInterests(true);
  };

  const handleHideInterests = () => {
    setShowInterests(false);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Missing Information', 'Please enter a group name');
      return;
    }
    
    if (selectedInterests.length < 3) {
      Alert.alert('Missing Information', 'Please select at least 3 interests');
      return;
    }
    
    try {
      let groupPictureUrl = null;
      
      if (groupImage && groupImage.startsWith('file://')) {
        setIsUploading(true);
        groupPictureUrl = await uploadImageToFirebase(groupImage);
        setIsUploading(false);
      } else if (groupImage) {
        groupPictureUrl = groupImage;
      }
      
      const result = await createGroup({
        groupId: '',
        groupName: groupName.trim(),
        filters: selectedInterests,
        groupPicture: groupPictureUrl ?? '',
        members: [],
        createdAt: new Date(),
        isActive: false
      });
      
      if (result.success) {
        Alert.alert(
          'Success', 
          'Group created successfully!',
          [{ 
            text: 'OK', 
            onPress: () => {
              onClose();
              onGroupCreated?.();
            }
          }]
        );
      } else {
        Alert.alert('Error', result.error?.message || 'Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  if (loading) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContainer}>
            <View style={modalStyles.loadingContainer}>
              <ActivityIndicator size="large" color="#4A90E2" />
              <Text style={modalStyles.loadingText}>Creating group...</Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modalStyles.modalOverlay}>
        <View style={modalStyles.modalContainer}>
          {/* Header */}
          <View style={modalStyles.headerContainer}>
            <TouchableOpacity onPress={onClose} style={modalStyles.exitButton}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={modalStyles.header}>Create New Group</Text>
            <View style={modalStyles.spacer} />
          </View>

          <ScrollView style={modalStyles.scrollContainer} showsVerticalScrollIndicator={false}>
            {/* Avatar */}
            <TouchableOpacity 
              style={modalStyles.avatarWrapper} 
              onPress={handleUploadImage} 
              activeOpacity={0.7}
              disabled={isUploading}
            >
              {groupImage ? (
                <Image source={{ uri: groupImage }} style={modalStyles.avatar} />
              ) : (
                <View style={modalStyles.avatarPlaceholder}>
                  {isUploading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Feather name="camera" size={28} color="#fff" />
                  )}
                </View>
              )}
            </TouchableOpacity>

            {/* Form */}
            <View style={modalStyles.form}>        
              <TextInput
                style={modalStyles.input}
                placeholder="Group Name"
                placeholderTextColor="#888"
                value={groupName}
                onChangeText={setGroupName}
                maxLength={50}
              />        
              
              <View style={modalStyles.filterSection}>
                {/* Selected Interests Display */}
                <View style={modalStyles.filterContainer}>
                  {selectedInterests.length > 0 ? (
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false} 
                      contentContainerStyle={modalStyles.filterScroll}
                    >
                      {selectedInterests.map((interest) => (
                        <View key={interest} style={modalStyles.filterTag}>
                          <Text style={modalStyles.filterText}>{interest}</Text>
                          <TouchableOpacity 
                            style={modalStyles.filterRemoveButton} 
                            onPress={() => handleInterestToggle(interest)}
                          >
                            <Feather name="x" size={16} color="#555" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  ) : (
                    <Text style={modalStyles.noFiltersText}>No interests selected</Text>
                  )}
                </View>
                
                {/* Add Interests Button */}
                <TouchableOpacity 
                  style={modalStyles.filterButton} 
                  onPress={showInterests ? handleHideInterests : handleShowInterests}
                >
                  <Feather name={showInterests ? "minus" : "plus"} size={20} color="#4A90E2" />
                  <Text style={modalStyles.filterButtonText}>
                    {showInterests ? 'Hide Interests' : 'Add Interests'}
                  </Text>
                </TouchableOpacity>

                {/* Interests Selection Grid */}
                {showInterests && (
                  <View style={modalStyles.interestsContainer}>
                    <Text style={modalStyles.interestsTitle}>Select your interests (minimum 3):</Text>
                    <View style={modalStyles.interestsGrid}>
                      {availableInterests.map((interest) => (
                        <TouchableOpacity
                          key={interest}
                          style={[
                            modalStyles.interestItem,
                            selectedInterests.includes(interest) && modalStyles.interestItemSelected
                          ]}
                          onPress={() => handleInterestToggle(interest)}
                        >
                          <Text style={[
                            modalStyles.interestText,
                            selectedInterests.includes(interest) && modalStyles.interestTextSelected
                          ]}>
                            {interest}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[
              modalStyles.submitButton, 
              (!groupName || selectedInterests.length < 3 || isUploading) ? modalStyles.submitButtonDisabled : null
            ]} 
            onPress={handleCreateGroup} 
            activeOpacity={0.8}
            disabled={!groupName || selectedInterests.length < 3 || isUploading}
          >
            <Text style={modalStyles.submitButtonText}>
              {isUploading ? 'Uploading...' : 'Create Group'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default GroupCreateModal;