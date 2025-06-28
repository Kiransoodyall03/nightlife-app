import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
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

export default function DiscoverScreen() {
  const { fetchNearbyPlaces, userData, locationData } = useUser();
  const { createLike } = useAuth(); // Add this line
  const [venues, setVenues] = useState<Venue[]>([]);
  const swiperRef = useRef<Swiper<Venue> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { showSuccess, showError } = useNotification();
  const [userFilters, setUserFilters] = useState<string[]>([]);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedGroupName, setSelectedGroupName] = useState<string>('Personal Preferences');
  const [selectedGroupFilters, setSelectedGroupFilters] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
  
  // Track existing venue IDs to prevent duplicates
  const venueIdsRef = useRef(new Set<string>());

  const activeFilters = useMemo(() => {
    return selectedGroupId ? selectedGroupFilters : userFilters;
  }, [selectedGroupId, selectedGroupFilters, userFilters]);

  // Handle group selection from dropdown
  const handleGroupSelect = (selection: { groupId: string; groupName: string; groupFilters: string[]}) => {
    setSelectedGroupId(selection.groupId);
    setSelectedGroupName(selection.groupName);
    setSelectedGroupFilters(selection.groupFilters);
    console.log('Group selected:', selection);
  };

  useEffect(() => {
    if (initialLoadDone) {
      resetAndReloadVenues();
    }
  }, [activeFilters]);

  // Filter fetching effect with improved comparison
  useEffect(() => {
    let unsubscribe: () => void;
    let isSubscribed = true;
  
    const fetchFilters = async () => {
      try {
        if (!userData?.uid || !userData?.filterId) {
          if (isSubscribed) {
            setUserFilters(['bar', 'restaurant', 'cafe', 'night_club']);
          }
          return;
        }
  
        const docRef = doc(db, 'filters', userData.filterId);
        unsubscribe = onSnapshot(docRef, (docSnap) => {
          if (!isSubscribed) return;
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            const newFilters = data.isFiltered ? data.filters : ['bar', 'restaurant', 'cafe', 'night_club'];
            
            // Only update if filters have really changed
            if (JSON.stringify(userFilters) !== JSON.stringify(newFilters)) {
              setUserFilters(newFilters);
              // Reset when filters change
              if (initialLoadDone) {
                resetAndReloadVenues();
              }
            }
          } else {
            setUserFilters(['bar', 'restaurant', 'cafe', 'night_club']);
          }
        });
      } catch (error) {
        console.error("Filter fetch error:", error);
        if (isSubscribed) {
          setUserFilters(['bar', 'restaurant', 'cafe', 'night_club']);
        }
      }
    };
  
    fetchFilters();
    
    return () => {
      isSubscribed = false;
      unsubscribe?.();
    };
  }, [userData?.uid, userData?.filterId]);

  // Reset function for filters change
  const resetAndReloadVenues = useCallback(() => {
    setVenues([]);
    setNextPageToken(null);
    venueIdsRef.current.clear();
    setInitialLoadDone(false);
  }, []);

  const calculateDistance = useCallback((placeLocation: { lat?: number, lng?: number }) => {
    if (!locationData || !placeLocation.lat || !placeLocation.lng) return 'N/A';
    
    const userLat = locationData.latitude;
    const userLng = locationData.longitude;
    const toRad = (x: number) => x * Math.PI / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(placeLocation.lat - userLat);
    const dLon = toRad(placeLocation.lng - userLng);
    const a = Math.sin(dLat/2) ** 2 +
              Math.cos(toRad(userLat)) * Math.cos(toRad(placeLocation.lat)) *
              Math.sin(dLon/2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return `${(R * c).toFixed(1)} km`;
  }, [locationData]);

  const transformPlacesToVenues = useCallback((places: GooglePlace[]): Venue[] => {
    return places.map(place => ({
      id: place.place_id,
      name: place.name || 'Unnamed Venue',
      image: place.photos?.[0]?.photo_reference 
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
        : 'https://picsum.photos/400/600',
      description: place.vicinity || 'Address not available',
      type: place.types?.join(', ') || 'Venue',
      rating: place.rating || 0,
      distance: calculateDistance({
        lat: place.geometry?.location?.lat,
        lng: place.geometry?.location?.lng
      })
    }));
  }, [GOOGLE_API_KEY, calculateDistance]);

  const loadInitialData = useCallback(async () => {
    try {
      if (!activeFilters.length) {
        showError('No filters available. Please set preferences first.');
        setIsLoading(false);
        return;
      }
      if (!locationData?.latitude || !locationData?.longitude) {
        showError('Location data is not available.');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      console.log("Loading venues with filters:", activeFilters);
      
      // Clear existing venues and tracking
      setVenues([]);
      venueIdsRef.current.clear();
      
      const response = await fetchNearbyPlaces({ types: activeFilters });
      
      if (response.results.length === 0) {
        showError('No venues found matching your filters. Try adjusting your preferences.');
        setVenues([]);
      } else {
        const transformedVenues = transformPlacesToVenues(response.results);
        console.log(`Successfully loaded ${transformedVenues.length} venues`);
        
        // Track IDs to prevent duplicates
        transformedVenues.forEach(venue => venueIdsRef.current.add(venue.id));
        
        setVenues(transformedVenues);
        setNextPageToken(response.nextPageToken);
        showSuccess('Venues loaded successfully');
      }
      
      setInitialLoadDone(true);
    } catch (error) {
      console.error("Error loading venues:", error);
      showError("Failed to load venues. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchNearbyPlaces, activeFilters, showSuccess, showError, locationData, transformPlacesToVenues]);

  // Only trigger the initial load once (or when locationData changes)
  useEffect(() => {
    if (locationData && userFilters.length > 0 && !initialLoadDone) {
      console.log("Calling loadInitialData from useEffect");
      loadInitialData();
    }
  }, [locationData, userFilters, initialLoadDone, loadInitialData]);

  const loadMoreData = useCallback(async () => {
    if (!nextPageToken || isLoadingMore) return;
  
    try {
      setIsLoadingMore(true);
      
      // Add small delay for Google API pagination to be ready
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const response = await fetchNearbyPlaces({
        pageToken: nextPageToken,
        types: userFilters,
      });
      
      if (response.results.length === 0) {
        setNextPageToken(null);
        showError('No more venues available');
        return;
      }
      
      // Filter out duplicates using our tracking Set
      const newPlaces = response.results.filter(place => 
        !venueIdsRef.current.has(place.place_id)
      );
      
      if (newPlaces.length === 0) {
        // If we got only duplicates, try to get the next page
        if (response.nextPageToken) {
          setNextPageToken(response.nextPageToken);
          setIsLoadingMore(false);
          loadMoreData(); // Recursively try next page
          return;
        } else {
          showError('No new venues found');
          setNextPageToken(null);
          return;
        }
      }
      
      const newVenues = transformPlacesToVenues(newPlaces);
      
      // Add new IDs to our tracking set
      newVenues.forEach(venue => venueIdsRef.current.add(venue.id));
      
      setVenues(prev => [...prev, ...newVenues]);
      setNextPageToken(response.nextPageToken);
      
      if (newVenues.length > 0) {
        showSuccess(`Loaded ${newVenues.length} more venues!`);
      }
    } catch (error) {
      console.error("Error loading more venues:", error);
      showError("Failed to load more venues. Please try again.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextPageToken, isLoadingMore, fetchNearbyPlaces, userFilters, showSuccess, showError, transformPlacesToVenues]);

  const handleSwipedAll = useCallback(() => {
    if (nextPageToken) {
      loadMoreData().then(() => {
        // Only jump to index 0 if we have venues
        if (venues.length > 0) {
          // Small delay to make sure new cards are rendered
          setTimeout(() => {
            if (swiperRef.current) {
              swiperRef.current.jumpToCardIndex(0);
            }
          }, 300);
        }
      });
    } else {
      showError('No more venues in your area');
    }
  }, [nextPageToken, loadMoreData, showError, venues.length]);

  const refreshVenues = useCallback(() => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    resetAndReloadVenues();
    setIsRefreshing(false);
  }, [isRefreshing, resetAndReloadVenues]);

  // Updated handleSwipedRight with createLike integration
  const handleSwipedRight = async (index: number) => {
    const venue = venues[index];
    console.log(`Liked: ${venue.name} with group: ${selectedGroupName}`);
    
    // Only create like if a group is selected (not Personal Preferences)
    if (selectedGroupId) {
      try {
        const result = await createLike({
          likeId: '', // Will be auto-generated
          groupId: selectedGroupId,
          userId: '', // Will be overridden with authenticated user
          locationId: venue.id // This is the Google Places place_id
        });
        
        if (result.success) {
          showSuccess(`${venue.name} added to ${selectedGroupName}!`);
        } else {
          // Error will be handled by the error state in useAuth
          console.error('Failed to create like:', result.error);
        }
      } catch (error) {
        console.error('Error creating like:', error);
        // Don't show error here since createLike handles it
      }
    } else {
      // For Personal Preferences, just log (or implement personal preference storage)
      console.log(`Liked ${venue.name} for personal preferences`);
      showSuccess(`${venue.name} noted as liked!`);
    }
  };

  const handleSwipedLeft = (index: number) => {
    console.log(`Passed: ${venues[index].name} with group: ${selectedGroupName}`);
    // Here you could implement dislike logic if needed
  };

  if (!locationData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Please enable location services to discover venues</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.LoadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading venues...</Text>
      </View>
    );
  }

  if (venues.length === 0 && initialLoadDone) {
    return (
      <View style={styles.LoadingContainer}>
        <Text>No venues found in your area with your current filters.</Text>
        <Button title="Refresh" onPress={refreshVenues} />
      </View>
    );
  }
  
  const ErrorFallback = (props: { error: Error; resetError: () => void }) => (
    <View style={styles.container}>
      <Text>Something went wrong:</Text>
      <Text style={styles.errorText}>{props.error.message}</Text>
      <Button title="Try again" onPress={props.resetError} />
    </View>
  );
  
  return (
    <View style={styles.container}>
      {/* Dropdown at the top middle of the page */}
      <View style={styles.dropdownContainer}>
        <GroupDropdown
          userId={userData?.uid || ''}
          onGroupSelect={handleGroupSelect}
          selectedGroupId={selectedGroupId}
          showError={showError}
          buttonStyle={styles.dropdownButton}
          buttonTextStyle={styles.dropdownButtonText}
        />
      </View>

      {/* Cards container */}
      <View style={styles.cardsContainer}>
        <Swiper
          ref={swiperRef}
          cards={venues}
          renderCard={(venue) => venue && (
            <VenueCard 
              venue={venue}
              onLike={() => swiperRef.current?.swipeRight()}
              onDislike={() => swiperRef.current?.swipeLeft()}
              onRewind={() => swiperRef.current?.swipeBack()}
              selectedGroupName={selectedGroupName} // Pass the selected group name to display on card
            />
          )}
          onSwipedRight={handleSwipedRight}
          onSwipedLeft={handleSwipedLeft}
          onSwipedAll={handleSwipedAll}
          infinite={false}
          backgroundColor={'transparent'}
          stackSize={4}
          stackScale={10}
          stackSeparation={14}
          animateOverlayLabelsOpacity
          animateCardOpacity
          swipeBackCard
          containerStyle={styles.swiper}
          cardIndex={0}
          cardVerticalMargin={10}
          cardHorizontalMargin={10}
        />
        {isLoadingMore && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" />
            <Text>Loading more venues...</Text>
          </View>
        )}
      </View>
    </View>
  );
}