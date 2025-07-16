// src/screens/GroupScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Image as RNImage,
} from 'react-native';
import { styles } from './styles';
import { useNotification } from 'src/components/Notification/NotificationContext';
import { NavigationProp } from '@react-navigation/native';
import GroupCreateModal from 'src/components/createGroupModal/GroupCreateModal';
import MatchLocationList, { LocationDisplayData } from 'src/components/MatchedLocationList/index';
import { GroupData, MatchData } from 'src/services/auth/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from 'src/services/firebase/config';
import { useUser } from 'src/context/UserContext';
import { useAuth } from 'src/services/auth/useAuth';
import GroupCodeModal from 'src/components/InviteModal';
import LeaveGroupModal from 'src/components/LeaveGroupModal';

const GroupScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const { showSuccess, showError } = useNotification();
  const { createGroup, joinGroup, leaveGroup, deleteGroup, error, fetchUserMatches } = useAuth();
  const { user, userData } = useUser();

  // State
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
  const [matchLocations, setMatchLocations] = useState<LocationDisplayData[]>([]);
  const [loadingMatches, setLoadingMatches] = useState<boolean>(false);

  // Convert MatchData → LocationDisplayData
  const convertMatchesToLocations = (matches: MatchData[]): LocationDisplayData[] =>
    matches.map((m, i) => ({
      id: m.matchId || `match-${i}`,
      name: m.locationName || 'Unknown Location',
      rating: m.locationRating || 0,
      distance:
        typeof m.locationDistance === 'string'
          ? parseFloat(m.locationDistance) || 0
          : m.locationDistance || 0,
      image: m.locationImage || 'https://via.placeholder.com/100',
      matchedUsers: m.matchedUsers,
      partnerType: 'Uber',
      groupId: m.groupId,
      extraUserCount: Math.max(0, (m.matchedUsersCount || 0) - 3),
    }));

  // Fetch matches
  const fetchMatchLocations = async (showLoader = true) => {
    const uid = user?.uid || userData?.uid;
    if (!uid) return setLoadingMatches(false);
    try {
      if (showLoader) setLoadingMatches(true);
      const timeout = new Promise<never>((_, rej) =>
        setTimeout(() => rej(new Error('timeout')), 15000)
      );
      const data = (await Promise.race([fetchUserMatches(uid), timeout])) as MatchData[];
      setMatchLocations(
        Array.isArray(data) && data.length > 0
          ? convertMatchesToLocations(data)
          : []
      );
    } catch (err: any) {
      showError(
        err.message === 'timeout'
          ? 'Loading matches is taking too long.'
          : 'Failed to load match locations.'
      );
      setMatchLocations([]);
    } finally {
      setLoadingMatches(false);
    }
  };

  // Fetch groups
  const fetchUserGroups = async (showLoader = true) => {
    const uid = user?.uid || userData?.uid;
    if (!uid) return setLoading(false);
    try {
      showLoader ? setLoading(true) : setRefreshing(true);
      const userDoc = await getDoc(doc(db, 'users', uid));
      const groupIds: string[] = userDoc.exists() ? userDoc.data().groupIds || [] : [];
      if (!groupIds.length) return setUserGroups([]);
      const fetched = await Promise.all(
        groupIds.map(async (gid) => {
          const gdoc = await getDoc(doc(db, 'groups', gid));
          if (!gdoc.exists()) return null;
          const gd = gdoc.data();
          return {
            groupId: gdoc.id,
            groupName: gd.groupName,
            groupPicture: gd.groupPicture,
            isActive: gd.isActive,
            createdAt: gd.createdAt?.toDate(),
            members: gd.members,
            filters: gd.filtersId,
            ownerId: gd.ownerId || gd.createdBy,
            groupCode: gd.groupCode,
          } as GroupData;
        })
      );
      const valid = fetched.filter((g): g is GroupData => !!g);
      setUserGroups(valid);
      if (selectedGroupId) {
        setSelectedGroup(valid.find((g) => g.groupId === selectedGroupId) || null);
      }
    } catch {
      showError('Failed to load your groups');
      setUserGroups([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserGroups();
    fetchMatchLocations();
  }, [userData?.uid, user?.uid]);

  // Filtered matches
  const filteredLocations = matchLocations.filter((loc) =>
    selectedGroupId
      ? loc.groupId === selectedGroupId
      : userGroups.some((g) => g.groupId === loc.groupId)
  );

  // Handlers
  const onRefresh = async () => {
    await Promise.all([fetchUserGroups(false), fetchMatchLocations(false)]);
  };
  const openUberApp = () =>
    Linking.openURL('uber://').catch(() => Linking.openURL('https://www.uber.com/'));
  const handleGroupSelect = (gid: string) => {
    const next = gid === selectedGroupId ? null : gid;
    setSelectedGroupId(next);
    setSelectedGroup(
      next ? userGroups.find((g) => g.groupId === next) || null : null
    );
  };

  // Group list header
  const GroupsScroll = () => (
    <View>
      <View style={styles.matchedLocationsContainer}>
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionTitle}>Your Groups</Text>
          <TouchableOpacity onPress={onRefresh} disabled={refreshing} style={styles.refreshButton}>
            <Text style={styles.refreshButtonText}>{refreshing ? 'Refreshing...' : 'Refresh'}</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#4A90E2" />
            <Text style={styles.loadingText}>Loading groups...</Text>
          </View>
        ) : userGroups.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContent}>
            {userGroups.map((g) => (
              <TouchableOpacity
                key={g.groupId}
                style={[
                  styles.groupItemContainer,
                  selectedGroupId === g.groupId && styles.selectedGroupContainer,
                ]}
                onPress={() => handleGroupSelect(g.groupId)}
              >
                <View style={styles.locationCircleContainer}>
                  <RNImage
                    source={{ uri: g.groupPicture || 'https://via.placeholder.com/100' }}
                    style={[
                      styles.locationCircleImage,
                      selectedGroupId === g.groupId && styles.selectedLocationCircleImage,
                    ]}
                  />
                  {g.isActive && <View style={styles.activeIndicator} />}
                </View>
                <Text style={styles.groupNameText} numberOfLines={1}>
                  {g.groupName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyGroupsContainer}>
            <Text style={styles.emptyGroupsText}>You haven't joined any groups yet</Text>
            <Text style={styles.emptyGroupsText}>Create your first group to get started!</Text>
          </View>
        )}
      </View>

      <View style={styles.groupActionButtonsContainer}>
        {selectedGroup ? (
          <View style={styles.groupActionButtonsRow}>
            <TouchableOpacity style={[styles.groupActionButton, styles.sendInviteButton]} onPress={() => setIsGroupCodeModalVisible(true)}>
              <Text style={styles.groupActionButtonText}>Send Invite</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.groupActionButton, styles.leaveGroupButton]} onPress={() => setIsLeaveGroupModalVisible(true)}>
              <Text style={styles.groupActionButtonText}>Leave Group</Text>
            </TouchableOpacity>
            {selectedGroup.ownerId === (user?.uid || userData?.uid) && (
              <TouchableOpacity style={[styles.groupActionButton, styles.deleteGroupButton]} onPress={() => {
                Alert.alert(
                  'Delete Group',
                  `Are you sure you want to delete "${selectedGroup.groupName}"?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: async () => {
                      const res = await deleteGroup(selectedGroup.groupId);
                      if (res.success) {
                        showSuccess('Group deleted successfully');
                        setSelectedGroupId(null);
                        setSelectedGroup(null);
                        fetchUserGroups(false);
                        fetchMatchLocations(false);
                      } else showError(error || 'Failed to delete group');
                    }}
                  ]
                );
              }}>
                <Text style={styles.groupActionButtonText}>Delete Group</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.createJoinButtonContainer}>
            <TouchableOpacity style={styles.createGroupButton} onPress={() => setIsModalVisible(true)}>
              <Text style={styles.createGroupButtonText}>Create Group</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.joinGroupButton} onPress={() => setIsJoinModalVisible(true)}>
              <Text style={styles.joinGroupButtonText}>Join Group</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <GroupsScroll />

      <MatchLocationList
        locations={filteredLocations}
        loading={loading || loadingMatches}
        refreshing={refreshing}
        onRefresh={onRefresh}
        selectedGroupId={selectedGroupId}
        userGroups={userGroups}
        openUberApp={openUberApp}
      />

      {/* Create Group Modal */}
      <GroupCreateModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onGroupCreated={() => {
          showSuccess('Group created successfully!');
          setIsModalVisible(false);
          fetchUserGroups(false);
        }}
      />

      {/* Join Group Modal */}
      <Modal
        visible={isJoinModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsJoinModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.joinModalContainer}>
            <Text style={styles.joinModalTitle}>Join Group</Text>
            <Text style={styles.joinModalSubtitle}>Enter the 6-digit group code to join</Text>
            <TextInput
              style={styles.joinCodeInput}
              value={joinGroupCode}
              onChangeText={setJoinGroupCode}
              placeholder="Group Code"
              maxLength={6}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <View style={styles.joinModalButtonsContainer}>
              <TouchableOpacity style={styles.joinModalCancelButton} onPress={() => setIsJoinModalVisible(false)} disabled={joiningGroup}>
                <Text style={styles.joinModalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.joinModalJoinButton, joiningGroup && styles.joinModalJoinButtonDisabled]} onPress={async () => {
                setJoiningGroup(true);
                const res = await joinGroup(joinGroupCode);
                if (res.success) {
                  showSuccess('Successfully joined the group!');
                  setIsJoinModalVisible(false);
                  fetchUserGroups(false);
                  fetchMatchLocations(false);
                } else showError(error || 'Failed to join group');
                setJoiningGroup(false);
              }} disabled={joiningGroup}>
                {joiningGroup ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.joinModalJoinButtonText}>Join</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Invite & Leave Modals */}
      <GroupCodeModal isVisible={isGroupCodeModalVisible} onClose={() => setIsGroupCodeModalVisible(false)} selectedGroup={selectedGroup} />
      <LeaveGroupModal isVisible={isLeaveGroupModalVisible} onClose={() => setIsLeaveGroupModalVisible(false)} selectedGroup={selectedGroup} onLeaveSuccess={() => {
        showSuccess('Successfully left the group');
        setSelectedGroupId(null);
        setSelectedGroup(null);
        fetchUserGroups(false);
        fetchMatchLocations(false);
      }} />
    </View>
  );
};

export default GroupScreen;
