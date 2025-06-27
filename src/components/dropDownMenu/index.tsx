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
import styles from './styles';

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
  onGroupSelect: (selection: { groupId: string; groupName: string; groupFilters: string[] }) => void;
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

  // Fetch groups function with enhanced filter collection
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
          
          // Enhanced filter collection with fallbacks and validation
          let filtersId: string[] = [];
          if (groupData.filtersId && Array.isArray(groupData.filtersId)) {
            filtersId = groupData.filtersId.filter((id: any) => typeof id === 'string' && id.trim() !== '');
          } else if (groupData.filters && Array.isArray(groupData.filters)) {
            // Fallback to 'filters' field if 'filtersId' doesn't exist
            filtersId = groupData.filters.filter((id: any) => typeof id === 'string' && id.trim() !== '');
          }

          console.log(`Group ${groupDoc.id} filters:`, filtersId); // Debug log

          return {
            groupId: groupDoc.id,
            groupName: groupData.groupName || 'Unnamed Group',
            groupPicture: groupData.groupPicture || 'https://via.placeholder.com/100',
            isActive: groupData.isActive || false,
            createdAt: groupData.createdAt?.toDate() || new Date(),
            members: groupData.members || [],
            filtersId: filtersId,
            ownerId: groupData.ownerId || groupData.createdBy,
            groupCode: groupData.groupCode // Handle both field names
          } as GroupData;
        }
        return null;
      });

      const groupsData = await Promise.all(groupPromises);
      const validGroups = groupsData.filter(group => group !== null) as GroupData[];

      console.log('Loaded groups with filters:', validGroups.map(g => ({ 
        id: g.groupId, 
        name: g.groupName, 
        filtersCount: g.filtersId.length,
        filters: g.filtersId 
      }))); // Debug log

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
    
    console.log('Selected group filters:', group.filtersId); // Debug log
    
    onGroupSelect({
      groupId: group.groupId,
      groupName: group.groupName,
      groupFilters: group.filtersId, // Ensure filters are passed
    });
  };

  const handlePersonalSelect = () => {
    setSelectedGroup(null);
    setIsDropdownOpen(false);
    
    console.log('Selected personal filters: []'); // Debug log
    
    onGroupSelect({
      groupId: '',
      groupName: 'Personal Filters',
      groupFilters: [], // Empty array for personal filters
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
        {/* Show filter count for debugging/info */}
        <Text style={styles.filterCount}>
          {item.filtersId.length} filter{item.filtersId.length !== 1 ? 's' : ''}
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
                <Text style={styles.filterCount}>Your personal filters</Text>
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
export default GroupDropdown;