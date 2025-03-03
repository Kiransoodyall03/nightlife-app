// LocationGroups.tsx
import React from 'react';
import { View, Text, FlatList, Image, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { styles } from './styles';

// Types
interface MatchedUser {
  id: string;
  profileImage: string;
}

interface Location {
  id: string;
  name: string;
  rating: number;
  distance: number;
  image: string;
  matchedUsers: MatchedUser[];
  partnerType: string;
  extraUserCount?: number;
}

const LocationGroups: React.FC = () => {
  const locations: Location[] = [
    // Keep your existing sample data
    {
      id: '1',
      name: "Jo'Anna MeltBar",
      rating: 4.7,
      distance: 5,
      image: 'https://via.placeholder.com/100',
      matchedUsers: [
        { id: 'u1', profileImage: 'https://via.placeholder.com/50/FF0000' },
        { id: 'u2', profileImage: 'https://via.placeholder.com/50/0000FF' }
      ],
      partnerType: 'Uber'
    },
    {
      id: '2',
      name: "Jo'Anna MeltBar",
      rating: 4.7,
      distance: 5,
      image: 'https://via.placeholder.com/100',
      matchedUsers: [
        { id: 'u1', profileImage: 'https://via.placeholder.com/50/FF0000' },
        { id: 'u2', profileImage: 'https://via.placeholder.com/50/0000FF' },
        { id: 'u3', profileImage: 'https://via.placeholder.com/50/00FF00' }
      ],
      partnerType: 'Uber'
    },
    {
      id: '3',
      name: "Jo'Anna MeltBar",
      rating: 4.7,
      distance: 5,
      image: 'https://via.placeholder.com/100',
      matchedUsers: [
        { id: 'u1', profileImage: 'https://via.placeholder.com/50/FF0000' },
        { id: 'u2', profileImage: 'https://via.placeholder.com/50/0000FF' }
      ],
      partnerType: 'Uber'
    },
    {
      id: '4',
      name: "Jo'Anna MeltBar",
      rating: 4.7,
      distance: 5,
      image: 'https://via.placeholder.com/100',
      matchedUsers: [
        { id: 'u1', profileImage: 'https://via.placeholder.com/50/FF0000' },
        { id: 'u2', profileImage: 'https://via.placeholder.com/50/0000FF' },
        { id: 'u3', profileImage: 'https://via.placeholder.com/50/00FF00' }
      ],
      partnerType: 'Uber',
      extraUserCount: 3
    },
    {
      id: '5',
      name: "Jo'Anna MeltBar",
      rating: 4.7,
      distance: 5,
      image: 'https://via.placeholder.com/100',
      matchedUsers: [
        { id: 'u1', profileImage: 'https://via.placeholder.com/50/FF0000' },
        { id: 'u2', profileImage: 'https://via.placeholder.com/50/0000FF' },
        { id: 'u3', profileImage: 'https://via.placeholder.com/50/00FF00' }
      ],
      partnerType: 'Uber',
      extraUserCount: 3
    },
    {
      id: '6',
      name: "Jo'Anna MeltBar",
      rating: 4.7,
      distance: 5,
      image: 'https://via.placeholder.com/100',
      matchedUsers: [
        { id: 'u1', profileImage: 'https://via.placeholder.com/50/FF0000' },
        { id: 'u2', profileImage: 'https://via.placeholder.com/50/0000FF' },
        { id: 'u3', profileImage: 'https://via.placeholder.com/50/00FF00' }
      ],
      partnerType: 'Uber',
      extraUserCount: 3
    },
    {
      id: '7',
      name: "Jo'Anna MeltBar",
      rating: 4.7,
      distance: 5,
      image: 'https://via.placeholder.com/100',
      matchedUsers: [
        { id: 'u1', profileImage: 'https://via.placeholder.com/50/FF0000' },
        { id: 'u2', profileImage: 'https://via.placeholder.com/50/0000FF' },
        { id: 'u3', profileImage: 'https://via.placeholder.com/50/00FF00' }
      ],
      partnerType: 'Uber',
      extraUserCount: 3
    },
    {
      id: '8',
      name: "Jo'Anna MeltBar",
      rating: 4.7,
      distance: 5,
      image: 'https://via.placeholder.com/100',
      matchedUsers: [
        { id: 'u1', profileImage: 'https://via.placeholder.com/50/FF0000' },
        { id: 'u2', profileImage: 'https://via.placeholder.com/50/0000FF' },
        { id: 'u3', profileImage: 'https://via.placeholder.com/50/00FF00' }
      ],
      partnerType: 'Uber',
      extraUserCount: 3
    }
  ];

  const openUberApp = () => {
    Linking.openURL('uber://').catch(() => Linking.openURL('https://www.uber.com/'));
  };

  const MatchedLocationsScroll = () => (
    <View style={styles.matchedLocationsContainer}>
      <Text style={styles.sectionTitle}>Your Matched Locations</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollContent}>
        {locations.map((location) => (
          <TouchableOpacity key={location.id} style={styles.locationCircleContainer}>
            <Image source={{ uri: location.image }} style={styles.locationCircleImage} />
            <View style={styles.activeIndicator} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const MatchedUsersIcons = ({ users, extraCount }: { users: MatchedUser[], extraCount?: number }) => (
    <View style={styles.matchedUsersContainer}>
      {users.map((user, index) => (
        <Image key={user.id} source={{ uri: user.profileImage }}
          style={[styles.userProfileImage, { zIndex: users.length - index }]} />
      ))}
      {extraCount && (
        <View style={styles.extraCountContainer}>
          <Text style={styles.extraCountText}>+{extraCount}</Text>
        </View>
      )}
    </View>
  );

  const LocationItem = ({ item }: { item: Location }) => (
    <View style={styles.locationItemContainer}>
      <Image source={{ uri: item.image }} style={styles.locationImage} />
      
      <View style={styles.locationInfoContainer}>
        <Text style={styles.locationName}>{item.name}</Text>
        
        <View style={styles.metaContainer}>
          <View style={styles.ratingContainer}>
            <Image source={require('../../../assets/icons/star-icon.png')} 
              style={styles.starIcon} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <Text style={styles.distanceText}>{item.distance}km away</Text>
        </View>
        
        <View style={styles.footerContainer}>
          <MatchedUsersIcons users={item.matchedUsers} extraCount={item.extraUserCount} />
          <TouchableOpacity style={styles.uberButton} onPress={openUberApp}>
            <Text style={styles.uberButtonText}>{item.partnerType}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={locations}
        renderItem={({ item }) => <LocationItem item={item} />}
        keyExtractor={item => item.id}
        ListHeaderComponent={<MatchedLocationsScroll />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

export default LocationGroups;