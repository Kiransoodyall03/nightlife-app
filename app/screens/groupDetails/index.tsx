// GroupDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  FlatList, 
  TouchableOpacity, 
  ScrollView,
  Alert
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from 'src/services/firebase/config';
import { GroupData } from 'src/services/auth/types';
import { styles } from './styles'; // Your custom styling

type RootStackParamList = {
  GroupDetail: { groupId: string };
};

type GroupDetailScreenRouteProp = RouteProp<RootStackParamList, 'GroupDetail'>;

interface LocationMatch {
  locationId: string;
  name: string;
  rating: number;
  distance: string;
  matchedMembers: { uid: string; profilePicture: string }[];
  coverImage: string;
}

const GroupDetailScreen: React.FC = () => {
  const route = useRoute<GroupDetailScreenRouteProp>();
  const navigation = useNavigation();
  const [group, setGroup] = useState<GroupData | null>(null);
  const [matchedLocations, setMatchedLocations] = useState<LocationMatch[]>([]);

  const { groupId } = route.params;

  useEffect(() => {
    fetchGroup();
    fetchMatchedLocations();
  }, [groupId]);

  const fetchGroup = async () => {
    try {
      const groupDoc = await getDoc(doc(db, 'groups', groupId));
      if (groupDoc.exists()) {
        setGroup(groupDoc.data() as GroupData);
      }
    } catch (error) {
      console.error('Error fetching group:', error);
      Alert.alert('Error', 'Could not load group.');
    }
  };

  // Placeholder for matched locations.
  // In a real scenario, you'd fetch them from your matching logic / Firestore.
  const fetchMatchedLocations = async () => {
    // Example data. Replace with real logic.
    const mockLocations: LocationMatch[] = [
      {
        locationId: 'loc1',
        name: "Jo'Anna MeltBar",
        rating: 4.7,
        distance: '5km',
        matchedMembers: [
          { uid: '1', profilePicture: 'https://via.placeholder.com/50/FF0000' },
          { uid: '2', profilePicture: 'https://via.placeholder.com/50/00FF00' },
          { uid: '3', profilePicture: 'https://via.placeholder.com/50/0000FF' },
          { uid: '4', profilePicture: 'https://via.placeholder.com/50/FFFF00' },
        ],
        coverImage: 'https://via.placeholder.com/150',
      },
      // More locations...
    ];
    setMatchedLocations(mockLocations);
  };

  const handleUberPress = (location: LocationMatch) => {
    // Placeholder for now.
    // Later, you can open the Uber app or use an Uber API.
    Alert.alert('Uber Pressed', `Ordering an Uber for ${location.name}`);
  };

  const renderLocationItem = ({ item }: { item: LocationMatch }) => {
    let membersToShow: { uid: string; profilePicture: string }[] = [];
    let extraCount = 0;
    
    // If there are more than 3 matched members, show only the first 2, and then an extra count circle.
    if (item.matchedMembers.length > 3) {
      membersToShow = item.matchedMembers.slice(0, 2);
      extraCount = item.matchedMembers.length - 2;
    } else {
      membersToShow = item.matchedMembers;
    }
    
    return (
      <View style={styles.locationItem}>
        <Image source={{ uri: item.coverImage }} style={styles.coverImage} />
        <View style={styles.locationInfo}>
          <Text style={styles.locationName}>{item.name}</Text>
          <Text style={styles.locationRating}>⭐ {item.rating}</Text>
          <Text style={styles.locationDistance}>{item.distance}</Text>
        </View>
        <View style={styles.membersContainer}>
          {membersToShow.map((member, index) => (
            <Image
              key={member.uid}
              source={{ uri: member.profilePicture || 'https://via.placeholder.com/50' }}
              style={[styles.memberImage, { left: index * 20 }]}
            />
          ))}
          {extraCount > 0 && (
            <View
              style={[
                styles.memberImage,
                styles.extraCountContainer,
                { left: membersToShow.length * 20 },
              ]}
            >
              <Text style={styles.extraCountText}>+{extraCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.uberButton}
          onPress={() => Alert.alert('Uber', `Ordering an Uber for ${item.name}`)}
        >
          <Text style={styles.uberButtonText}>Uber</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  

  return (
    <View style={styles.container}>
      {/* Header with back arrow */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{group?.groupName || 'Group Detail'}</Text>
      </View>

      {/* Horizontal ScrollView of matched location covers */}
      <View style={styles.coverContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {matchedLocations.map(loc => (
            <Image
              key={loc.locationId}
              source={{ uri: loc.coverImage }}
              style={styles.coverImage}
            />
          ))}
        </ScrollView>
      </View>

      {/* List of matched locations */}
      <FlatList
        data={matchedLocations}
        keyExtractor={(item) => item.locationId}
        renderItem={renderLocationItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default GroupDetailScreen;
