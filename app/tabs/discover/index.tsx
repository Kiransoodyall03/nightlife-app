import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import VenueCard from '../../../src/components/VenueCard';
import { Venue } from '../../../src/components/VenueCard';
import Button from 'src/components/Button';
import styles from './styles';
import { useUser } from 'src/context/UserContext';
import { ErrorBoundary } from 'expo-router';
import { useNotification } from 'src/components/Notification/NotificationContext';
import { doc, DocumentSnapshot, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from 'src/services/firebase/config';

export default function DiscoverScreen() {
  const { fetchNearbyPlaces, userData } = useUser();
  const [venues, setVenues] = useState<Venue[]>([]);
  const swiperRef = useRef<Swiper<Venue> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { showSuccess, showError } = useNotification();
  const [userFilters, setUserFilters] = useState<string[]>([]);
  const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

  useEffect(() => {
    let unsubscribe: () => void;

    const fetchFilters = async () => {
      try {
        if (!userData?.filterId) return;
  
        const docRef = doc(db, 'filters', userData.filterId);
        unsubscribe = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserFilters(data.isFiltered ? data.filters : ['bar','resturant','cafe','night_club']);
          }
        });
      } catch (error) {
        setUserFilters(['bar','resturant','cafe','night_club']);
      }
    };
  
    fetchFilters();
    return () => unsubscribe?.();
  }, [userData?.filterId]);

  const transformPlacesToVenues = (places: any[]): Venue[] => {
    return places.map(place => ({
      id: place.id,
      name: place.displayName?.text || 'Unnamed Venue',
      image: place.photos?.[0]?.name 
        ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxHeightPx=400&key=${GOOGLE_API_KEY}`
        : 'https://picsum.photos/400/600',
      description: place.formattedAddress || 'Address not available',
      type: place.types?.join(', ') || 'Venue',
      rating: place.rating || 0,
      distance: calculateDistance({
        lat: place.location?.latitude,
        lng: place.location?.longitude
      })
    }));
  };

  const calculateDistance = useCallback((placeLocation: { lat: number, lng: number }) => {
    if (!userData?.location) return 'N/A';
    
    const userLat = userData.location.coordinates.latitude;
    const userLng = userData.location.coordinates.longitude;
    
    const toRad = (x: number) => x * Math.PI / 180;
    const R = 6371; // Earth radius in km

    const dLat = toRad(placeLocation.lat - userLat);
    const dLon = toRad(placeLocation.lng - userLng);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(userLat)) * Math.cos(toRad(placeLocation.lat)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
      
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return `${(R * c).toFixed(1)} km`;
  }, [userData?.location]);

  const loadInitialData = useCallback(async () => {
    try {
      if (!userFilters.length) {
        showError('No filters available. Please set preferences first.');
        return;
      }
      setIsLoading(true);
      const response = await fetchNearbyPlaces({
        types: userFilters,
      });
      
      setVenues(prev => [
        ...transformPlacesToVenues(response.results)
      ]);
      setNextPageToken(response.nextPageToken);
      showSuccess('Venues successfully loaded');
    } catch (error) {
     showError("Failed to initialize venues");
    } finally {
      setIsLoading(false);
    }
  }, [fetchNearbyPlaces, userFilters, showSuccess, showError, userFilters, userData?.location]);

  const loadMoreData = useCallback(async () => {
    if (!nextPageToken || isLoadingMore) return;
  
    try {
      setIsLoadingMore(true);
      const response = await fetchNearbyPlaces({
        pageToken: nextPageToken,
        types:userFilters,
      });
      
      // Merge new results while avoiding duplicates
      setVenues(prev => {
        const newVenues = response.results.filter(newPlace => 
          !prev.some(existingPlace => existingPlace.id === newPlace.place_id)
        );
        return [...prev, ...transformPlacesToVenues(newVenues)];
      });
      
      setNextPageToken(response.nextPageToken);
      showSuccess('More venues loaded!');
    } catch (error) {
      console.error('Load more error:', error);
      showError("Failed to load more");
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextPageToken, isLoadingMore, fetchNearbyPlaces, userFilters, showSuccess, showError]);

  useEffect(() => {
    if (userData?.location && userFilters.length > 0) {
      loadInitialData();
    }
  }, [userData?.location, loadInitialData, userFilters]);

  const handleSwipedAll = useCallback(() => {
    if (nextPageToken) {
      loadMoreData();
      swiperRef.current?.jumpToCardIndex(0);
    } else {
      showError('No more venues in your area');
    }
  }, [nextPageToken, loadMoreData, showError]);

  const handleSwipedRight = (index: number) => {
    console.log(`Liked: ${venues[index].name}`);
  };

  const handleSwipedLeft = (index: number) => {
    console.log(`Passed: ${venues[index].name}`);
  };

  if (!userData?.location) {
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

  if (venues.length === 0) {
    return (
      <View style={styles.LoadingContainer}>
        <Text>No venues found in your area.</Text>
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
    <View style={styles.cardsContainer}>
      {<Swiper
        ref={swiperRef}
        cards={venues}
        renderCard={(venue) => venue && (
          <VenueCard 
            venue={venue}
            onLike={() => swiperRef.current?.swipeRight()}
            onDislike={() => swiperRef.current?.swipeLeft()}
            onRewind={() => swiperRef.current?.swipeBack()}
          />
        )}
        onSwipedRight={handleSwipedRight}
        onSwipedLeft={handleSwipedLeft}
        onSwipedAll={handleSwipedAll}
        infinite={!nextPageToken}
        backgroundColor={'transparent'}
        stackSize={4}
        stackScale={10}
        stackSeparation={14}
        animateOverlayLabelsOpacity
        animateCardOpacity
        swipeBackCard
        containerStyle={styles.swiper}
      />}
      {isLoadingMore && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" />
          <Text>Loading more venues...</Text>
        </View>
      )}
    </View>
  );
}