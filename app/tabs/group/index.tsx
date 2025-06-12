import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, ScrollView, TouchableOpacity, Linking, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { styles } from './styles';
import { useNotification } from 'src/components/Notification/NotificationContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import GroupCreateModal from '../../../src/components/createGroupModal/GroupCreateModal';
import { GroupData, LocationData } from 'src/services/auth/types';
import { db } from '../../../src/services/firebase/config';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { useUser } from 'src/context/UserContext';
import { useAuth } from 'src/services/auth/useAuth';
import GroupCodeModal from 'src/components/InviteModal';
import LeaveGroupModal from 'src/components/LeaveGroupModal';

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


const GroupScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const { showSuccess, showError } = useNotification();
  const { createGroup, joinGroup, leaveGroup, deleteGroup, error } = useAuth();
  // State management
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isGroupCodeModalVisible, setIsGroupCodeModalVisible] = useState(false);
  const [isLeaveGroupModalVisible, setIsLeaveGroupModalVisible] = useState(false);
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [joinGroupCode, setJoinGroupCode] = useState('');
  const [userGroups, setUserGroups] = useState<GroupData[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [joiningGroup, setJoiningGroup] = useState<boolean>(false);
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
  ];

  // Fetch user's groups on component mount
  useEffect(() => {
    fetchUserGroups();
  }, [userData?.uid]); // Added dependency to refetch when user changes

  const fetchUserGroups = async (showLoader: boolean = true) => {
    if (!userData?.uid && !user?.uid) {
      setLoading(false);
      return;
    }

    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      // Get user document to find their group IDs
      const userDocRef = doc(db, 'users', user?.uid || userData?.uid || "");
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        console.log('User document not found');
        setUserGroups([]);
        return;
      }

      const userDocData = userDoc.data();
      const groupIds = userDocData.groupIds || [];

      console.log('User groupIds:', groupIds); // Debug log

      if (groupIds.length === 0) {
        setUserGroups([]);
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
            filters: groupData.filtersId || [],
            ownerId: groupData.ownerId || groupData.createdBy,
            groupCode: groupData.groupCode// Handle both field names
          } as GroupData;
        }
        return null;
      });

      const groupsData = await Promise.all(groupPromises);
      const validGroups = groupsData.filter(group => group !== null) as GroupData[];
      
      console.log('Fetched groups:', validGroups); // Debug log
      setUserGroups(validGroups);
      
      // Update selected group if it's currently selected
      if (selectedGroupId) {
        const updatedSelectedGroup = validGroups.find(group => group.groupId === selectedGroupId);
        setSelectedGroup(updatedSelectedGroup || null);
      }
    } catch (error) {
      console.error('Error fetching user groups:', error);
      showError('Failed to load your groups');
      setUserGroups([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const navigateToJoinGroup = () => {
    setIsJoinModalVisible(true);
    setJoinGroupCode('');
  };

  const handleGroupSelect = (groupId: string) => {
    const newSelectedId = selectedGroupId === groupId ? null : groupId;
    setSelectedGroupId(newSelectedId);
    
    if (newSelectedId) {
      const group = userGroups.find(g => g.groupId === newSelectedId);
      setSelectedGroup(group || null);
    } else {
      setSelectedGroup(null);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const handleJoinModalClose = () => {
    setIsJoinModalVisible(false);
    setJoinGroupCode('');
  };

  const handleGroupCreated = async () => {
    showSuccess('Group created successfully!');
    setIsModalVisible(false);
    
    // Add a small delay to ensure Firestore has been updated
    setTimeout(async () => {
      await fetchUserGroups(false); // Don't show loading spinner for refresh
    }, 1000);
  };

  const handleJoinGroup = async () => {
    if (!joinGroupCode || joinGroupCode.length !== 6) {
      showError('Please enter a valid 6-digit group code');
      return;
    }

    setJoiningGroup(true);

    try {
      const result = await joinGroup(joinGroupCode);
      
      if (result.success) {
        showSuccess('Successfully joined the group!');
        handleJoinModalClose();
        
        // Refresh groups
        setTimeout(async () => {
          await fetchUserGroups(false);
        }, 1000);
      } else {
        showError(error || 'Failed to join group');
      }
    } catch (err) {
      showError('Failed to join group. Please try again.');
    } finally {
      setJoiningGroup(false);
    }
  };

 // ... existing code ...

const handleSendInvite = () => {
  if (selectedGroup) {
    setIsGroupCodeModalVisible(true);
    }
  };
const handleLeaveGroup = () => {
  if (selectedGroup){
    setIsLeaveGroupModalVisible(true);
  }
};
const handleCloseGroupCodeModal = () => {
  setIsGroupCodeModalVisible(false);
};
const handleCloseLeaveGroupModal = () => {
  setIsLeaveGroupModalVisible(false);
};

const handleDeleteGroup = () => {
  // Capture current selectedGroup to avoid staleness
  const groupToDelete = selectedGroup;
  if (!groupToDelete) return;

  const currentUserId = user?.uid || userData?.uid || "";
  const isOwner = groupToDelete.ownerId === currentUserId;

  if (!isOwner) {
    showError('Only the group owner can delete the group');
    return;
  }

  // Wrap in setTimeout
  setTimeout(() => {
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete "${groupToDelete.groupName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteGroup(groupToDelete.groupId);
              if (result.success) {
                showSuccess('Group deleted successfully');
                setSelectedGroupId(null);
                setSelectedGroup(null);
                setTimeout(async () => await fetchUserGroups(false), 1000);
              } else {
                showError(error || 'Failed to delete group');
              }
            } catch (err) {
              showError('Failed to delete group. Please try again.');
            }
          }
        }
      ]
    );
  }, 0);
};


  const onRefresh = async () => {
    await fetchUserGroups(false);
  };

  const isGroupOwner = (group: GroupData) => {
    const currentUserId = user?.uid || userData?.uid || "";
    return group.ownerId === currentUserId;
  };

  const GroupsScroll = () => (
    <View>
      <View style={styles.matchedLocationsContainer}>
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionTitle}>Your Groups</Text>
          <TouchableOpacity 
            onPress={onRefresh}
            disabled={refreshing}
            style={styles.refreshButton}
          >
            <Text style={styles.refreshButtonText}>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Text>
          </TouchableOpacity>
        </View>
        
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
                    style={[
                      styles.locationCircleImage,
                      selectedGroupId === group.groupId && styles.selectedLocationCircleImage
                    ]} 
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
      
      {/* Group Action Buttons */}
      <View style={styles.groupActionButtonsContainer}>
        {selectedGroup ? (
          // Show group management buttons when a group is selected
          <View style={styles.groupActionButtonsRow}>
            <TouchableOpacity 
              style={[styles.groupActionButton, styles.sendInviteButton]}
              onPress={handleSendInvite}
            >
              <Text style={styles.groupActionButtonText}>Send Invite</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.groupActionButton, styles.leaveGroupButton]}
              onPress={handleLeaveGroup}
            >
              <Text style={styles.groupActionButtonText}>Leave Group</Text>
            </TouchableOpacity>
            
            {isGroupOwner(selectedGroup) && (
              <TouchableOpacity 
                style={[styles.groupActionButton, styles.deleteGroupButton]}
                onPress={handleDeleteGroup}
              >
                <Text style={styles.groupActionButtonText}>Delete Group</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          // Show create/join buttons when no group is selected
          <View style={styles.createJoinButtonContainer}>
            <TouchableOpacity 
              style={styles.createGroupButton}
              onPress={navigateToCreateGroup}
            >
              <Text style={styles.createGroupButtonText}>Create Group</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.joinGroupButton}
              onPress={navigateToJoinGroup}
            >
              <Text style={styles.joinGroupButtonText}>Join Group</Text>
            </TouchableOpacity>
          </View>
        )}
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
        refreshing={refreshing}
        onRefresh={onRefresh}
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
      
      {/* Create Group Modal */}
      <GroupCreateModal
        visible={isModalVisible}
        onClose={handleModalClose}
        onGroupCreated={handleGroupCreated}
      />

      {/* Join Group Modal */}
      <Modal
        visible={isJoinModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleJoinModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.joinModalContainer}>
            <Text style={styles.joinModalTitle}>Join Group</Text>
            <Text style={styles.joinModalSubtitle}>
              Enter the 6-digit group code to join
            </Text>
            
            <TextInput
              style={styles.joinCodeInput}
              value={joinGroupCode}
              onChangeText={setJoinGroupCode}
              placeholder="Group Code"
              maxLength={6}
              autoCapitalize="characters"
              autoCorrect={false}
              keyboardType="default"
            />
            
            <View style={styles.joinModalButtonsContainer}>
              <TouchableOpacity 
                style={styles.joinModalCancelButton}
                onPress={handleJoinModalClose}
                disabled={joiningGroup}
              >
                <Text style={styles.joinModalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.joinModalJoinButton,
                  joiningGroup && styles.joinModalJoinButtonDisabled
                ]}
                onPress={handleJoinGroup}
                disabled={joiningGroup}
              >
                {joiningGroup ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.joinModalJoinButtonText}>Join</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <GroupCodeModal
        isVisible={isGroupCodeModalVisible}
        onClose={handleCloseGroupCodeModal}
        selectedGroup={selectedGroup}
      />
      <LeaveGroupModal
        isVisible={isLeaveGroupModalVisible}
        onClose={() => setIsLeaveGroupModalVisible(false)}
        selectedGroup={selectedGroup}
        onLeaveSuccess={() => {
          setSelectedGroupId(null);
          setSelectedGroup(null);
          fetchUserGroups(false); // Refresh groups without loader
          showSuccess('Successfully left the group');
        }}
      />
    </View>
  );
};

export default GroupScreen;