import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Dimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from 'src/services/firebase/config';

interface GroupData {
  groupId: string;
  groupName: string;
  groupPicture: string;
  isActive: boolean;
  createdAt: Date;
  ownerId: string;
  groupCode: string;
  members: string[];
  filtersId: string[];
}

interface GroupDropdownProps {
  userId: string;
  onGroupSelect: (selection: { groupId: string; groupName: string; filtersId: string[] }) => void;
  selectedGroupId?: string;
  showError?: (message: string) => void;
  buttonStyle?: ViewStyle;
  buttonTextStyle?: TextStyle;
}

const GroupDropdown: React.FC<GroupDropdownProps> = ({
  userId,
  onGroupSelect,
  selectedGroupId,
  showError,
  buttonStyle,
  buttonTextStyle
}) => {
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch groups function using your existing logic
  const fetchUserGroups = async (showLoader: boolean = true) => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      if (showLoader) {
        setLoading(true);
      }

      // Get user document to find their group IDs
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        console.log('User document not found');
        setGroups([]);
        return;
      }

      const userDocData = userDoc.data();
      const groupIds = userDocData.groupIds || [];

      console.log('User groupIds:', groupIds); // Debug log

      if (groupIds.length === 0) {
        setGroups([]);
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
            filtersId: groupData.filtersId || [],
            ownerId: groupData.ownerId || groupData.createdBy,
            groupCode: groupData.groupCode // Handle both field names
          } as GroupData;
        }
        return null;
      });

      const groupsData = await Promise.all(groupPromises);
      const validGroups = groupsData.filter(group => group !== null) as GroupData[];

      setGroups(validGroups);
      setError(null);
      
      // Update selected group if it's currently selected
      if (selectedGroupId) {
        const updatedSelectedGroup = validGroups.find(group => group.groupId === selectedGroupId);
        setSelectedGroup(updatedSelectedGroup || null);
      }
    } catch (error) {
      console.error('Error fetching user groups:', error);
      const errorMessage = 'Failed to load your groups';
      setError(errorMessage);
      if (showError) {
        showError(errorMessage);
      }
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };
 const openDropdown = useCallback(async () => {
    setIsDropdownOpen(true);
    await fetchUserGroups(true);
  }, [fetchUserGroups]);
  // Load groups on component mount and when userId changes
  useEffect(() => {
    if (userId) {
      fetchUserGroups();
    }
  }, [userId]);

  // Update selected group when selectedGroupId prop changes
  useEffect(() => {
    if (selectedGroupId && groups.length > 0) {
      const group = groups.find(g => g.groupId === selectedGroupId);
      setSelectedGroup(group || null);
    } else if (!selectedGroupId) {
      setSelectedGroup(null);
    }
  }, [selectedGroupId, groups]);

  const loadGroups = async () => {
    await fetchUserGroups(true);
  };

  const handleGroupSelect = (group: GroupData) => {
    setSelectedGroup(group);
    setIsDropdownOpen(false);
    onGroupSelect({
      groupId: group.groupId,
      groupName: group.groupName,
      filtersId: group.filtersId,
    });
  };

  const handlePersonalSelect = () => {
    setSelectedGroup(null);
    setIsDropdownOpen(false);
    onGroupSelect({
      groupId: '',
      groupName: 'Personal Filters',
      filtersId: [],
    });
  };

  const renderGroupItem = ({ item }: { item: GroupData }) => (
    <TouchableOpacity
      style={[
        styles.groupItem,
        selectedGroup?.groupId === item.groupId && styles.selectedGroupItem
      ]}
      onPress={() => handleGroupSelect(item)}
    >
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{item.groupName}</Text>
        <Text style={styles.memberCount}>
          {item.members.length} member{item.members.length !== 1 ? 's' : ''}
        </Text>
      </View>
      {selectedGroup?.groupId === item.groupId && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading && groups.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" />
        <Text style={styles.loadingText}>Loading groups...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.dropdownButton, buttonStyle]}
        onPress={openDropdown}
      >
        <Text style={[styles.dropdownButtonText, buttonTextStyle]}>
          {selectedGroup ? selectedGroup.groupName : 'Personal Preferences'}
        </Text>
        <Text style={[styles.dropdownArrow, buttonTextStyle]}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isDropdownOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsDropdownOpen(false)}
        >
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownTitle}>Select Group</Text>
            
            {/* Personal/Individual option */}
            <TouchableOpacity
              style={[
                styles.groupItem,
                !selectedGroup && styles.selectedGroupItem
              ]}
              onPress={handlePersonalSelect}
            >
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>Personal Preferences</Text>
                <Text style={styles.memberCount}>Just you</Text>
              </View>
              {!selectedGroup && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Groups list */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadGroups}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : groups.length > 0 ? (
              <FlatList
                data={groups}
                keyExtractor={(item) => item.groupId}
                renderItem={renderGroupItem}
                style={styles.groupsList}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <Text style={styles.noGroupsText}>No groups found</Text>
            )}

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    maxHeight: Dimensions.get('window').height * 0.6,
    width: Dimensions.get('window').width * 0.8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  groupsList: {
    maxHeight: 300,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedGroupItem: {
    backgroundColor: '#e3f2fd',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  memberCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2196f3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  noGroupsText: {
    textAlign: 'center',
    color: '#666',
    padding: 16,
    fontStyle: 'italic',
  },
});

export default GroupDropdown;