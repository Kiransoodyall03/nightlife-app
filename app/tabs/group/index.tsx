import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Linking, 
  ActivityIndicator, 
  Modal, 
  TextInput, 
  Alert 
} from 'react-native';
import { styles } from './styles';
import { useNotification } from 'src/components/Notification/NotificationContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import GroupCreateModal from '../../../src/components/createGroupModal/GroupCreateModal';
import { GroupData, LocationData, MatchData } from 'src/services/auth/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../src/services/firebase/config';
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
  const { createGroup, joinGroup, leaveGroup, deleteGroup, error, fetchUserMatches } = useAuth();
  const { user, userData } = useUser();

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
  const [matchLocations, setMatchLocations] = useState<Location[]>([]);
  const [loadingMatches, setLoadingMatches] = useState<boolean>(false);

const convertMatchesToLocations = (matches: MatchData[]): Location[] => {
  console.log('🔄 Converting matches to locations...');
  console.log('🔄 Input matches:', matches);
  
  if (!matches || !Array.isArray(matches)) {
    console.log('❌ Invalid matches data:', matches);
    return [];
  }
  
  const locations = matches.map((match, index) => {
    console.log(`🔄 Processing match ${index}:`, match);
    
    const location = {
      id: match.matchId || `match-${index}`,
      name: match.locationName || 'Unknown Location',
      rating: match.locationRating || 0,
      distance: typeof match.locationDistance === 'string' 
        ? parseFloat(match.locationDistance) || 0 
        : match.locationDistance || 0,
      image: match.locationImage || 'https://via.placeholder.com/100',
      matchedUsers: match.matchedUsers || [],
      partnerType: 'Uber',
      groupId: match.groupId || '',
      extraUserCount: Math.max(0, (match.matchedUsersCount || 0) - 3)
    };
    
    console.log(`✅ Converted location ${index}:`, location);
    return location;
  });
  
  console.log('🔄 Final converted locations:', locations);
  return locations;
};
const fetchMatchLocations = async (showLoader: boolean = true) => {
  const currentUserId = user?.uid || userData?.uid;
  console.log('🔍 fetchMatchLocations START');
  console.log('🔍 user?.uid:', user?.uid);
  console.log('🔍 userData?.uid:', userData?.uid);
  console.log('🔍 final currentUserId:', currentUserId);
  
  if (!currentUserId) {
    console.log('❌ EARLY RETURN: No current user ID found');
    setLoadingMatches(false);
    return;
  }

  try {
    if (showLoader) {
      setLoadingMatches(true);
    }

    console.log('📡 About to call fetchUserMatches with userId:', currentUserId);
    
    // Check if fetchUserMatches function exists
    if (!fetchUserMatches) {
      console.error('❌ fetchUserMatches function is undefined!');
      throw new Error('fetchUserMatches function not available');
    }
    
    console.log('📡 fetchUserMatches function exists, calling now...');
    const userMatches = await fetchUserMatches(currentUserId);
    
    console.log('📊 fetchUserMatches COMPLETE');
    console.log('📊 Type of userMatches:', typeof userMatches);
    console.log('📊 Is array:', Array.isArray(userMatches));
    console.log('📊 Raw userMatches:', userMatches);
    console.log('📊 userMatches length:', userMatches?.length || 'undefined length');
    
    // Check if userMatches is null/undefined
    if (!userMatches) {
      console.log('⚠️ userMatches is null/undefined');
      setMatchLocations([]);
      return;
    }
    
    // Check if userMatches is not an array
    if (!Array.isArray(userMatches)) {
      console.log('⚠️ userMatches is not an array:', userMatches);
      setMatchLocations([]);
      return;
    }
    
    console.log('🔄 Converting matches to locations...');
    const locations = convertMatchesToLocations(userMatches);
    console.log('🗺️ Converted locations result:', locations);
    console.log('🗺️ Locations length:', locations?.length || 0);
    
    console.log('💾 Setting matchLocations state...');
    setMatchLocations(locations);
    console.log('✅ fetchMatchLocations COMPLETE');
    
  } catch (error) {
    console.error('💥 ERROR in fetchMatchLocations:');
    console.error('💥 Full error object:', error);
    
    showError('Failed to load match locations');
    setMatchLocations([]);
  } finally {
    console.log('🏁 fetchMatchLocations finally block');
    setLoadingMatches(false);
  }
};
  // Fetch user's groups
  const fetchUserGroups = async (showLoader: boolean = true) => {
    const currentUserId = user?.uid || userData?.uid;
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const userDocRef = doc(db, 'users', currentUserId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        console.log('User document not found');
        setUserGroups([]);
        return;
      }

      const userDocData = userDoc.data();
      const groupIds = userDocData.groupIds || [];

      if (groupIds.length === 0) {
        setUserGroups([]);
        return;
      }

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
            groupCode: groupData.groupCode
          } as GroupData;
        }
        return null;
      });

      const groupsData = await Promise.all(groupPromises);
      const validGroups = groupsData.filter(group => group !== null) as GroupData[];
      
      setUserGroups(validGroups);
      
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

  // Initialize data on component mount
  useEffect(() => {
    fetchUserGroups();
    fetchMatchLocations();
  }, [userData?.uid, user?.uid]);

  // Filter locations based on selected group
  const currentUserId = user?.uid || userData?.uid || "";
  const filteredLocations = selectedGroupId 
    ? (() => {
        const filtered = matchLocations.filter(location => location.groupId === selectedGroupId);
        console.log('🔍 Filtered by selected group:', filtered);
        return filtered;
      })()
    : (() => {
        const filtered = matchLocations.filter(location => {
          const belongsToUserGroup = userGroups.some(group => group.groupId === location.groupId);
          console.log(`🔍 Location ${location.id} belongs to user group:`, belongsToUserGroup);
          return belongsToUserGroup;
        });
        console.log('🔍 Filtered by user groups:', filtered);
        return filtered;
      })();

