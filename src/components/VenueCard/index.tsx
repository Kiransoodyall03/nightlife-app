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
  return (
    <View style={styles.card}>
      <Image source={{ uri: venue.image }} style={styles.image} resizeMode="cover" />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{venue.name}</Text>
        {venue.tags && venue.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {venue.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
        <Text style={styles.type}>{venue.type}</Text>
        <Text style={styles.description}>{venue.description}</Text>
        <View style={styles.footer}>
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
