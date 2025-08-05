import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, ActivityIndicator, Text, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
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
  
  // Core state - using GooglePlace instead of Venue
  const [places, setPlaces] = useState<GooglePlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [userFilters, setUserFilters] = useState<string[]>([]);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Group selection state
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedGroupName, setSelectedGroupName] = useState<string>('Personal Preferences');
  const [selectedGroupFilters, setSelectedGroupFilters] = useState<string[]>([]);

  const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY || "AIzaSyDjyEKv-jkRY1PCMV2yj5Zt_nBlCr7UJag";

  // Track existing place IDs to prevent duplicates
  const placeIdsRef = useRef(new Set<string>());
  const prevActiveFilters = useRef<string[]>([]);
  const lastRefreshTime = useRef<number>(0);
  const isLoadingRef = useRef(false);

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

  // Load initial place data with comprehensive error handling
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
      
      // Clear existing places and tracking
      setPlaces([]);
      placeIdsRef.current.clear();
      
      if (!fetchNearbyPlaces || typeof fetchNearbyPlaces !== 'function') {
        throw new Error('fetchNearbyPlaces is not available');
      }
      
      const response = await fetchNearbyPlaces({ types: validatedFilters });
      console.log('🔍 DEBUGGING RAW API RESPONSE:');
      console.log('📊 Response status:', response?.status);
      console.log('📊 Results count:', response?.results?.length);
      console.log('📊 Full response:', JSON.stringify(response, null, 2));
      
      if (!response || !Array.isArray(response.results)) {
        throw new Error('Invalid response from fetchNearbyPlaces');
      }
      
      if (response.results.length === 0) {
        showError?.('No places found matching your filters. Try adjusting your preferences.');
        setPlaces([]);
      } else {
        // Use raw Google Places data without transformation
        const validPlaces = response.results.filter(place => place && typeof place === 'object');
        console.log('🔍 DEBUGGING RAW PLACES DATA:');
        console.log('📊 Valid places count:', validPlaces.length);
        console.log('📊 All places data:', JSON.stringify(validPlaces, null, 2));
        
        if (validPlaces.length === 0) {
          showError?.('Failed to process place data. Please try again.');
          setPlaces([]);
        } else {
          // Track IDs to prevent duplicates
          validPlaces.forEach(place => {
            if (place?.place_id) {
              placeIdsRef.current.add(place.place_id);
            }
          });
          
          setPlaces(validPlaces);
          setNextPageToken(response.nextPageToken || null);
          showSuccess?.(`Loaded ${validPlaces.length} places!`);
        }
      }
      
      setInitialLoadDone(true);
    } catch (error: unknown) {
      console.error("Error loading places:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showError?.(`Failed to load places: ${errorMessage}`);
      setHasError(true);
      setPlaces([]);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [fetchNearbyPlaces, activeFilters, showSuccess, showError, locationData, validateFilters]);

  // Load more places with error handling
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
        place?.place_id && !placeIdsRef.current.has(place.place_id)
      );
      
      if (newPlaces.length === 0) {
        if (response.nextPageToken) {
          setNextPageToken(response.nextPageToken);
        } else {
          setNextPageToken(null);
        }
        return;
      }
      
      if (newPlaces.length > 0) {
        // Add new IDs to tracking set
        newPlaces.forEach(place => {
          if (place?.place_id) {
            placeIdsRef.current.add(place.place_id);
          }
        });
        
        setPlaces(prev => Array.isArray(prev) ? [...prev, ...newPlaces] : newPlaces);
        setNextPageToken(response.nextPageToken || null);
        showSuccess?.(`Loaded ${newPlaces.length} more places!`);
      }
    } catch (error: unknown) {
      console.error("Error loading more places:", error);
      showError?.("Failed to load more places. Please try again.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextPageToken, isLoadingMore, fetchNearbyPlaces, activeFilters, showSuccess, showError, validateFilters]);

  // Handle place like
  const handleLike = useCallback(async (place: GooglePlace) => {
    try {
      if (selectedGroupId && createLikeWithComprehensiveDebug) {
        try {
          const likeData = {
            likeId: '',
            groupId: selectedGroupId,
            userId: userData?.uid || '',
            locationId: place.place_id || '',
            locationName: place.name || 'Unknown Place',
            locationAddress: place.vicinity || '',
            locationRating: place.rating || 0,
            locationPicture: place.photos?.[0]?.photo_reference 
              ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
              : '',
          };
          
          const result = await createLikeWithComprehensiveDebug(likeData);
          
          if (result?.success) {
            showSuccess?.(`${place.name} added to ${selectedGroupName}!`);
          } else {
            showError?.(result?.error?.message || 'Failed to add like');
          }
        } catch (error: unknown) {
          console.error('Error creating like:', error);
          showError?.('An unexpected error occurred');
        }
      } else {
        showSuccess?.(`Liked ${place.name}!`);
      }
    } catch (error) {
      console.error('Error in handleLike:', error);
      showError?.('Error processing like');
    }
  }, [selectedGroupId, createLikeWithComprehensiveDebug, userData?.uid, selectedGroupName, showSuccess, showError, GOOGLE_API_KEY]);

  // Reset and reload places with error handling
  const resetAndReloadPlaces = useCallback(() => {
    try {
      setPlaces([]);
      setNextPageToken(null);
      placeIdsRef.current.clear();
      setInitialLoadDone(false);
      setHasError(false);
      isLoadingRef.current = false;
      loadInitialData();
    } catch (error) {
      console.error('Error resetting places:', error);
    }
  }, [loadInitialData]);

  // Refresh places with cooldown and error handling
  const refreshPlaces = useCallback(() => {
    try {
      // 5 second cooldown
      if (Date.now() - lastRefreshTime.current < 5000) {
        showError?.('Please wait 5 seconds before refreshing again');
        return;
      }

      lastRefreshTime.current = Date.now();
      resetAndReloadPlaces();
    } catch (error) {
      console.error('Error refreshing places:', error);
      showError?.('Error refreshing places');
    }
  }, [resetAndReloadPlaces, showError]);

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

  // Effect: Reset places when filters change with error handling
  useEffect(() => {
    try {
      // Deep compare to avoid unnecessary resets
      if (JSON.stringify(prevActiveFilters.current) !== JSON.stringify(activeFilters)) {
        prevActiveFilters.current = [...activeFilters];
        if (initialLoadDone) {
          resetAndReloadPlaces();
        }
      }
    } catch (error) {
      console.error('Error in filter change effect:', error);
    }
  }, [activeFilters, resetAndReloadPlaces, initialLoadDone]);

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

  // Place data box component - displays raw Google Places data
  const PlaceDataBox = ({ place, index }: { place: GooglePlace; index: number }) => {
    const distance = calculateDistance({
      lat: place.geometry?.location?.lat,
      lng: place.geometry?.location?.lng
    });

    const mainPhotoUrl = place.photos?.[0]?.photo_reference && GOOGLE_API_KEY
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
      : null;

    return (
      <View style={{
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        margin: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#e0e0e0'
      }}>
        {/* Header with place name and index */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', flex: 1, color: '#1a1a1a' }}>
            {place.name || 'Unnamed Place'}
          </Text>
          <Text style={{ fontSize: 14, color: '#666', backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
            #{index + 1}
          </Text>
        </View>

        {/* Basic place details */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
            <Text style={{ fontWeight: '600' }}>Place ID:</Text> {place.place_id || 'N/A'}
          </Text>
          <Text style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
          </Text>
          <Text style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
            <Text style={{ fontWeight: '600' }}>Types:</Text> {place.types?.join(', ') || 'N/A'}
          </Text>
          <Text style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
            <Text style={{ fontWeight: '600' }}>Rating:</Text> {place.rating ? `${place.rating}/5` : 'No rating'}
          </Text>
          <Text style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>

          </Text>
          <Text style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
            <Text style={{ fontWeight: '600' }}>Distance:</Text> {distance}
          </Text>
          <Text style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
          </Text>
          <Text style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
          </Text>
        </View>

        {/* Location details */}
        {place.geometry?.location && (
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
              <Text style={{ fontWeight: '600' }}>Coordinates:</Text> {place.geometry.location.lat?.toFixed(6)}, {place.geometry.location.lng?.toFixed(6)}
            </Text>
          </View>
        )}


        {/* Photos info */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
            <Text style={{ fontWeight: '600' }}>Photos:</Text> {place.photos?.length || 0} available
          </Text>
          {mainPhotoUrl && (
            <Text style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
              Main photo URL: {mainPhotoUrl.substring(0, 50)}...
            </Text>
          )}
        </View>



        {/* Raw data section (collapsed by default) */}
        <View style={{ marginBottom: 12, backgroundColor: '#f8f9fa', padding: 8, borderRadius: 6 }}>
          <Text style={{ fontSize: 12, color: '#666', fontFamily: 'monospace' }}>
            Raw Google Places Data:
          </Text>
          <ScrollView style={{ maxHeight: 150 }} showsVerticalScrollIndicator={true}>
            <Text style={{ fontSize: 10, color: '#666', fontFamily: 'monospace' }}>
              {JSON.stringify(place, null, 2)}
            </Text>
          </ScrollView>
        </View>

        {/* Action buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <TouchableOpacity
            onPress={() => handleLike(place)}
            style={{
              backgroundColor: '#22c55e',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 6,
              flex: 1,
              marginRight: 8,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Like</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => showSuccess?.(`Passed on ${place.name}`)}
            style={{
              backgroundColor: '#ef4444',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 6,
              flex: 1,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Pass</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Error boundary fallback
  if (hasError) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer || { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={styles.errorText || { fontSize: 16, textAlign: 'center', marginBottom: 20, color: 'red' }}>
            Something went wrong while loading places
          </Text>
          <Text style={styles.infoText || { fontSize: 14, textAlign: 'center', marginBottom: 20, color: '#666' }}>
            Please try refreshing or check your internet connection
          </Text>
          <View style={styles.actionContainer || { alignItems: 'center' }}>
            <Button 
              title="Retry" 
              onPress={() => {
                setHasError(false);
                resetAndReloadPlaces();
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
            Location services required to discover places
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
              {selectedGroupName} • Loading places...
            </Text>
          </View>
        )}
        <View style={styles.loadingContainer || { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.infoText || { fontSize: 14, textAlign: 'center', marginTop: 10, color: '#666' }}>
            Finding the best places near you
          </Text>
          <Text style={styles.filterText || { fontSize: 12, textAlign: 'center', marginTop: 5, color: '#666' }}>
            Using filters: {activeFilters.join(', ')}
          </Text>
        </View>
      </View>
    );
  }

  // Render: No places
  if (places.length === 0 && initialLoadDone) {
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
              {selectedGroupName} • No places found
            </Text>
          </View>
        )}
        <View style={styles.loadingContainer || { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={styles.infoText || { fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
            No places found with your current filters
          </Text>
          <Text style={styles.filterText || { fontSize: 14, textAlign: 'center', marginBottom: 20, color: '#666' }}>
            Try adjusting your preferences or location
          </Text>
          
          <View style={styles.actionContainer || { alignItems: 'center' }}>
            <Button 
              title="Try Different Filters" 
              onPress={resetAndReloadPlaces}
            />
            <Button 
              title="Refresh Location" 
              onPress={refreshPlaces}
              style={{ marginTop: 10 }}
            />
          </View>
        </View>
      </View>
    );
  }

  // Main render with place data boxes
  return (
    <View style={styles.container}>
      {/* Fixed header with group info and filters */}
      {userData?.uid && (
        <View style={styles.dropdownContainer}>
          <GroupDropdown
            userId={userData.uid}
            onGroupSelect={handleGroupSelect}
            selectedGroupId={selectedGroupId}
            showError={showError}
          />
          <View style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f8f9fa', borderRadius: 8, margin: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', textAlign: 'center' }}>
              {selectedGroupName} • {places.length} places loaded
            </Text>
            <Text style={{ fontSize: 12, color: '#666', textAlign: 'center', marginTop: 2 }}>
              Filters: {activeFilters.join(', ')}
            </Text>
            {locationData && (
              <Text style={{ fontSize: 12, color: '#666', textAlign: 'center', marginTop: 2 }}>
                Location: {locationData.latitude.toFixed(4)}, {locationData.longitude.toFixed(4)}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Scrollable place list */}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={true}
      >
        {places.map((place, index) => (
          <PlaceDataBox key={place.place_id || `place_${index}`} place={place} index={index} />
        ))}
        
        {/* Load more button */}
        {nextPageToken && (
          <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 20 }}>
            <Button
              title={isLoadingMore ? "Loading..." : "Load More Places"}
              onPress={loadMoreData}
              disabled={isLoadingMore}
            />
          </View>
        )}
        
        {/* Refresh button */}
        <View style={{ alignItems: 'center', marginTop: 10, marginBottom: 20 }}>
          <Button
            title="Refresh Places"
            onPress={refreshPlaces}
          />
        </View>
      </ScrollView>

      {/* Loading More Overlay */}
      {isLoadingMore && (
        <View style={{
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
          <Text style={{ marginTop: 10, fontSize: 14, color: '#666' }}>Loading more places...</Text>
        </View>
      )}
    </View>
  );
}