import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import TitleComponent from 'src/components/Title-Dark/title-animated';
import { useUser
 } from 'src/context/UserContext';// Mock data - replace with actual data fetching logic
const mockFriends = [
  { id: '1', name: 'Alex Johnson', picture: null, status: 'online' },
  { id: '2', name: 'Jamie Smith', picture: null, status: 'offline' },
  { id: '3', name: 'Taylor Reed', picture: null, status: 'online' },
  { id: '4', name: 'Jordan Blake', picture: null, status: 'offline' },
];

const FriendsListScreen = ({ navigation }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const  userData  = useUser;
  
  useEffect(() => {
    // Replace with actual API call to fetch friends
    const fetchFriends = async () => {
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
  
  const renderFriendItem = ({ item }) => (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f4',
    paddingBottom: 15,
  },
  backButton: {
    marginRight: 20,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendsList: {
    paddingBottom: 20,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f4',
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  friendAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendAvatarText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Jaldi-Bold',
  },
  friendInfo: {
    flex: 1,
    marginLeft: 15,
  },
  friendName: {
    fontSize: 16,
    fontFamily: 'Jaldi-Bold',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Jaldi-Regular',
    color: '#8E8E93',
  },
  inviteButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  inviteButtonText: {
    color: 'white',
    fontFamily: 'Jaldi-Bold',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Jaldi-Regular',
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 20,
  },
  addFriendButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  addFriendButtonText: {
    color: 'white',
    fontFamily: 'Jaldi-Bold',
    fontSize: 16,
  },
});

export default FriendsListScreen;