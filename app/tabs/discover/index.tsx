import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import VenueCard from '../../../src/components/VenueCard';
import { Venue } from '../../../src/components/VenueCard';
import styles from './styles';
import { useUser } from 'src/context/UserContext';

export default function DiscoverScreen() {
  const { fetchNearbyPlaces, userData } = useUser();
  const [venues, setVenues] = useState<Venue[]>([]);
  const swiperRef = useRef<Swiper<Venue> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const transformPlacesToVenues = useCallback((places: any[]): Venue[] => {
    return places.map(place => ({
      id: place.place_id,
      name: place.name,
      image: place.photos?.[0]?.photo_reference 
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${process.env.EXPO_PUBLIC_GOOGLE_API_KEY}`
        : 'https://picsum.photos/400/600',
      description: place.vicinity,
      type: place.types?.join(', ').replace(/_/g, ' ') || 'Venue',
      rating: place.rating || 0,
      distance: calculateDistance(place.geometry.location)
    }));
  }, []);

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
      setIsLoading(true);
      const response = await fetchNearbyPlaces({
        types: ['book store', 'gym', 'spa', 'health', 'clothing_store'],
        excludedTypes: ['school', 'university']
      });
      
      setVenues(transformPlacesToVenues(response.results));
      setNextPageToken(response.nextPageToken);
    } catch (error) {
      console.error('Initial load error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchNearbyPlaces, transformPlacesToVenues]);
  const loadMoreData = useCallback(async () => {
    if (!nextPageToken || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      const response = await fetchNearbyPlaces({
        pageToken: nextPageToken,
        types: ['book store', 'gym', 'spa', 'health', 'clothing_store'],
        excludedTypes: ['school', 'university']
      });
      
      setVenues(prev => [...prev, ...transformPlacesToVenues(response.results)]);
      setNextPageToken(response.nextPageToken);
    } catch (error) {
      console.error('Load more error:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextPageToken, isLoadingMore, fetchNearbyPlaces, transformPlacesToVenues]);

  useEffect(() => {
    if (userData?.location) {
      loadInitialData();
    }
  }, [userData?.location, loadInitialData]);

  const handleSwipedAll = useCallback(() => {
    if (nextPageToken) {
      loadMoreData();
      swiperRef.current?.jumpToCardIndex(0);
    }
  }, [nextPageToken, loadMoreData]);

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