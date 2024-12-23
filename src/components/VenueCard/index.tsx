import React from 'react';
import { View, Text, Image, Dimensions } from 'react-native';
import styles from './styles';

const { width } = Dimensions.get('window');

export interface Venue {
  id: string;
  name: string;
  image: string;
  description: string;
  type: string;
  rating: number;
  distance?: string;
}

interface VenueCardProps {
  venue: Venue;
}

export default function VenueCard({ venue }: VenueCardProps) {
  return (
    <View style={styles.card}>
<Image
  source={{ uri: venue.image }}
  style={styles.image}
  resizeMode="cover"
  onError={(e) => console.log('Image Load Error:', e.nativeEvent.error)}
/>

      <View style={styles.infoContainer}>
        <Text style={styles.name}>{venue.name}</Text>
        <Text style={styles.type}>{venue.type}</Text>
        <Text style={styles.description}>{venue.description}</Text>
        <View style={styles.footer}>
          <Text style={styles.rating}>★ {venue.rating.toFixed(1)}</Text>
          {venue.distance && (
            <Text style={styles.distance}>{venue.distance}</Text>
          )}
        </View>
      </View>
    </View>
  );
}