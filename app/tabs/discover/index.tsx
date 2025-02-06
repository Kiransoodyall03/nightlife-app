import React, { useState, useRef, useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import VenueCard from '../../../src/components/VenueCard';
import { Venue } from '../../../src/components/VenueCard';
import styles from './styles';
import { useUser } from 'src/context/UserContext';

export default function DiscoverScreen() {
  const {nearbyPlaces, fetchNearbyPlaces, userData} = useUser();
  const [venues, setVenues] = useState<Venue[]>([]);
  const swiperRef = useRef<Swiper<Venue> | null>(null);

  const transformPlacesToVenues = (places: any[]): Venue[] => {
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
  };

  const calculateDistance = (placeLocation: {latitude: number, longitude: number}) =>
  {
    if (!userData?.location) return 'N/A';
    const userLatitude = userData.location.coordinates.latitude;
    const userLongitude = userData.location.coordinates.longitude;
    const radius = (x: number) =>x * Math.PI /180;

    const EarthRadius = 6371;
    const distanceLatitude = radius(placeLocation.latitude - userLatitude);
    const distanceLongitude = radius(placeLocation.longitude - userLongitude);
    const a = Math.sin(distanceLatitude/2) * Math.sin(distanceLatitude/2) + Math.cos(radius(userLatitude))
    * Math.cos(radius(placeLocation.latitude)) * Math.sin(distanceLongitude/2) * Math.sin(distanceLongitude/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return `${(c * EarthRadius).toFixed(1)} km`;
  };

  useEffect(()=> {
    if (userData?.location && userData?.searchRadius){
      fetchNearbyPlaces();
    }
  }, [userData?.location, userData?.searchRadius]);
  
  useEffect(()=> {
    if (nearbyPlaces.length > 0){
      setVenues(transformPlacesToVenues(nearbyPlaces));
    }
  }, [nearbyPlaces]);


const VENUES: Venue[] = [
  {
    id: '1',
    name: 'Skyline Lounge',
    image: 'https://picsum.photos/400/600',
    description: 'Rooftop bar with amazing city views',
    type: 'Lounge & Bar',
    rating: 4.5,
    distance: '0.5 km'
  },
  {
    id: '2',
    name: 'The Jazz Club',
    image: 'https://picsum.photos/400/601',
    description: 'Live jazz music and craft cocktails',
    type: 'Music Venue',
    rating: 4.7,
    distance: '1.2 km'
  },
  {
    id: '3',
    name: 'Neon Nightclub',
    image: 'https://picsum.photos/400/602',
    description: 'Electronic music and dance floors',
    type: 'Nightclub',
    rating: 4.2,
    distance: '0.8 km'
  }
];

  const handleSwipedRight = (index: number) => {
    console.log(`Liked: ${venues[index].name}`);
    // Add like functionality here
  };

  const handleSwipedLeft = (index: number) => {
    console.log(`Passed: ${venues[index].name}`);
    // Add pass functionality here
  };

  const handleSwipedAll = () => {
    setVenues([]);
    fetchNearbyPlaces();
  };
  if (!userData?.location) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Please enable location services to discover venues</Text>
      </View>
    );
  }

  const handleLike = () => {
    swiperRef.current?.swipeRight();
  };

  const handleDislike = () => {
    swiperRef.current?.swipeLeft();
  };

  const handleRewind = () => {
    swiperRef.current?.swipeBack();
  };

  return (
    <View style={styles.cardsContainer}>
      <Swiper
        ref={swiperRef}
        cards={venues}
        renderCard={(venue) => 
          venue && (
            <VenueCard 
              venue={venue}
              onLike={() => swiperRef.current?.swipeRight()}
              onDislike={() => swiperRef.current?.swipeLeft()}
              onRewind={() => swiperRef.current?.swipeBack()}
            />
          )
        }
        onSwipedRight={handleSwipedRight}
        onSwipedLeft={handleSwipedLeft}
        onSwipedAll={handleSwipedAll}
        infinite
        backgroundColor={'transparent'}
        stackSize={3}
        stackScale={10}
        stackSeparation={14}
        animateOverlayLabelsOpacity
        animateCardOpacity
        swipeBackCard
        containerStyle={styles.swiper}
      />
    </View>
  );
}