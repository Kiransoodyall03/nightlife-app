// components/VenueCard/index.tsx
import React from 'react';
import { View, Text, Image, Dimensions } from 'react-native';
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
  onLike?: () => void;
  onDislike?: () => void;
  onReview?: () => void;
}

export default function VenueCard({ venue, onLike, onDislike, onReview }: VenueCardProps) {
  return (
    <View style={styles.card}>
      {/* Venue Image */}
      <Image
        source={{ uri: venue.image }}
        style={styles.image}
        resizeMode="cover"
        onError={(e) => console.log('Image Load Error:', e.nativeEvent.error)}
      />

      {/* Venue Information */}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{venue.name}</Text>
        
        {/* Tags Section */}
        {Array.isArray(venue.tags) && venue.tags.length > 0 && (
  <View style={styles.tagsContainer}>
    {venue.tags.map((tag) => (
      <View style={styles.tag} key={tag}>  {/* Key applied here for React */}
        <Text style={styles.tagText}>{tag}</Text>
      </View>
    ))}
  </View>
)}

        <Text style={styles.type}>{venue.type}</Text>
        <Text style={styles.description}>{venue.description}</Text>

        {/* Rating and Distance */}
        <View style={styles.footer}>
          <Text style={styles.rating}>★ {venue.rating.toFixed(1)}</Text>
          {venue.distance && (
            <Text style={styles.distance}>{venue.distance}</Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            onPress={onDislike}
            variant="danger"
            size="medium"
            icon={<X size={24} color="#DC3545" />}
          />
          <Button
            onPress={onReview}
            variant="secondary"
            size="medium"
            icon={<RotateCw size={24} color="#6C757D" />}
          />
          <Button
            onPress={onLike}
            variant="primary"
            size="medium"
            icon={<Heart size={24} color="#007AFF" />}
          />
        </View>
      </View>
    </View>
  );
}
