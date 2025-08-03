import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, ActivityIndicator, Text, Dimensions } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import VenueCard from '../../../src/components/VenueCard';
import { Venue } from '../../../src/components/VenueCard';
import Button from 'src/components/Button';
import GroupDropdown from 'src/components/dropDownMenu';
import styles from './styles';
import { useUser } from 'src/context/UserContext';
import { useAuth } from 'src/services/auth/useAuth';
import { useNotification } from 'src/components/Notification/NotificationContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from 'src/services/firebase/config';
import { GooglePlace } from 'src/services/auth/types';
import Constants from 'expo-constants';

export default function DiscoverScreen() {
  const { fetchNearbyPlaces, userData, locationData } = useUser();
  const { createLikeWithComprehensiveDebug } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  // Core state
  const [venues, setVenues] = useState<Venue[]>([]);
  const swiperRef = useRef<Swiper<Venue> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [userFilters, setUserFilters] = useState<string[]>([]);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [visibleVenues, setVisibleVenues] = useState<Venue[]>([]);
  // Group selection state
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedGroupName, setSelectedGroupName] = useState<string>('Personal Preferences');
  const [selectedGroupFilters, setSelectedGroupFilters] = useState<string[]>([]);
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY || "AIzaSyDjyEKv-jkRY1PCMV2yj5Zt_nBlCr7UJag";
if (!GOOGLE_API_KEY) {
  console.error('❌ Google API Key is missing!');
  console.error('EXPO_PUBLIC_GOOGLE_API_KEY:', process.env.EXPO_PUBLIC_GOOGLE_API_KEY);
  console.error('Constants googleApiKey:', Constants.expoConfig?.extra?.googleApiKey);
} else {
  console.log('✅ Google API Key loaded successfully');
}
  // Track existing venue IDs to prevent duplicates
  const venueIdsRef = useRef(new Set<string>());
  const prevActiveFilters = useRef<string[]>([]);
  const lastRefreshTime = useRef<number>(0);
  const isLoadingRef = useRef(false);
  const STACK_SIZE = 5; // Only render 5 cards at a time
  const PRELOAD_BUFFER = 2; 
console.log('Environment Debug:');

