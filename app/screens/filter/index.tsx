// FilterScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { styles } from './styles';
const { width } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const ITEM_MARGIN = 8;
const ITEM_WIDTH = (width - (32 + (NUM_COLUMNS + 1) * ITEM_MARGIN)) / NUM_COLUMNS;

const FilterScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);

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
  }, []);

  const formattedArray = availableTypes.map(item => item.replace(/_/g, ' '));
  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Interests</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate("DrawerNavigator")}
          style={styles.doneButton}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Selection Counter */}
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {selectedTypes.length}/5 selected (Minimum of 3)
        </Text>
      </View>

      {/* Selected Types */}
      <View style={styles.selectedContainer}>
        <FlatList
          data={selectedTypes}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.selectedType}
              onPress={() => toggleType(item)}
            >
              <Text style={styles.selectedTypeText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Available Types Grid */}
      <FlatList
        data={formattedArray}
        numColumns={NUM_COLUMNS}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.gridContent}
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
            {selectedTypes.includes(item) }
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default FilterScreen;