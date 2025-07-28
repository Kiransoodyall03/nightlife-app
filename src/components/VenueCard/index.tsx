import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, X, RefreshCw, MapPin, Star } from 'lucide-react-native';
import styles from './styles';
const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.75;

export interface Venue {
  id: string;
  name: string;
  image: string;
  images?: string[];
  description: string;
  type: string;
  rating: number;
  distance?: string;
  tags?: string[];
}

interface VenueCardProps {
  venue?: Venue;
  onLike: () => void;
  onDislike: () => void;
  onRewind: () => void;
  selectedGroupName?: string;
}

export default function VenueCard({
  venue,
  onLike,
  onDislike,
  onRewind,
  selectedGroupName,
}: VenueCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const handleSwipe = (direction: 'left' | 'right') => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      direction === 'right' ? onLike() : onDislike();
    });
  };

  const nextImage = () => {
    if (venue?.images && venue.images.length > 0) {
      setImageIndex((imageIndex + 1) % (venue.images.length + 1));
    }
  };

  // Return placeholder if venue is undefined
  if (!venue) {
    return (
      <View style={[styles.card, styles.placeholderCard]}>
        <Text style={styles.placeholderText}>Loading venue...</Text>
      </View>
    );
  }

  const currentImage = imageIndex === 0 
    ? venue.image 
    : venue.images?.[imageIndex - 1];

  return (
    <Animated.View style={[
      styles.card, 
      { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }
    ]}>
      {/* Full Card Image Background */}
      <TouchableOpacity 
        activeOpacity={0.9} 
        style={styles.imageContainer}
        onPress={nextImage}
      >
        {currentImage ? (
          <Image 
            source={{ uri: currentImage }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.placeholderText}>No Image Available</Text>
          </View>
        )}
        
        {/* Gradient Overlay for bottom content */}
        <LinearGradient
          colors={['transparent', 'transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
          locations={[0, 0.4, 0.7, 1]}
          style={styles.gradientOverlay}
        />
        
        {/* Image Indicator */}
        {venue.images && venue.images.length > 0 && (
          <View style={styles.imageIndicator}>
            <Text style={styles.imageIndicatorText}>
              {imageIndex + 1}/{venue.images.length + 1}
            </Text>
          </View>
        )}

        {/* Venue Info Overlay */}
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {venue.name || 'Unnamed Venue'}
            </Text>
            <Text style={styles.age}>
              {venue.rating ? `${venue.rating.toFixed(1)} ★` : 'N/A'}
            </Text>
          </View>
          
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <MapPin size={16} color="rgba(255,255,255,0.9)" />
              <Text style={styles.detailText} numberOfLines={1}>
                {venue.distance || 'Unknown distance'}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Star size={16} color="rgba(255,255,255,0.9)" />
              <Text style={styles.detailText} numberOfLines={1}>
                {venue.type || 'Venue'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.description} numberOfLines={2}>
            {venue.description || 'No description available'}
          </Text>
          
          {selectedGroupName && (
            <View style={styles.groupTag}>
              <Text style={styles.groupTagText}>
                For {selectedGroupName}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons Overlay */}
        <View style={styles.actionBar}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.dislikeButton]}
            onPress={() => handleSwipe('left')}
          >
            <X size={28} color="#FF3B30" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.rewindButton]}
            onPress={onRewind}
          >
            <RefreshCw size={24} color="#FF9500" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.likeButton]}
            onPress={() => handleSwipe('right')}
          >
            <Heart size={28} color="#34C759" fill="#34C759" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}