console.log('🎯 Final filtered locations:', filteredLocations);
  // Event handlers
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
    
    setTimeout(async () => {
      await fetchUserGroups(false);
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
        
        setTimeout(async () => {
          await fetchUserGroups(false);
          await fetchMatchLocations(false);
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

  const handleSendInvite = () => {
    if (selectedGroup) {
      setIsGroupCodeModalVisible(true);
    }
  };

  const handleLeaveGroup = () => {
    if (selectedGroup) {
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
    const groupToDelete = selectedGroup;
    if (!groupToDelete) return;

    const isOwner = groupToDelete.ownerId === currentUserId;

    if (!isOwner) {
      showError('Only the group owner can delete the group');
      return;
    }

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
                  setTimeout(async () => {
                    await fetchUserGroups(false);
                    await fetchMatchLocations(false);
                  }, 1000);
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
    await Promise.all([
      fetchUserGroups(false),
      fetchMatchLocations(false)
    ]);
  };

  const isGroupOwner = (group: GroupData) => {
    return group.ownerId === currentUserId;
  };

  // Components
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
            <Text style={styles.emptyGroupsText}>
              Create your first group to get started!
            </Text>
          </View>
        )}
      </View>
      
      {/* Group Action Buttons */}
      <View style={styles.groupActionButtonsContainer}>
        {selectedGroup ? (
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
        <Image 
          key={user.id} 
          source={{ uri: user.profileImage }}
          style={[styles.userProfileImage, { zIndex: users.length - index }]} 
        />
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
            <Image 
              source={require('../../../assets/icons/star-icon.png')} 
              style={styles.starIcon} 
            />
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

  const EmptyStateComponent = () => {
    if (loading || loadingMatches) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading matches...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyStateContainer}>
        <Text style={styles.emptyStateText}>
          {selectedGroupId 
            ? "No matches available for the selected group" 
            : userGroups.length > 0 
              ? "No matches found across your groups"
              : "Join a group to see matches"
          }
        </Text>
        {userGroups.length === 0 && (
          <Text style={styles.emptyStateText}>
            Create or join a group to start finding matches!
          </Text>
        )}
      </View>
    );
  };

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
        ListEmptyComponent={<EmptyStateComponent />}
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

      {/* Group Code Modal */}
      <GroupCodeModal
        isVisible={isGroupCodeModalVisible}
        onClose={handleCloseGroupCodeModal}
        selectedGroup={selectedGroup}
      />

      {/* Leave Group Modal */}
      <LeaveGroupModal
        isVisible={isLeaveGroupModalVisible}
        onClose={() => setIsLeaveGroupModalVisible(false)}
        selectedGroup={selectedGroup}
        onLeaveSuccess={() => {
          setSelectedGroupId(null);
          setSelectedGroup(null);
          fetchUserGroups(false);
          fetchMatchLocations(false);
          showSuccess('Successfully left the group');
        }}
      />
    </View>
  );
};

export default GroupScreen;