console.log('- Has .env EXPO_PUBLIC_GOOGLE_API_KEY:', !!process.env.EXPO_PUBLIC_GOOGLE_API_KEY);
console.log('- Has Constants googleApiKey:', !!Constants.expoConfig?.extra?.googleApiKey);
console.log('- __DEV__:', __DEV__);
console.log('- All EXPO_PUBLIC vars:', Object.keys(process.env).filter(k => k.startsWith('EXPO_PUBLIC_')));

  // Active filters computation with error handling
  const activeFilters = useMemo(() => {
    try {
      const filters = selectedGroupId ? selectedGroupFilters : userFilters;
      return Array.isArray(filters) ? filters : [];
    } catch (error) {
      console.error('Error computing active filters:', error);
      return ['bar', 'restaurant', 'cafe', 'night_club'];
    }
  }, [selectedGroupId, selectedGroupFilters, userFilters]);
  useEffect(() => {
    if (venues.length > 0) {
      const startIndex = Math.max(0, currentCardIndex);
      const endIndex = Math.min(venues.length, startIndex + STACK_SIZE + PRELOAD_BUFFER);
      const newVisibleVenues = venues.slice(startIndex, endIndex);
      
      setVisibleVenues(newVisibleVenues);
      console.log(`📱 Displaying cards ${startIndex} to ${endIndex-1} of ${venues.length} total`);
    }
  }, [venues, currentCardIndex]);
  // Handle group selection from dropdown with error handling
  const handleGroupSelect = useCallback((selection: { groupId: string; groupName: string; groupFilters: string[]}) => {
    try {
      if (!selection || typeof selection !== 'object') {
        console.error('Invalid group selection:', selection);
        return;
      }
      
      setSelectedGroupId(selection.groupId || '');
      setSelectedGroupName(selection.groupName || 'Personal Preferences');
      setSelectedGroupFilters(Array.isArray(selection.groupFilters) ? selection.groupFilters : []);
    } catch (error) {
      console.error('Error handling group selection:', error);
      showError?.('Failed to select group');
    }
  }, [showError]);

  // Distance calculation with error handling
  const calculateDistance = useCallback((placeLocation: { lat?: number, lng?: number }) => {
    try {
      if (!locationData || !placeLocation?.lat || !placeLocation?.lng) {
        return 'N/A';
      }
      
      const userLat = locationData.latitude;
      const userLng = locationData.longitude;
      
      if (typeof userLat !== 'number' || typeof userLng !== 'number') {
        return 'N/A';
      }
      
      const toRad = (x: number) => x * Math.PI / 180;
      const R = 6371; // Earth radius in km
      const dLat = toRad(placeLocation.lat - userLat);
      const dLon = toRad(placeLocation.lng - userLng);
      const a = Math.sin(dLat/2) ** 2 +
                Math.cos(toRad(userLat)) * Math.cos(toRad(placeLocation.lat)) *
                Math.sin(dLon/2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = `${(R * c).toFixed(1)} km`;
      
      return distance;
    } catch (error) {
      console.error('Error calculating distance:', error);
      return 'N/A';
    }
  }, [locationData]);

  // Transform Google Places to Venues with comprehensive error handling
  const transformPlacesToVenues = useCallback((places: GooglePlace[]): Venue[] => {
    try {
      if (!Array.isArray(places)) {
        console.error('Places is not an array:', places);
        return [];
      }
      
      return places.map((place, index) => {
        try {
          if (!place || typeof place !== 'object') {
            console.error(`Invalid place at index ${index}:`, place);
            return null;
          }
          
          const mainImage = place.photos?.[0]?.photo_reference && GOOGLE_API_KEY
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
            : null;

          const additionalImages = place.photos?.slice(1, 3)?.map(photo => 
            photo?.photo_reference && GOOGLE_API_KEY
              ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`
              : null
          ).filter(Boolean) || [];

          return {
            id: place.place_id || `venue_${index}_${Date.now()}`,
            name: place.name || 'Unnamed Venue',
            image: mainImage,
            images: additionalImages,
            description: place.vicinity || 'Address not available',
            type: Array.isArray(place.types) 
              ? place.types.filter(type => !activeFilters.includes(type))
                  .concat(activeFilters)
                  .join(', ') || 'Venue'
              : 'Venue',
            rating: typeof place.rating === 'number' ? place.rating : 0,
            distance: calculateDistance({
              lat: place.geometry?.location?.lat,
              lng: place.geometry?.location?.lng
            })
          };
        } catch (error) {
          console.error(`Error transforming place at index ${index}:`, error);
          return null;
        }
      }).filter(Boolean) as Venue[];
    } catch (error) {
      console.error('Error transforming places to venues:', error);
      return [];
    }
  }, [GOOGLE_API_KEY, calculateDistance, activeFilters]);

  // Validate filters with error handling
  const validateFilters = useCallback((filters: string[]) => {
    try {
      if (!Array.isArray(filters) || filters.length === 0) {
        return ['bar', 'restaurant', 'cafe', 'night_club'];
      }
      return filters.filter(filter => typeof filter === 'string' && filter.trim().length > 0);
    } catch (error) {
      console.error('Error validating filters:', error);
      return ['bar', 'restaurant', 'cafe', 'night_club'];
    }
  }, []);

  // Load initial venue data with comprehensive error handling
  const loadInitialData = useCallback(async () => {
    if (isLoadingRef.current || !locationData) {
      return;
    }

    try {
      isLoadingRef.current = true;
      setHasError(false);
      
      const validatedFilters = validateFilters(activeFilters);
      
      if (!locationData?.latitude || !locationData?.longitude) {
        showError?.('Location data is not available.');
        setIsLoading(false);
        setHasError(true);
        return;
      }
      
      setIsLoading(true);
      
      // Clear existing venues and tracking
      setVenues([]);
      venueIdsRef.current.clear();
      
      if (!fetchNearbyPlaces || typeof fetchNearbyPlaces !== 'function') {
        throw new Error('fetchNearbyPlaces is not available');
      }
      
      const response = await fetchNearbyPlaces({ types: validatedFilters });
          console.log('🔍 DEBUGGING RAW API RESPONSE:');
    console.log('📊 Response status:', response?.status);
    console.log('📊 Results count:', response?.results?.length);
    console.log('📊 First result:', JSON.stringify(response?.results?.[0], null, 2));
    
      if (!response || !Array.isArray(response.results)) {
        throw new Error('Invalid response from fetchNearbyPlaces');
      }
      
      if (response.results.length === 0) {
        showError?.('No venues found matching your filters. Try adjusting your preferences.');
        setVenues([]);
      } else {
        const transformedVenues = transformPlacesToVenues(response.results);
              console.log('🔍 DEBUGGING TRANSFORMED VENUES:');
      console.log('📊 Transformed count:', transformedVenues.length);
      console.log('📊 First transformed venue:', JSON.stringify(transformedVenues[0], null, 2));
      
        if (transformedVenues.length === 0) {
          showError?.('Failed to process venue data. Please try again.');
          setVenues([]);
        } else {
          // Track IDs to prevent duplicates
          transformedVenues.forEach(venue => {
            if (venue?.id) {
              venueIdsRef.current.add(venue.id);
            }
          });
          
          setVenues(transformedVenues);
          setNextPageToken(response.nextPageToken || null);
          showSuccess?.(`Loaded ${transformedVenues.length} venues!`);
        }
      }
      
      setInitialLoadDone(true);
    } catch (error: unknown) {
      console.error("Error loading venues:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showError?.(`Failed to load venues: ${errorMessage}`);
      setHasError(true);
      setVenues([]);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [fetchNearbyPlaces, activeFilters, showSuccess, showError, locationData, transformPlacesToVenues, validateFilters]);
const staticloadInitialData = useCallback(async () => {
  if (isLoadingRef.current || !locationData) {
    return;
  }

  try {
    isLoadingRef.current = true;
    setHasError(false);
    setIsLoading(true);
    
    // Clear existing venues
    setVenues([]);
    venueIdsRef.current.clear();
    
    console.log('🧪 Loading STATIC test venues...');
    
    // Create completely static test data - NO API calls, NO images
    const staticTestVenues: Venue[] = [
      {
        id: 'test_venue_1',
        name: 'Test Restaurant 1',
        image: null, // No images
        images: [],
        description: '123 Test Street, Test City',
        type: 'restaurant',
        rating: 4.5,
        distance: '0.5 km'
      },
      {
        id: 'test_venue_2',
        name: 'Test Bar 2',
        image: null, // No images
        images: [],
        description: '456 Test Avenue, Test City',
        type: 'bar',
        rating: 4.2,
        distance: '0.8 km'
      },
      {
        id: 'test_venue_3',
        name: 'Test Cafe 3',
        image: null, // No images
        images: [],
        description: '789 Test Road, Test City',
        type: 'cafe',
        rating: 4.7,
        distance: '1.2 km'
      }
    ];
    
    console.log('📊 Setting static venues:', staticTestVenues.length);
    
    // Track IDs
    staticTestVenues.forEach(venue => {
      if (venue?.id) {
        venueIdsRef.current.add(venue.id);
      }
    });
    
    setVenues(staticTestVenues);
    setNextPageToken(null); // No pagination for test
    setInitialLoadDone(true);
    
    showSuccess?.(`Loaded ${staticTestVenues.length} test venues!`);
    
  } catch (error: unknown) {
    console.error("Error loading static test venues:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    showError?.(`Failed to load test venues: ${errorMessage}`);
    setHasError(true);
    setVenues([]);
  } finally {
    setIsLoading(false);
    isLoadingRef.current = false;
  }
}, [showSuccess, showError, locationData]);
  // Load more venues with error handling
  const loadMoreData = useCallback(async () => {
    if (!nextPageToken || isLoadingMore || !fetchNearbyPlaces) {
      return;
    }

    try {
      setIsLoadingMore(true);
      
      // Add delay for Google API pagination
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const validatedFilters = validateFilters(activeFilters);
      const response = await fetchNearbyPlaces({
        pageToken: nextPageToken,
        types: validatedFilters,
      });
      
      if (!response || !Array.isArray(response.results)) {
        throw new Error('Invalid response from fetchNearbyPlaces');
      }
      
      if (response.results.length === 0) {
        setNextPageToken(null);
        return;
      }
      
      // Filter out duplicates
      const newPlaces = response.results.filter(place => 
        place?.place_id && !venueIdsRef.current.has(place.place_id)
      );
      
      if (newPlaces.length === 0) {
        if (response.nextPageToken) {
          setNextPageToken(response.nextPageToken);
        } else {
          setNextPageToken(null);
        }
        return;
      }
      
      const newVenues = transformPlacesToVenues(newPlaces);
      
      if (newVenues.length > 0) {
        // Add new IDs to tracking set
        newVenues.forEach(venue => {
          if (venue?.id) {
            venueIdsRef.current.add(venue.id);
          }
        });
        
        setVenues(prev => Array.isArray(prev) ? [...prev, ...newVenues] : newVenues);
        setNextPageToken(response.nextPageToken || null);
        showSuccess?.(`Loaded ${newVenues.length} more venues!`);
      }
    } catch (error: unknown) {
      console.error("Error loading more venues:", error);
      showError?.("Failed to load more venues. Please try again.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextPageToken, isLoadingMore, fetchNearbyPlaces, activeFilters, showSuccess, showError, transformPlacesToVenues, validateFilters]);

const handleSwipedRight = useCallback(async (index: number) => {
  try {
    // Calculate the actual venue index
    const actualIndex = currentCardIndex + index;
    
    if (!Array.isArray(venues) || actualIndex < 0 || actualIndex >= venues.length) {
      console.error('Invalid swipe index:', { index, actualIndex, venuesLength: venues?.length });
      return;
    }
    
    const venue = venues[actualIndex];
    if (!venue || !venue.id) {
      console.error('Invalid venue at index:', actualIndex);
      return;
    }
    
    // Your existing like logic here...
    if (selectedGroupId && createLikeWithComprehensiveDebug) {
      try {
        const likeData = {
          likeId: '',
          groupId: selectedGroupId,
          userId: userData?.uid || '',
          locationId: venue.id,
          locationName: venue.name || 'Unknown Venue',
          locationAddress: venue.description || '',
          locationRating: venue.rating || 0,
          locationPicture: venue.image || '',
        };
        
        const result = await createLikeWithComprehensiveDebug(likeData);
        
        if (result?.success) {
          showSuccess?.(`${venue.name} added to ${selectedGroupName}!`);
        } else {
          showError?.(result?.error?.message || 'Failed to add like');
        }
      } catch (error: unknown) {
        console.error('Error creating like:', error);
        showError?.('An unexpected error occurred');
      }
    } else {
      showSuccess?.(`Liked ${venue.name}!`);
    }
    
    // Update card index and load more if needed
    const newIndex = currentCardIndex + 1;
    setCurrentCardIndex(newIndex);
    
    // Load more venues when we're near the end
    if (newIndex >= venues.length - 3 && nextPageToken && !isLoadingMore) {
      loadMoreData();
    }
    
  } catch (error) {
    console.error('Error in handleSwipedRight:', error);
    showError?.('Error processing like');
  }
}, [currentCardIndex, venues, selectedGroupId, createLikeWithComprehensiveDebug, userData?.uid, selectedGroupName, showSuccess, showError, nextPageToken, isLoadingMore, loadMoreData]);

const handleSwipedLeft = useCallback((index: number) => {
  try {
    const actualIndex = currentCardIndex + index;
    
    if (!Array.isArray(venues) || actualIndex < 0 || actualIndex >= venues.length) {
      return;
    }
    
    const venue = venues[actualIndex];
    if (venue?.name) {
      showSuccess?.(`Passed on ${venue.name}`);
    }
    
    // Update card index and load more if needed
    const newIndex = currentCardIndex + 1;
    setCurrentCardIndex(newIndex);
    
    // Load more venues when we're near the end
    if (newIndex >= venues.length - 3 && nextPageToken && !isLoadingMore) {
      loadMoreData();
    }
    
  } catch (error) {
    console.error('Error in handleSwipedLeft:', error);
  }
}, [currentCardIndex, venues, showSuccess, nextPageToken, isLoadingMore, loadMoreData]);

const handleSwipedAll = useCallback(() => {
  try {
    console.log('🔄 All visible cards swiped, loading more...');
    
    if (currentCardIndex < venues.length - 1) {
      // Still have venues, just need to update visible stack
      const newIndex = currentCardIndex;
      setCurrentCardIndex(newIndex);
      
      // Reset swiper to first card of new stack
      setTimeout(() => {
        if (swiperRef.current && swiperRef.current.jumpToCardIndex) {
          swiperRef.current.jumpToCardIndex(0);
        }
      }, 100);
    } else if (nextPageToken && loadMoreData) {
      // Need to load more from API
      loadMoreData().then(() => {
        setTimeout(() => {
          if (swiperRef.current && swiperRef.current.jumpToCardIndex) {
            swiperRef.current.jumpToCardIndex(0);
          }
        }, 300);
      }).catch(error => {
        console.error('Error in handleSwipedAll loadMoreData:', error);
        showError?.('Failed to load more venues');
      });
    } else {
      showError?.('No more venues in your area');
    }
  } catch (error) {
    console.error('Error in handleSwipedAll:', error);
  }
}, [currentCardIndex, venues.length, nextPageToken, loadMoreData, showError]);

  // Reset and reload venues with error handling
const resetAndReloadVenues = useCallback(() => {
  try {
    setVenues([]);
    setVisibleVenues([]);
    setCurrentCardIndex(0);
    setNextPageToken(null);
    venueIdsRef.current.clear();
    setInitialLoadDone(false);
    setHasError(false);
    isLoadingRef.current = false;
  } catch (error) {
    console.error('Error resetting venues:', error);
  }
}, []);

  // Refresh venues with cooldown and error handling
  const refreshVenues = useCallback(() => {
    try {
      // 5 second cooldown
      if (Date.now() - lastRefreshTime.current < 5000) {
        showError?.('Please wait 5 seconds before refreshing again');
        return;
      }

      lastRefreshTime.current = Date.now();
      resetAndReloadVenues();
    } catch (error) {
      console.error('Error refreshing venues:', error);
      showError?.('Error refreshing venues');
    }
  }, [resetAndReloadVenues, showError]);

  // Effect: Load user filters with comprehensive error handling
  useEffect(() => {
    let unsubscribe: () => void;
    let isSubscribed = true;
  
    const fetchFilters = async () => {
      try {
        if (!userData?.uid || !userData?.filterId) {
          if (isSubscribed) {
            const defaultFilters = ['bar', 'restaurant', 'cafe', 'night_club'];
            setUserFilters(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(defaultFilters)) {
                return defaultFilters;
              }
              return prev;
            });
          }
          return;
        }

        if (!db || !doc || !onSnapshot) {
          throw new Error('Firebase dependencies not available');
        }
  
        const docRef = doc(db, 'filters', userData.filterId);
        unsubscribe = onSnapshot(docRef, (docSnap) => {
          try {
            if (!isSubscribed) return;
            
            if (docSnap.exists()) {
              const data = docSnap.data();
              const newFilters = data?.isFiltered && Array.isArray(data.filters) 
                ? data.filters 
                : ['bar', 'restaurant', 'cafe', 'night_club'];
              
              setUserFilters(prev => {
                if (JSON.stringify(prev) !== JSON.stringify(newFilters)) {
                  return newFilters;
                }
                return prev;
              });
            } else {
              const defaultFilters = ['bar', 'restaurant', 'cafe', 'night_club'];
              setUserFilters(prev => {
                if (JSON.stringify(prev) !== JSON.stringify(defaultFilters)) {
                  return defaultFilters;
                }
                return prev;
              });
            }
          } catch (error) {
            console.error('Error in onSnapshot callback:', error);
          }
        }, (error) => {
          console.error('Firebase onSnapshot error:', error);
          if (isSubscribed) {
            const defaultFilters = ['bar', 'restaurant', 'cafe', 'night_club'];
            setUserFilters(defaultFilters);
          }
        });
      } catch (error: unknown) {
        console.error("Filter fetch error:", error);
        if (isSubscribed) {
          const defaultFilters = ['bar', 'restaurant', 'cafe', 'night_club'];
          setUserFilters(defaultFilters);
        }
      }
    };
  
    fetchFilters();
    
    return () => {
      isSubscribed = false;
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing:', error);
        }
      }
    };
  }, [userData?.uid, userData?.filterId]);

  // Effect: Reset venues when filters change with error handling
  useEffect(() => {
    try {
      // Deep compare to avoid unnecessary resets
      if (JSON.stringify(prevActiveFilters.current) !== JSON.stringify(activeFilters)) {
        prevActiveFilters.current = [...activeFilters];
        if (initialLoadDone) {
          resetAndReloadVenues();
        }
      }
    } catch (error) {
      console.error('Error in filter change effect:', error);
    }
  }, [activeFilters, resetAndReloadVenues, initialLoadDone]);

  // Effect: Initial data load with error handling
  useEffect(() => {
    try {
      if (locationData && !initialLoadDone && !isLoadingRef.current) {
        loadInitialData();
      }
    } catch (error) {
      console.error('Error in initial data load effect:', error);
    }
  }, [locationData, initialLoadDone, loadInitialData]);
    const TestVenueCard = ({ venue }: { venue: Venue }) => {
    console.log('🏪 TestVenueCard rendering:', venue.name);
    
    return (
      <View style={{
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        margin: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
          {venue.name}
        </Text>
        <Text style={{ fontSize: 16, color: '#666', marginBottom: 8 }}>
          {venue.description}
        </Text>
        <Text style={{ fontSize: 14, color: '#999', marginBottom: 8 }}>
          Type: {venue.type}
        </Text>
        <Text style={{ fontSize: 14, color: '#999', marginBottom: 8 }}>
          Rating: {venue.rating}/5
        </Text>
        <Text style={{ fontSize: 14, color: '#999' }}>
          Distance: {venue.distance}
        </Text>
      </View>
    );
  };

  // Error boundary fallback
  if (hasError) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer || { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={styles.errorText || { fontSize: 16, textAlign: 'center', marginBottom: 20, color: 'red' }}>
            Something went wrong while loading venues
          </Text>
          <Text style={styles.infoText || { fontSize: 14, textAlign: 'center', marginBottom: 20, color: '#666' }}>
            Please try refreshing or check your internet connection
          </Text>
          <View style={styles.actionContainer || { alignItems: 'center' }}>
            <Button 
              title="Retry" 
              onPress={() => {
                setHasError(false);
                resetAndReloadVenues();
              }}
            />
          </View>
        </View>
      </View>
    );
  }

  // Render: No location
  if (!locationData) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer || { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={styles.errorText || { fontSize: 16, textAlign: 'center', marginBottom: 20, color: 'red' }}>
            Location services required to discover venues
          </Text>
          <Text style={styles.infoText || { fontSize: 14, textAlign: 'center', marginBottom: 20, color: '#666' }}>
            Please enable location permissions in your device settings
          </Text>
          <View style={styles.actionContainer || { alignItems: 'center' }}>
            <Button title="Retry" onPress={() => window.location.reload()} />
          </View>
        </View>
      </View>
    );
  }

  // Render: Loading
  if (isLoading) {
    return (
      <View style={styles.container}>
        {userData?.uid && (
          <View style={styles.dropdownContainer}>
            <GroupDropdown
              userId={userData.uid}
              onGroupSelect={handleGroupSelect}
              selectedGroupId={selectedGroupId}
              showError={showError}
            />
            <Text style={styles.filterText || { fontSize: 12, textAlign: 'center', color: '#666' }}>
              {selectedGroupName} • Loading venues...
            </Text>
          </View>
        )}
        <View style={styles.loadingContainer || { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.infoText || { fontSize: 14, textAlign: 'center', marginTop: 10, color: '#666' }}>
            Finding the best venues near you
          </Text>
          <Text style={styles.filterText || { fontSize: 12, textAlign: 'center', marginTop: 5, color: '#666' }}>
            Using filters: {activeFilters.join(', ')}
          </Text>
        </View>
      </View>
    );
  }

  // Render: No venues
  if (venues.length === 0 && initialLoadDone) {
    return (
      <View style={styles.container}>
        {userData?.uid && (
          <View style={styles.dropdownContainer}>
            <GroupDropdown
              userId={userData.uid}
              onGroupSelect={handleGroupSelect}
              selectedGroupId={selectedGroupId}
              showError={showError}
            />
            <Text style={styles.filterText || { fontSize: 12, textAlign: 'center', color: '#666' }}>
              {selectedGroupName} • No venues found
            </Text>
          </View>
        )}
        <View style={styles.loadingContainer || { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={styles.infoText || { fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
            No venues found with your current filters
          </Text>
          <Text style={styles.filterText || { fontSize: 14, textAlign: 'center', marginBottom: 20, color: '#666' }}>
            Try adjusting your preferences or location
          </Text>
          
          <View style={styles.actionContainer || { alignItems: 'center' }}>
            <Button 
              title="Try Different Filters" 
              onPress={resetAndReloadVenues}
            />
            <Button 
              title="Refresh Location" 
              onPress={refreshVenues}
              style={{ marginTop: 10 }}
            />
          </View>
        </View>
      </View>
    );
  }

  // Main render with comprehensive error handling
  if (!Array.isArray(venues) || venues.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer || { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Fixed dropdown header */}
      {userData?.uid && (
        <View style={styles.dropdownContainer}>
          <GroupDropdown
            userId={userData.uid}
            onGroupSelect={handleGroupSelect}
            selectedGroupId={selectedGroupId}
            showError={showError}
          />
          <Text style={styles.filterText || { fontSize: 12, textAlign: 'center', color: '#666' }}>
            {selectedGroupName} • {venues.length} venues loaded
          </Text>
        </View>
      )}

      {/* Swiper Container - takes remaining space */}
      <View style={styles.cardsContainer || { flex: 1 }}>
        <Swiper
          ref={swiperRef}
          cards={venues}
          renderCard={(venue) => {
            if (!venue) return null;
            
            return (
              <VenueCard 
                venue={venue}
                onLike={() => swiperRef.current?.swipeRight?.()}
                onDislike={() => swiperRef.current?.swipeLeft?.()}
                onRewind={() => swiperRef.current?.swipeBack?.()}
                selectedGroupName={selectedGroupName}
              />
            );
            } 
          }
          onSwipedRight={handleSwipedRight}
          onSwipedLeft={handleSwipedLeft}
          onSwipedAll={handleSwipedAll}
          infinite={false}
          backgroundColor={'transparent'}
          stackSize={10}
          stackScale={10}
          stackSeparation={14}
          animateOverlayLabelsOpacity
          animateCardOpacity
          swipeBackCard
          containerStyle={styles.swiper}
          cardIndex={0}
          cardVerticalMargin={20}
          cardHorizontalMargin={10}
          overlayLabels={{
            left: {
              title: 'PASS',
              style: {
                label: styles.overlayLabelLeft || {},
                wrapper: styles.overlayWrapperLeft || {}
              }
            },
            right: {
              title: 'LIKE',
              style: {
                label: styles.overlayLabelRight || {},
                wrapper: styles.overlayWrapperRight || {}
              }
            }
          }}
        />
        
        {/* Loading More Overlay */}
        {isLoadingMore && (
          <View style={styles.loadingOverlay || { 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(255,255,255,0.8)', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.infoText || { marginTop: 10 }}>Loading more venues...</Text>
          </View>
        )}
      </View>
    </View>
  );
}