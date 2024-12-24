import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Heart, RotateCw, X } from 'lucide-react-native';
 // Replace with React Native compatible icons
import styles from './styles';

export interface Venue {
  id: string;
  name: string;
  image: string;
  description: string;
  type: string;
  rating: number;
  distance: string;
}

interface VenueCardProps {
  venue: Venue;
}

const VenueCard: React.FC<VenueCardProps> = ({ venue }) => {
  return (
    <View style={styles.card}>
      {/* Venue Image */}
      <Image source={{ uri: venue.image }} style={styles.image} />

      {/* Gradient Overlay */}
      <View style={styles.overlay} />

      {/* Venue Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{venue.name}</Text>
        <Text style={styles.type}>{venue.type}</Text>
        <Text style={styles.description}>{venue.description}</Text>
        <Text style={styles.distance}>Distance: {venue.distance}</Text>
        <Text style={styles.rating}>Rating: {venue.rating}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.button}>
          <X size={28} color="red" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <RotateCw size={28} color="yellow" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Heart size={28} color="green" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default VenueCard;
