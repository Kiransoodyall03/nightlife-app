// src/components/matchLocationList/MatchLocationList.tsx

import React from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import {  styles } from './styles';
import { GroupData, MatchedUser } from 'src/services/auth/types';

//
// Local display-friendly type: this is what `GroupScreen` should pass in
//
export interface LocationDisplayData {
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

interface Props {
  locations: LocationDisplayData[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  selectedGroupId: string | null;
  userGroups: GroupData[];
  openUberApp: () => void;
}

const MatchedUsersIcons = ({
  users,
  extraCount,
}: {
  users: MatchedUser[];
  extraCount?: number;
}) => (
  <View style={styles.matchedUsersContainer}>
    {users.map((user, index) => (
      <Image
        key={user.id}
        source={{ uri: user.profileImage }}
        style={[styles.userProfileImage, { zIndex: users.length - index }]}
      />
    ))}
    {extraCount !== undefined && extraCount > 0 && (
      <View style={styles.extraCountContainer}>
        <Text style={styles.extraCountText}>+{extraCount}</Text>
      </View>
    )}
  </View>
);

const LocationItem = ({
  item,
  openUberApp,
}: {
  item: LocationDisplayData;
  openUberApp: () => void;
}) => (
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
        <MatchedUsersIcons
          users={item.matchedUsers}
          extraCount={item.extraUserCount}
        />
        <TouchableOpacity style={styles.uberButton} onPress={openUberApp}>
          <Text style={styles.uberButtonText}>{item.partnerType}</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const EmptyStateComponent = ({
  loading,
  selectedGroupId,
  userGroups,
}: {
  loading: boolean;
  selectedGroupId: string | null;
  userGroups: any[];
}) => {
  if (loading) {
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
          ? 'No matches available for the selected group'
          : userGroups.length > 0
          ? 'No matches found across your groups'
          : 'Join a group to see matches'}
      </Text>
      {userGroups.length === 0 && (
        <Text style={styles.emptyStateText}>
          Create or join a group to start finding matches!
        </Text>
      )}
    </View>
  );
};

const MatchLocationList: React.FC<Props> = ({
  locations,
  loading,
  refreshing,
  onRefresh,
  selectedGroupId,
  userGroups,
  openUberApp,
}) => (
  <FlatList
    data={locations}
    renderItem={({ item }) => (
      <LocationItem item={item} openUberApp={openUberApp} />
    )}
    keyExtractor={(item) => item.id}
    ItemSeparatorComponent={() => <View style={styles.separator} />}
    refreshing={refreshing}
    onRefresh={onRefresh}
    ListEmptyComponent={
      <EmptyStateComponent
        loading={loading}
        selectedGroupId={selectedGroupId}
        userGroups={userGroups}
      />
    }
  />
);

export default MatchLocationList;
