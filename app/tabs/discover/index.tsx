import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import VenueCard from '../../../src/components/VenueCard';
import { Venue } from '../../../src/components/VenueCard';
import Button from 'src/components/Button';
import styles from './styles';
import { useUser } from 'src/context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { useNotification } from 'src/components/Notification/NotificationContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from 'src/services/firebase/config';
import { GooglePlace } from 'src/services/auth/types';
import { fixGroupFilterIds, repairGroupFilterRelationships } from 'src/services/auth/groupService';
import { recordSwipe, hasUserSwiped } from 'src/services/auth/swipeMatchService';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function DiscoverScreen() {
  const navigation = useNavigation();
  const hasRepairedRef = useRef(false);
  const { fetchNearbyPlaces, userData, locationData, refreshActiveGroups, hasActiveGroups } = useUser();
  const [venues, setVenues] = useState<Venue[]>([]);
  const isInitialLoadInProgress = useRef(false);
  const initialLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const swiperRef = useRef<Swiper<Venue> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isLoadingRef = useRef(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { showSuccess, showError } = useNotification();
  const [userFilters, setUserFilters] = useState<string[]>([]);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
  const initialLoadAttempted = useRef(false);
  const [isGroupMode, setIsGroupMode] = useState(false);
  const initialLoadingStarted = useRef(false);
  const venueIdsRef = useRef(new Set<string>());
  useEffect(() => {
    if (userData?.uid) {
      refreshActiveGroups();
    }
  }, [userData?.uid]);
  
  useEffect(() => {
    setIsGroupMode(hasActiveGroups);
  }, [hasActiveGroups]);

  const resetAndReloadVenues = useCallback(() => {
    if (isInitialLoadInProgress.current) return; // Prevent reset during loading
    
    isInitialLoadInProgress.current = true;
    setVenues([]);
    setNextPageToken(null);
    venueIdsRef.current.clear();
    setInitialLoadDone(false);
    
    // Reset flag after a delay
    setTimeout(() => {
      isInitialLoadInProgress.current = false;
    }, 1000);
  }, []);

  useEffect(() => {
    // Run once when user is authenticated
    if (userData?.uid && !hasRepairedRef.current) {
      console.log("Running data repair routine");
      hasRepairedRef.current = true;
      
      // First fix the group filter IDs
      fixGroupFilterIds(userData.uid)
        .then(success => {
          if (success) {
            console.log("Group filter IDs fixed successfully");
            // Then repair any relationships
            return repairGroupFilterRelationships(userData.uid);
          }
          return false;
        })
        .then(success => {
          if (success) {
            console.log("Group filter relationships repaired successfully");
            // Reload venues with corrected filters
            resetAndReloadVenues();
          }
        })
        .catch(error => {
          console.error("Error during data repair:", error);
        });
    }
  }, [userData?.uid, resetAndReloadVenues]);
  

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
      
      // Wrap onSnapshot in try/catch for more resilience
      try {
        unsubscribe = onSnapshot(docRef, (docSnap) => {
          if (!isSubscribed) return;
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            const newFilters = data.isFiltered ? data.filters : ['bar', 'restaurant', 'cafe', 'night_club'];
            
            // Only update if filters have really changed
            if (JSON.stringify(userFilters) !== JSON.stringify(newFilters)) {
              setUserFilters(newFilters);
              // Reset when filters change, but only if we've already loaded once
              if (initialLoadDone) {
                resetAndReloadVenues();
              }
            }
          } else {
            setUserFilters(['bar', 'restaurant', 'cafe', 'night_club']);
          }
        });
      } catch (error) {
        console.error("Error subscribing to filters:", error);
        if (isSubscribed) {
          setUserFilters(['bar', 'restaurant', 'cafe', 'night_club']);
        }
      }
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
}, [userData?.uid, userData?.filterId, resetAndReloadVenues]);


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
      }),
      rawData: place
    }));
  }, [GOOGLE_API_KEY, calculateDistance]);

  const loadInitialData = useCallback(async () => {
    try {
      if (!userFilters.length) {
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
      console.log("Loading venues with filters:", userFilters);
      
      // Clear existing venues and tracking
      setVenues([]);
      venueIdsRef.current.clear();
      
      let response;
      try {
        response = await fetchNearbyPlaces();
      } catch (error: any) {
        // If throttled, wait and try again
        if (error.message === "Request throttled due to cooldown") {
          console.log("Request throttled, waiting 3 seconds before retry");
          await new Promise(resolve => setTimeout(resolve, 3000));
          response = await fetchNearbyPlaces();
        } else {
          // For other errors, try one more time with default filters
          console.error("Error fetching venues, trying with default filters:", error);
          try {
            response = await fetchNearbyPlaces({
              types: ['bar', 'restaurant', 'cafe', 'night_club']
            });
          } catch (fallbackError) {
            console.error("Fallback fetch also failed:", fallbackError);
            throw fallbackError;
          }
        }
      }
              
      if (!response || response.results.length === 0) {
        showError('No venues found matching your filters. Try adjusting your preferences.');
        setVenues([]);
      } else {
        // Filter out places the user has already swiped on
        let placesToShow = response.results;
        
        if (userData?.uid) {
          const filteredResults = [];
          for (const place of response.results) {
            const alreadySwiped = await hasUserSwiped(userData.uid, place.place_id);
            if (!alreadySwiped) {
              filteredResults.push(place);
            }
          }
          placesToShow = filteredResults;
        }
        
        // Now transform the filtered results
        const transformedVenues = transformPlacesToVenues(placesToShow);
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
  }, [fetchNearbyPlaces, userFilters, showSuccess, showError, locationData, transformPlacesToVenues, userData?.uid]);

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
      let newPlaces = response.results.filter(place => 
        !venueIdsRef.current.has(place.place_id)
      );
      
      // Filter out places the user has already swiped on
      if (userData?.uid) {
        const notSwipedPlaces = [];
        for (const place of newPlaces) {
          const alreadySwiped = await hasUserSwiped(userData.uid, place.place_id);
          if (!alreadySwiped) {
            notSwipedPlaces.push(place);
          }
        }
        newPlaces = notSwipedPlaces;
      }
      
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
  }, [nextPageToken, isLoadingMore, fetchNearbyPlaces, userFilters, showSuccess, showError, transformPlacesToVenues, userData?.uid]);

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

  const handleSwipedRight = async (index: number) => {
    console.log(`Liked: ${venues[index].name}`);
    
    if (!userData?.uid) return;
    
    // Convert back to GooglePlace type using saved rawData
    const venue = venues[index];
    if (venue.rawData) {
      try {
        // Record the swipe in Firestore
        const success = await recordSwipe(venue.rawData as GooglePlace, 'right');
        if (success) {
          if (isGroupMode) {
            showSuccess('Venue liked in your active groups');
          } else {
            showSuccess('Venue liked');
          }
        }
      } catch (error) {
        console.error('Error recording swipe:', error);
        showError('Failed to record your preference');
      }
    }
  };

  const handleSwipedLeft = async (index: number) => {
    console.log(`Passed: ${venues[index].name}`);
    
    if (!userData?.uid) return;
    
    // Convert back to GooglePlace type using saved rawData
    const venue = venues[index];
    if (venue.rawData) {
      try {
        // Record the swipe in Firestore
        await recordSwipe(venue.rawData as GooglePlace, 'left');
      } catch (error) {
        console.error('Error recording swipe:', error);
      }
    }
  };
  const toggleGroupMode = async () => {
    if (!userData?.uid) {
      showError('You need to be logged in to use group mode');
      return;
    }
    
    if (!hasActiveGroups && !isGroupMode) {
      // No active groups but trying to enable group mode
      showError('You have no active groups. Please join or create a group first.');
      return;
    }
    
    // Toggle group mode
    setIsGroupMode(prev => !prev);
    
    // Reset and reload with new filters
    resetAndReloadVenues();
  };

  if (!locationData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Please enable location services to discover venues</Text>
      </View>
    );
  }

  if (isLoading && venues.length === 0) {
    return (
      <View style={styles.LoadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading venues...</Text>
        <Button 
          title="Force Show Venues" 
          onPress={() => {
            setIsLoading(false);
            setInitialLoadDone(true);
          }} 
        />
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

useEffect(() => {
  if (locationData && 
      userFilters.length > 0 && 
      !initialLoadDone && 
      !isLoading && 
      !isInitialLoadInProgress.current) {
    
    console.log("Starting initial data load");
    isInitialLoadInProgress.current = true;
    setIsLoading(true);
    
    // Small delay to ensure everything is ready
    setTimeout(() => {
      console.log("Executing loadInitialData");
      loadInitialData()
        .then(() => {
          console.log("Initial data load complete");
        })
        .catch(err => {
          console.error("Error during initial load:", err);
        })
        .finally(() => {
          // Always ensure loading states are reset
          setIsLoading(false);
          
          // Delay resetting the flag to prevent rapid retriggering
          setTimeout(() => {
            isInitialLoadInProgress.current = false;
          }, 2000);
        });
    }, 1500);
  }
}, [locationData, userFilters, initialLoadDone, isLoading, loadInitialData]);

useEffect(() => {
  console.log("State check:", {
    isLoading,
    initialLoadDone,
    venuesLength: venues.length
  });
}, [isLoading, initialLoadDone, venues.length]);

useEffect(() => {
  // Force clear loading state after 10 seconds or if venues are available
  const forceTimer = setTimeout(() => {
    if (isLoading) {
      console.log("Force clearing loading state after timeout");
      setIsLoading(false);
      // If we have venues, also mark as loaded
      if (venues.length > 0) {
        setInitialLoadDone(true);
      }
    }
  }, 10000); // 10 second fail-safe
  
  return () => clearTimeout(forceTimer);
}, []);

  return (
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
            isGroupMode={isGroupMode}
          />
        )}
        onSwipedRight={handleSwipedRight}
        onSwipedLeft={handleSwipedLeft}
        onSwipedAll={handleSwipedAll}
        infinite={false} // Changed to false for better control over pagination
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
  );
}