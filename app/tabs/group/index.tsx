import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useUser } from 'src/context/UserContext';
import { GroupData } from 'src/services/auth/types';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from 'src/services/firebase/config';
import {styles} from './styles';

// Dummy type for location matches – replace with your actual matching model.
interface LocationMatch {
  locationId: string;
  name: string;
  rating: number;
  distance: string;
  coverImage: string;
  // For filtering: assume each location belongs to one group (if matched by group)
  groupId?: string;
  // And possibly an array of matched member details
  matchedMembers: { uid: string; profilePicture: string }[];
}

const Group: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { userData } = useUser();
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [allLocations, setAllLocations] = useState<LocationMatch[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<LocationMatch[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Fetch user's groups (real-time listener)
  useEffect(() => {
    if (userData?.uid) {
      const groupsQuery = query(
        collection(db, 'groups'),
        where('members', 'array-contains', userData.uid)
      );
      const unsubscribe = onSnapshot(groupsQuery, (snapshot) => {
        const groupsData = snapshot.docs.map(doc => doc.data() as GroupData);
        setGroups(groupsData);
      }, (error) => {
        console.error("Error fetching groups: ", error);
      });
      return () => unsubscribe();
    }
  }, [userData]);

  // Dummy fetching of matched locations.
  useEffect(() => {
    // Replace this with your actual matched locations API/logic.
    const mockLocations: LocationMatch[] = [
      {
        locationId: 'loc1',
        name: "Jo'Anna MeltBar",
        rating: 4.7,
        distance: '5km',
        coverImage: 'https://via.placeholder.com/150',
        groupId: 'group1', // assume belongs to group1
        matchedMembers: [
          { uid: '1', profilePicture: 'https://via.placeholder.com/50/FF0000' },
          { uid: '2', profilePicture: 'https://via.placeholder.com/50/00FF00' },
          { uid: '3', profilePicture: 'https://via.placeholder.com/50/0000FF' },
          { uid: '4', profilePicture: 'https://via.placeholder.com/50/FFFF00' },
        ],
      },
      {
        locationId: 'loc2',
        name: "The Night Owl",
        rating: 4.5,
        distance: '3km',
        coverImage: 'https://via.placeholder.com/150',
        // No group filter assigned – shows in full list always.
        matchedMembers: [
          { uid: '5', profilePicture: 'https://via.placeholder.com/50/FFAA00' },
          { uid: '6', profilePicture: 'https://via.placeholder.com/50/AAFF00' },
        ],
      },
      {
        locationId: 'loc3',
        name: "Luna Lounge",
        rating: 4.8,
        distance: '2km',
        coverImage: 'https://via.placeholder.com/150',
        groupId: 'group2',
        matchedMembers: [
          { uid: '7', profilePicture: 'https://via.placeholder.com/50/FF00FF' },
          { uid: '8', profilePicture: 'https://via.placeholder.com/50/00FFFF' },
          { uid: '9', profilePicture: 'https://via.placeholder.com/50/000000' },
        ],
      },
    ];
    setAllLocations(mockLocations);
    setFilteredLocations(mockLocations);
  }, []);

  // When selectedGroupId changes, filter the locations.
  useEffect(() => {
    if (selectedGroupId) {
      const filtered = allLocations.filter(loc => loc.groupId === selectedGroupId);
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations(allLocations);
    }
  }, [selectedGroupId, allLocations]);

  // Handle tap on a group circle.
  const handleGroupPress = (groupId: string) => {
    if (selectedGroupId === groupId) {
      // Clear filter if tapping the already selected group.
      setSelectedGroupId(null);
    } else {
      setSelectedGroupId(groupId);
    }
  };

  // Render the top horizontal group circles.
  const renderGroupCircles = () => {
    if (groups.length === 0) return null;
    // If a group is selected, show only that group circle.
    const groupsToShow = selectedGroupId ? groups.filter(g => g.groupId === selectedGroupId) : groups;
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.groupsScroll}>
        {groupsToShow.map(group => (
          <TouchableOpacity
            key={group.groupId}
            style={[
              styles.groupCircle,
              selectedGroupId === group.groupId && styles.groupCircleSelected,
            ]}
            onPress={() => handleGroupPress(group.groupId)}
          >
            <Image
              source={{ uri: 'https://via.placeholder.com/80' }} // Replace with group image if available
              style={styles.groupImage}
            />
            <View style={styles.groupLabelContainer}>
              <Text style={styles.groupLabelText}>{group.groupName}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  // Render each location item
  const renderLocationItem = ({ item }: { item: LocationMatch }) => {
    const totalMembers = item.matchedMembers.length;
    const shouldShowBadge = totalMembers > 3;
    // If there are more than 3 members, show only the first 2 images.
    const imagesToShow = shouldShowBadge ? item.matchedMembers.slice(0, 2) : item.matchedMembers;
    // Extra count badge replaces the third image.
    const extraCount = shouldShowBadge ? totalMembers - 2 : 0;
    
    return (
      <View style={styles.locationItem}>
        <Image source={{ uri: item.coverImage }} style={styles.locationCover} />
        <View style={styles.locationInfo}>
          <Text style={styles.locationName}>{item.name}</Text>
          <Text style={styles.locationRating}>⭐ {item.rating}</Text>
          <Text style={styles.locationDistance}>{item.distance}</Text>
        </View>
        <View style={styles.membersContainer}>
          {imagesToShow.map((member, index) => (
            <Image
              key={member.uid}
              source={{ uri: member.profilePicture || 'https://via.placeholder.com/50' }}
              style={[styles.memberImage, { left: index * 20 }]}
            />
          ))}
          {shouldShowBadge && (
            <View
              style={[
                styles.extraCountContainer,
                { left: imagesToShow.length * 20 },
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
      {/* Top section: Group circles */}
      {renderGroupCircles()}
      
      {/* Section divider (optional) */}
      <View style={styles.divider} />

      {/* Locations List */}
      <FlatList
        data={filteredLocations}
        keyExtractor={(item) => item.locationId}
        renderItem={renderLocationItem}
        contentContainerStyle={styles.locationsList}
        ListEmptyComponent={<Text style={styles.emptyText}>No matches found.</Text>}
      />
    </View>
  );
};

export default Group;
