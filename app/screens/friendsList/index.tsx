import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import TitleComponent from 'src/components/Title-Dark/title-animated';
import { useUser } from 'src/context/UserContext';
import { StackNavigationProp } from '@react-navigation/stack';
import styles from './styles';

// Define types
interface Friend {
  id: string;
  name: string;
  picture: string | null;
  status: 'online' | 'offline';
}

type RootStackParamList = {
  FriendsList: undefined;
  Home: undefined;
  // Add other screens here
};

type FriendsListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FriendsList'>;

interface FriendsListScreenProps {
  navigation: FriendsListScreenNavigationProp;
}

// Mock data - replace with actual data fetching logic
const mockFriends: Friend[] = [
  { id: '1', name: 'Alex Johnson', picture: null, status: 'online' },
  { id: '2', name: 'Jamie Smith', picture: null, status: 'offline' },
  { id: '3', name: 'Taylor Reed', picture: null, status: 'online' },
  { id: '4', name: 'Jordan Blake', picture: null, status: 'offline' },
];

const FriendsListScreen: React.FC<FriendsListScreenProps> = ({ navigation }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const userData = useUser();
  
  useEffect(() => {
    // Replace with actual API call to fetch friends
    const fetchFriends = async (): Promise<void> => {
      try {
        // Simulate API call
        setTimeout(() => {
          setFriends(mockFriends);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching friends:', error);
        setLoading(false);
      }
    };
    
    fetchFriends();
  }, []);
  
  const renderFriendItem = ({ item }: { item: Friend }) => (
    <View style={styles.friendItem}>
      {item.picture ? (
        <Image source={{ uri: item.picture }} style={styles.friendAvatar} />
      ) : (
        <View style={styles.friendAvatarPlaceholder}>
          <Text style={styles.friendAvatarText}>{item.name.charAt(0)}</Text>
        </View>
      )}
      
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, 
            { backgroundColor: item.status === 'online' ? '#4CD964' : '#8E8E93' }]} />
          <Text style={styles.statusText}>{item.status === 'online' ? 'Online' : 'Offline'}</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.inviteButton}>
        <Text style={styles.inviteButtonText}>Invite</Text>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <TitleComponent text="My Friends" />
      </View>
      
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
        ) : friends.length > 0 ? (
          <FlatList
            data={friends}
            renderItem={renderFriendItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.friendsList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No friends yet</Text>
            <TouchableOpacity style={styles.addFriendButton}>
              <Text style={styles.addFriendButtonText}>Find Friends</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};


export default FriendsListScreen;