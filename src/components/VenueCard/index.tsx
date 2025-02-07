import React from 'react';
import { View, Text, Image } from 'react-native';
import { X, RotateCw, Heart } from 'lucide-react-native';
import Button from '../Button';
import styles from './styles';

export interface Venue {
  id: string;
  name: string;
  image: string;
  description: string;
  type: string;
  rating: number;
  distance?: string;
  tags?: string[];
}

interface VenueCardProps {
  venue: Venue;
  onLike: () => void;
  onDislike: () => void;
  onRewind: () => void;
}

export default function VenueCard({ venue, onLike, onDislike, onRewind }: VenueCardProps) {
  const types = venue.type.split(', ');
  for (let i = 0; i < types.length; i++) {
      if (types[i] === "point of interest" || types[i] === "establishment") {
          types.splice(i, 1);
          i--; 
      }
  }
  return (
    <View style={styles.card}>
      <Image source={{ uri: venue.image }} style={styles.image} resizeMode="cover" />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{venue.name}</Text>
        <View style={styles.typesContainer}>
          {types.map((type, index) => (
            <View key={index} style={styles.typeBox}>
              <Text style={styles.typeText}>{type}</Text>
            </View>
          ))}
        </View>
        <View style={styles.footer}>
          <Text style={styles.rating}>⭐ {venue.rating}</Text>
        </View>
        <View style={styles.actionButtons}>
          <Button onPress={onDislike} variant="danger" size="medium" icon={<X size={24} />} />
          <Button onPress={onRewind} variant="secondary" size="medium" icon={<RotateCw size={24} />} />
          <Button onPress={onLike} variant="primary" size="medium" icon={<Heart size={24} />} />
        </View>
      </View>
    </View>
  );
}
