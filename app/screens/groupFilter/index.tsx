import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, SafeAreaView } from 'react-native';
import { useAuth } from '../../../src/services/auth/useAuth';
import { NavigationProp } from '@react-navigation/native';
import { styles } from './styles';
import { useUser } from '../../../src/context/UserContext';
import { useNotification } from 'src/components/Notification/NotificationContext';

const NUM_COLUMNS = 3;

const GroupFilterScreen = ({ navigation, route }: { navigation: NavigationProp<any>, route: any }) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError, showSuccess } = useNotification();
  const { handleFilters } = useAuth();
  const { user } = useUser();
  const returnData = route.params?.returnData || {};


  // Replace with actual API call to fetch place types
  useEffect(() => {
    // Example types - replace with Google Places API types
    const typesFromAPI = ['acai_shop', 
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
        'convention_center'];
    setAvailableTypes(typesFromAPI);
    
    // If there are existing filters passed from CreateGroup screen, initialize with them
    if (route.params?.existingFilters) {
      setSelectedTypes(route.params.existingFilters.map((filter: string) => filter.replace(/_/g, ' ')));
    }
  }, [route.params]);

  const formattedArray = availableTypes.map(item => item.replace(/_/g, ' '));
  
  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : selectedTypes.length < 5 ? [...prev, type] : prev
    );
  };

  const handleDone = () => {
    if (selectedTypes.length < 3) {
      showError('Please select at least 3 interests');
      return;
    }
    
    // Convert selected types back to original format with underscores
    const formattedFilters = selectedTypes.map(type => type.replace(/ /g, '_'));
    
    // Navigate back to CreateGroup screen with the selected filters
    navigation.navigate("GroupCreate", { 
      selectedFilters: formattedFilters,
      groupName: returnData.groupName,
      groupImage: returnData.groupImage,
    });
  };

  // Calculate number of rows for grid height estimation
  const numRows = Math.ceil(formattedArray.length / NUM_COLUMNS);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Group Interests</Text>
          <TouchableOpacity 
            onPress={handleDone}
            style={styles.doneButton}
            disabled={isSubmitting}
          >
            <Text style={styles.doneButtonText}>{isSubmitting ? 'Saving...' : 'Done'}</Text>
          </TouchableOpacity>
        </View>

        {/* Selection Counter */}
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>
            {selectedTypes.length}/5 selected (Minimum of 3)
          </Text>
        </View>

        {/* Selected Types Horizontal Scrollable Area */}
        <View style={styles.selectedContainer}>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectedScrollContent}
          >
            {selectedTypes.length > 0 ? (
              selectedTypes.map((item) => (
                <TouchableOpacity 
                  key={item}
                  style={styles.selectedType}
                  onPress={() => toggleType(item)}
                >
                  <Text style={styles.selectedTypeText}>{item}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noSelectionText}>No interests selected yet</Text>
            )}
          </ScrollView>
        </View>

        {/* Available Types Grid with Scrolling */}
        <FlatList
          data={formattedArray}
          numColumns={NUM_COLUMNS}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={true}
          initialNumToRender={24} // Optimize initial render
          maxToRenderPerBatch={24} // Optimize batch rendering
          windowSize={10} // Optimize memory usage
          removeClippedSubviews={true} // Improve performance for long lists
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.gridItem,
                selectedTypes.includes(item) && styles.selectedGridItem
              ]}
              onPress={() => toggleType(item)}
            >
              <Text style={[
                styles.typeText,
                selectedTypes.includes(item) && styles.selectedTypeText
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default GroupFilterScreen;