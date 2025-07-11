// VenueCard.tsx - Refactored without dropdown
import React from 'react';
import { View, Text, ImageBackground } from 'react-native';
import { X, RotateCw, Heart } from 'lucide-react-native';
import Button from '../Button';
import GradientView from '@assets/Gradient/GradientView';
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
  // Remove dropdown props - they're no longer needed here
  selectedGroupName?: string; // Optional: if you want to display selected group name on card
}

export default function VenueCard({
  venue,
  onLike,
  onDislike,
  onRewind,
  selectedGroupName,
}: VenueCardProps) {
  // Process tags
  const tags = venue.tags || 
    venue.type
      .split(', ')
      .map(typeStr => typeStr.replace(/_/g, ' '))
      .filter(typeStr => !["point_of_interest", "point of interest", "establishment", "shopping mall", "atm", "finance", "store"].includes(typeStr))
      .slice(0, 3);
  
  return (
    <View style={styles.card}>
      <ImageBackground 
        source={{ uri: venue.image }} 
        style={styles.image} 
        resizeMode="cover"
      >
        <GradientView
          colors={['transparent', 'rgb(0, 0, 0)', 'rgb(0, 0, 0)']}
          style={styles.gradient}
        >
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{venue.name}</Text>
            
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
            <View style={styles.ratingDistanceContainer}>
              <Text style={styles.rating}>{venue.rating.toFixed(1)} ★</Text>
              {venue.distance && <Text style={styles.distance}>{venue.distance}</Text>}
            </View>
            
            <View style={styles.actionButtons}>
              <Button 
                onPress={onDislike} 
                variant="circle" 
                customStyle={{ backgroundColor: '#FF3B30', borderColor: '#FF3B30' }}
                icon={<X color="#FFF" size={24} />} 
              />
              <Button 
                onPress={onRewind} 
                variant="circle" 
                customStyle={{ backgroundColor: '#FFCC00', borderColor: '#FFCC00' }}
                icon={<RotateCw color="#000" size={24} />} 
              />
              <Button 
                onPress={onLike} 
                variant="circle" 
                customStyle={{ backgroundColor: '#34C759', borderColor: '#34C759' }}
                icon={<Heart color="#FFF" size={24} />} 
              />
            </View>
          </View>
        </GradientView>
      </ImageBackground>
    </View>
  );
}