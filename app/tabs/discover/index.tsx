import React, { useState, useRef } from 'react';
import { View } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import VenueCard from '../../../src/components/VenueCard';
import  {Venue}  from '../../../src/components/VenueCard';
import styles from './styles';

// Sample data - replace with real data later
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

export default function DiscoverScreen() {
  const [venues, setVenues] = useState<Venue[]>(VENUES);
  
  // Define swiperRef with the proper type argument
  const swiperRef = useRef<Swiper<Venue> | null>(null);

  const handleSwipedRight = (index: number) => {
    console.log(`Liked: ${venues[index].name}`);
    // Add like functionality here
  };

  const handleSwipedLeft = (index: number) => {
    console.log(`Passed: ${venues[index].name}`);
    // Add pass functionality here
  };

  const handleSwipedAll = () => {
    // Reset the deck when all cards are swiped
    setVenues([...VENUES]);
    swiperRef.current?.jumpToCardIndex(0); // Now this should work
  };

  return (
    <View style={styles.container}>
      <Swiper
        ref={swiperRef}
        cards={venues}
        renderCard={(venue) => venue && <VenueCard venue={venue} />}
        onSwipedRight={handleSwipedRight}
        onSwipedLeft={handleSwipedLeft}
        onSwipedAll={handleSwipedAll}
        infinite
        backgroundColor={'transparent'}
        cardHorizontalMargin={10}  // Add some horizontal margin
        stackSize={3}              // Adjust stack size if needed
        stackScale={10}            // Adjust scaling of stacked cards
        stackSeparation={14}       // Adjust the separation between stacked cards
        animateOverlayLabelsOpacity
        animateCardOpacity
        swipeBackCard
        containerStyle={styles.swiper} // Use containerStyle instead of contentContainerStyle
      />
    </View>
  );
}
