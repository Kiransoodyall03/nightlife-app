// VenueCard.tsx - Fixed image cycling functionality
import React, { useState, useEffect } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, Pressable } from 'react-native';
import { X, RotateCw, Heart } from 'lucide-react-native';
import Button from '../Button';
import GradientView from '@assets/Gradient/GradientView';
import styles from './styles';

export interface Venue {
  id: string;
  name: string;
  image: string;
  images?: string[]; // Array of additional images
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
  selectedGroupName?: string;
}

export default function VenueCard({
  venue,
  onLike,
  onDislike,
  onRewind,
  selectedGroupName,
}: VenueCardProps) {
  // State to track current image index
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Create array of available images (main image + additional images, max 3)
  const availableImages = React.useMemo(() => {
    const images = [venue.image];
    if (venue.images && venue.images.length > 0) {
      images.push(...venue.images);
    }
    return images.slice(0, 3).filter(img => img && img.trim() !== ''); // Filter out empty/null images
  }, [venue.image, venue.images]);

  // Reset image index when venue changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [venue.id]);

  // Handle image cycling with better debugging
  const handleImageClick = () => {
    console.log('Image clicked!'); // Debug log
    console.log('Available images:', availableImages.length); // Debug log
    
    if (availableImages.length > 1) {
      setCurrentImageIndex((prevIndex) => {
        const nextIndex = prevIndex === availableImages.length - 1 ? 0 : prevIndex + 1;
        console.log(`Image index changed from ${prevIndex} to ${nextIndex}`); // Debug log
        return nextIndex;
      });
    }
  };

  // Get current image to display
  const currentImage = availableImages[currentImageIndex] || venue.image;

  // Process tags
  const tags = venue.tags || 
    venue.type
      .split(', ')
      .map(typeStr => typeStr.replace(/_/g, ' '))
      .filter(typeStr => !["point_of_interest", "point of interest", "establishment", "shopping mall", "atm", "finance", "store"].includes(typeStr))
      .slice(0, 3);
  
  return (
    <View style={styles.card}>
      <Pressable 
        onPress={handleImageClick}
        style={{ flex: 1 }}
        android_ripple={{ color: 'rgba(255,255,255,0.1)' }}
      >
        <ImageBackground 
          source={{ uri: currentImage }} 
          style={styles.image} 
          resizeMode="cover"
        >
          {/* Image indicator dots - only show if multiple images */}
          {availableImages.length > 1 && (
            <View style={styles.imageIndicator}>
              {availableImages.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicatorDot,
                    index === currentImageIndex && styles.activeDot
                  ]}
                />
              ))}
            </View>
          )}

          {/* Tap instruction for multiple images */}
          {availableImages.length > 1 && (
            <View style={styles.tapInstruction}>
              <Text style={styles.tapInstructionText}>Tap to cycle images</Text>
            </View>
          )}

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
              
              {/* Action buttons with better touch handling */}
              <View style={styles.actionButtons}>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation(); // Prevent image cycling when button is pressed
                    onDislike();
                  }}
                  style={({ pressed }) => [
                    styles.actionButton,
                    { backgroundColor: pressed ? '#FF6B60' : '#FF3B30' }
                  ]}
                >
                  <X color="#FFF" size={24} />
                </Pressable>
                
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation(); // Prevent image cycling when button is pressed
                    onRewind();
                  }}
                  style={({ pressed }) => [
                    styles.actionButton,
                    { backgroundColor: pressed ? '#FFD633' : '#FFCC00' }
                  ]}
                >
                  <RotateCw color="#000" size={24} />
                </Pressable>
                
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation(); // Prevent image cycling when button is pressed
                    onLike();
                  }}
                  style={({ pressed }) => [
                    styles.actionButton,
                    { backgroundColor: pressed ? '#4CD964' : '#34C759' }
                  ]}
                >
                  <Heart color="#FFF" size={24} />
                </Pressable>
              </View>
            </View>
          </GradientView>
        </ImageBackground>
      </Pressable>
    </View>
  );
}