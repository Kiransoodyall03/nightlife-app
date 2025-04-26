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
  Switch,
  ActivityIndicator
} from 'react-native';
import { useUser } from 'src/context/UserContext';
import { GroupData, GooglePlace } from 'src/services/auth/types';
import { collection, doc, getDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from 'src/services/firebase/config';
import { styles } from './styles';
import { getGroupMatches, toggleActiveGroup } from 'src/services/auth/swipeMatchService';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';


// Location match interface
interface LocationMatch {
  locationId: string;
  groupId: string;
  matchCount: number;
  isMatch: boolean;
  locationDetails?: GooglePlace;
  likedBy: string[];
  name?: string;
  rating?: number;
  distance?: string;
  coverImage?: string;
  matchedMembers?: { uid: string; profilePicture: string }[];
}

const Group: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { userData, isGroupActive, toggleActiveGroup: toggleActiveGroupContext, refreshActiveGroups } = useUser();
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [allLocations, setAllLocations] = useState<LocationMatch[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<LocationMatch[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [memberProfiles, setMemberProfiles] = useState<Record<string, { profilePicture: string }>>({});
  const [processingToggle, setProcessingToggle] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    if (userData?.uid) {
      const groupsQuery = query(
        collection(db, 'groups'),
        where('members', 'array-contains', userData.uid)
      );
      
      setLoading(true);
      
      const unsubscribe = onSnapshot(groupsQuery, async (snapshot) => {
        const groupsData = snapshot.docs.map(doc => ({
          ...(doc.data() as GroupData),
          groupId: doc.id
        }));
        
        setGroups(groupsData);
        
        // Initialize processingToggle state for each group
        const toggleStates: Record<string, boolean> = {};
        groupsData.forEach(group => {
          toggleStates[group.groupId] = false;
        });
        setProcessingToggle(toggleStates);
        
        // Fetch all group matches
        await fetchAllGroupMatches(groupsData);
        
        setLoading(false);
      }, (error) => {
        console.error("Error fetching groups: ", error);
        setLoading(false);
      });
      
      return () => unsubscribe();
    }
  }, [userData]);
  
  // Refresh active groups when component mounts
  useEffect(() => {
    if (userData?.uid) {
      refreshActiveGroups();
    }
  }, [userData?.uid]);

  // Fetch matches for all groups
  const fetchAllGroupMatches = async (groups: GroupData[]) => {
    try {
      const allMatches: LocationMatch[] = [];
      
      for (const group of groups) {
        const matches = await getGroupMatches(group.groupId);
        
        // Transform matches to include member profile pictures
        const enhancedMatches = await Promise.all(
          matches.map(async match => {
            // Get profile pictures for users who liked this location
            const memberDetails = await fetchMemberProfiles(match.likedBy);
            
            // Create matched members array for UI
            const matchedMembers = match.likedBy.map(uid => ({
              uid,
              profilePicture: memberDetails[uid]?.profilePicture || 'https://via.placeholder.com/50'
            }));
            
            // Get distance (would need to calculate based on user location)
            const distance = match.locationDetails ? 
              calculateDistance(match.locationDetails.geometry.location) : 
              'N/A';
            
            return {
              ...match,
              name: match.locationDetails?.name || 'Unknown location',
              rating: match.locationDetails?.rating || 0,
              distance,
              coverImage: getCoverImage(match.locationDetails),
              matchedMembers
            };
          })
        );
        
        allMatches.push(...enhancedMatches);
      }
      
      setAllLocations(allMatches);
      
      // If a group is already selected, filter for that group
      if (selectedGroupId) {
        setFilteredLocations(allMatches.filter(loc => loc.groupId === selectedGroupId));
      } else {
        setFilteredLocations(allMatches);
      }
    } catch (error) {
      console.error('Error fetching group matches:', error);
    }
  };
  
  // Calculate distance (mock function - replace with actual calculation)
  const calculateDistance = (location: any) => {
    // You would replace this with actual distance calculation using user's location
    return Math.floor(Math.random() * 10) + 'km';
  };
  
  // Get cover image for a location
  const getCoverImage = (locationDetails?: GooglePlace) => {
    if (!locationDetails || !locationDetails.photos || locationDetails.photos.length === 0) {
      return 'https://via.placeholder.com/150';
    }
    
    const photoRef = locationDetails.photos[0].photo_reference;
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${process.env.EXPO_PUBLIC_GOOGLE_API_KEY}`;
  };
  
  // Fetch profile pictures for group members
  const fetchMemberProfiles = async (userIds: string[]) => {
    const profiles: Record<string, { profilePicture: string }> = {};
    
    for (const userId of userIds) {
      if (memberProfiles[userId]) {
        profiles[userId] = memberProfiles[userId];
      } else {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            profiles[userId] = { 
              profilePicture: userData.profilePicture || 'https://via.placeholder.com/50' 
            };
          }
        } catch (error) {
          console.error(`Error fetching user profile for ${userId}:`, error);
          profiles[userId] = { profilePicture: 'https://via.placeholder.com/50' };
        }
      }
    }
    
    // Update the cached profiles
    setMemberProfiles(prev => ({ ...prev, ...profiles }));
    
    return profiles;
  };

  // When selectedGroupId changes, filter the locations
  useEffect(() => {
    if (selectedGroupId) {
      const filtered = allLocations.filter(loc => loc.groupId === selectedGroupId);
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations(allLocations);
    }
  }, [selectedGroupId, allLocations]);

  // Handle tap on a group circle
  const handleGroupPress = (groupId: string) => {
    if (selectedGroupId === groupId) {
      // Clear filter if tapping the already selected group
      setSelectedGroupId(null);
    } else {
      setSelectedGroupId(groupId);
    }
  };
  
  // Handle toggle active group
  const handleToggleActiveGroup = async (groupId: string) => {
    if (!userData?.uid || processingToggle[groupId]) return;
    
    try {
      // Update processing state
      setProcessingToggle(prev => ({ ...prev, [groupId]: true }));
      
      // Toggle active status in Firestore
      const newActiveState = await toggleActiveGroupContext(groupId);
      
      // Refresh active groups in context
      await refreshActiveGroups();
      
      // Show feedback to user
      if (newActiveState) {
        Alert.alert('Group Activated', 'This group will now be used for discovery.');
      } else {
        Alert.alert('Group Deactivated', 'This group will no longer be used for discovery.');
      }
    } catch (error) {
      console.error('Error toggling active state:', error);
      Alert.alert('Error', 'Failed to update group status');
    } finally {
      // Update processing state
      setProcessingToggle(prev => ({ ...prev, [groupId]: false }));
    }
  };
  
  const handleManageFilters = (groupId: string) => {
    navigation.navigate('GroupFilter', { groupId });
  };

  // New function to navigate to invite screen
  const handleInviteMembers = (groupId: string) => {
    navigation.navigate('GroupInvite', { groupId });
  };

  // New function to navigate to join group screen
  const handleJoinGroup = () => {
    navigation.navigate('JoinGroup');
  };

  const renderGroupCircles = () => {
    if (groups.length === 0) {
      return (
        <View style={styles.groupsContainer}>
          <Text style={styles.groupsHeader}>Your Groups</Text>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.createGroupButton]}
              onPress={() => navigation.navigate('CreateGroup')}
            >
              <Text style={styles.actionButtonText}>Create Group</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.joinGroupButton]}
              onPress={handleJoinGroup}
            >
              <Text style={styles.actionButtonText}>Join Group</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    
    // If a group is selected, show only that group circle
    const groupsToShow = selectedGroupId ? groups.filter(g => g.groupId === selectedGroupId) : groups;
    
    return (
      <View style={styles.groupsContainer}>
        <Text style={styles.groupsHeader}>Your Groups</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.groupsScroll}>
          {groupsToShow.map(group => (
            <TouchableOpacity
              key={group.groupId}
              style={[
                styles.groupCircle,
                selectedGroupId === group.groupId && styles.groupCircleSelected,
                isGroupActive(group.groupId) && styles.activeGroupCircle
              ]}
              onPress={() => handleGroupPress(group.groupId)}
            >
              <Image
                source={{ 
                  uri: group.groupImage || 'https://via.placeholder.com/80' 
                }}
                style={styles.groupImage}
              />
              {isGroupActive(group.groupId) && (
                <View style={styles.activeIndicator}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#fff" />
                </View>
              )}
              <View style={styles.groupLabelContainer}>
                <Text style={styles.groupLabelText}>{group.groupName}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Conditional rendering based on whether a group is selected */}
        <View style={styles.buttonsContainer}>
          {selectedGroupId ? (
            // Invite Member button when a group is selected
            <TouchableOpacity
              style={[styles.actionButton, styles.inviteButton]}
              onPress={() => handleInviteMembers(selectedGroupId)}
            >
              <Text style={styles.actionButtonText}>Invite Members</Text>
            </TouchableOpacity>
          ) : (
            // Create Group button when no group is selected
            <TouchableOpacity
              style={[styles.actionButton, styles.createGroupButton]}
              onPress={() => navigation.navigate('CreateGroup')}
            >
              <Text style={styles.actionButtonText}>Create Group</Text>
            </TouchableOpacity>
          )}
          
          {/* Always show Join Group button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.joinGroupButton]}
            onPress={handleJoinGroup}
          >
            <Text style={styles.actionButtonText}>Join Group</Text>
          </TouchableOpacity>
        </View>
        
        {selectedGroupId && (
          <View style={styles.groupActionsContainer}>
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>
                Active for Discovery
              </Text>
              <Switch
                trackColor={{ false: '#ccc', true: '#4CAF50' }}
                thumbColor={isGroupActive(selectedGroupId) ? '#fff' : '#f4f3f4'}
                ios_backgroundColor="#ccc"
                onValueChange={() => handleToggleActiveGroup(selectedGroupId)}
                value={isGroupActive(selectedGroupId)}
                disabled={processingToggle[selectedGroupId]}
              />
            </View>
            
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => handleManageFilters(selectedGroupId)}
            >
              <MaterialCommunityIcons name="filter-variant" size={16} color="#fff" />
              <Text style={styles.filterButtonText}>Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // Render each location item - moved outside of renderGroupCircles
  const renderLocationItem = ({ item }: { item: LocationMatch }) => {
    const matchedMembers = item.matchedMembers || [];
    const totalMembers = matchedMembers.length;
    const shouldShowBadge = totalMembers > 3;
    // If there are more than 3 members, show only the first 2 images
    const imagesToShow = shouldShowBadge ? matchedMembers.slice(0, 2) : matchedMembers;
    // Extra count badge replaces the third image
    const extraCount = shouldShowBadge ? totalMembers - 2 : 0;
    
    return (
      <View style={styles.locationItem}>
        <View style={styles.locationInfo}>
          <Text style={styles.locationName}>{item.name}</Text>
          <Text style={styles.locationRating}>★ {item.rating?.toFixed(1)}</Text>
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
  
  // Loading state - moved outside of renderGroupCircles
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#BB86FC" />
        <Text style={{ color: '#fff', marginTop: 16 }}>Loading groups...</Text>
      </View>
    );
  }

  // Main component return - moved outside of renderGroupCircles
  return (
    <View style={styles.container}>
      
      {/* Top section: Group circles */}
      {renderGroupCircles()}
      
      {/* Locations List */}
      <FlatList
        data={filteredLocations}
        keyExtractor={(item) => item.locationId}
        renderItem={renderLocationItem}
        contentContainerStyle={styles.locationsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="emoticon-sad-outline" size={60} color="#666" />
            <Text style={styles.emptyText}>
              No matches found. Start swiping in Discover to find places!
            </Text>
            <TouchableOpacity
              style={styles.discoverNowButton}
              onPress={() => navigation.navigate('Discover')}
            >
              <Text style={styles.discoverNowButtonText}>Discover Now</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

export default Group;