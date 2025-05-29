import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { styles } from './styles';
import { useNotification } from 'src/components/Notification/NotificationContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import GroupCreateModal from '../../../src/components/createGroupModal/GroupCreateModal';
import { GroupData, LocationData } from 'src/services/auth/types';
import { db } from '../../../src/services/firebase/config'; // Add Firebase config import
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'; // Add Firestore imports
import { useUser } from 'src/context/UserContext';
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
  groupId: string;
}

// Extended GroupData interface to include group name display
interface UserGroup extends GroupData {
  groupName: string;
  groupPicture: string;
}

const GroupScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const { showSuccess, showError } = useNotification();
  // State management
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const {user, userData} = useUser();
    // Sample locations data (keeping existing structure)
  const locations: Location[] = [
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
      partnerType: 'Uber',
      groupId: 'g1'
    },
    {
      id: '2',
      name: "Craft Burger Co.",
      rating: 4.5,
      distance: 3,
      image: 'https://via.placeholder.com/100',
      matchedUsers: [
        { id: 'u1', profileImage: 'https://via.placeholder.com/50/FF0000' },
        { id: 'u2', profileImage: 'https://via.placeholder.com/50/0000FF' },
        { id: 'u3', profileImage: 'https://via.placeholder.com/50/00FF00' }
      ],
      partnerType: 'Uber',
      groupId: 'g1'
    },
    {
      id: '3',
      name: "Starbeans Coffee",
      rating: 4.3,
      distance: 2,
      image: 'https://via.placeholder.com/100',
      matchedUsers: [
        { id: 'u4', profileImage: 'https://via.placeholder.com/50/FF0000' },
        { id: 'u5', profileImage: 'https://via.placeholder.com/50/0000FF' }
      ],
      partnerType: 'Uber',
      groupId: 'g2'
    },
    // Add more locations as needed...
  ];

  // Fetch user's groups on component mount
  useEffect(() => {
    fetchUserGroups();
  }, []);

  const fetchUserGroups = async () => {
    if (!userData?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get user document to find their group IDs
      const userDocRef = doc(db, 'users', user?.uid || "");
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        console.log('User document not found');
        setUserGroups([]);
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      const groupIds = userData.groupIds || [];

      if (groupIds.length === 0) {
        setUserGroups([]);
        setLoading(false);
        return;
      }

      // Fetch all group documents for the user's groups
      const groupPromises = groupIds.map(async (groupId: string) => {
        const groupDocRef = doc(db, 'groups', groupId);
        const groupDoc = await getDoc(groupDocRef);
        
        if (groupDoc.exists()) {
          const groupData = groupDoc.data();
          return {
            groupId: groupDoc.id,
            groupName: groupData.groupName || 'Unnamed Group',
            groupPicture: groupData.groupPicture || 'https://via.placeholder.com/100',
            isActive: groupData.isActive || false,
            createdAt: groupData.createdAt?.toDate() || new Date(),
            members: groupData.members || [],
            filters: groupData.filtersId || []
          } as UserGroup;
        }
        return null;
      });

      const groupsData = await Promise.all(groupPromises);
      const validGroups = groupsData.filter(group => group !== null) as UserGroup[];
      
      setUserGroups(validGroups);
    } catch (error) {
      console.error('Error fetching user groups:', error);
      showError('Failed to load your groups');
      setUserGroups([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter locations based on selected group
  const filteredLocations = selectedGroupId 
    ? locations.filter(location => location.groupId === selectedGroupId)
    : locations;

  const openUberApp = () => {
    Linking.openURL('uber://').catch(() => Linking.openURL('https://www.uber.com/'));
  };

  const navigateToCreateGroup = () => {
    setIsModalVisible(true);
  };

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(prevId => prevId === groupId ? null : groupId);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const handleGroupCreated = () => {
    showSuccess('Group created successfully!');
    setIsModalVisible(false);
    // Refresh the groups list
    fetchUserGroups();
  };

  const GroupsScroll = () => (
    <View>
      <View style={styles.matchedLocationsContainer}>
        <Text style={styles.sectionTitle}>Your Groups</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#4A90E2" />
            <Text style={styles.loadingText}>Loading groups...</Text>
          </View>
        ) : userGroups.length > 0 ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {userGroups.map((group) => (
              <TouchableOpacity 
                key={group.groupId} 
                style={[
                  styles.groupItemContainer,
                  selectedGroupId === group.groupId && styles.selectedGroupContainer
                ]}
                onPress={() => handleGroupSelect(group.groupId)}
              >
                <View style={styles.locationCircleContainer}>
                  <Image 
                    source={{ uri: group.groupPicture || 'https://via.placeholder.com/100' }} 
                    style={styles.locationCircleImage} 
                  />
                  {group.isActive && <View style={styles.activeIndicator} />}
                </View>
                <Text style={styles.groupNameText} numberOfLines={1}>
                  {group.groupName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyGroupsContainer}>
            <Text style={styles.emptyGroupsText}>
              You haven't joined any groups yet
            </Text>
            <Text style={styles.emptyGroupsSubtext}>
              Create your first group to get started!
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.createGroupButtonContainer}>
        <TouchableOpacity 
          style={styles.createGroupButton}
          onPress={navigateToCreateGroup}
        >
          <Text style={styles.createGroupButtonText}>Create Group</Text>
        </TouchableOpacity>
      </View>
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
        data={filteredLocations}
        renderItem={({ item }) => <LocationItem item={item} />}
        keyExtractor={item => item.id}
        ListHeaderComponent={<GroupsScroll />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>
              {selectedGroupId 
                ? "No locations available for the selected group" 
                : "No locations available"
              }
            </Text>
          </View>
        }
      />
      
      <GroupCreateModal
        visible={isModalVisible}
        onClose={handleModalClose}
        onGroupCreated={handleGroupCreated}
      />
    </View>
  );
};

export default GroupScreen;