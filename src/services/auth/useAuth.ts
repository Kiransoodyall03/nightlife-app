import { useState } from 'react';
import { handleLogin } from './login';
import { signInWithCredential, GoogleAuthProvider, UserCredential } from 'firebase/auth';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { addDoc, DocumentData, collection, doc, setDoc, updateDoc, GeoPoint, runTransaction, 
  query, where, getDoc, getDocs, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { AuthResult, AuthUser, MatchData,FilterData, UserContext, MatchedUser, GroupData, UserData, LikeData } from './types';
import { Group } from 'lucide-react-native';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const handleRegister = async (
    userData: AuthUser & { location: { address: string; latitude: number; longitude: number } }
  ): Promise<AuthResult> => {
    setLoading(true);
    setError(null);
  
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );
      const user = userCredential.user;
  
      // 2. Create location document - FIXED
      await setDoc(doc(db, 'user_locations', user.uid), {
        userId: user.uid,  // Added missing userId field
        coordinates: new GeoPoint(userData.location.latitude, userData.location.longitude),  // Changed to GeoPoint
        address: userData.location.address
      });
  
      // 3. Create user document
      await setDoc(doc(db, 'users', user.uid), {
        username: userData.username,
        email: userData.email,
        uid: user.uid,
        locationId: user.uid,
        searchRadius: 5,
        filterId: "",
        createdAt: new Date()
      });

      setUserData(prev => ({
        ...prev!,
        username: userData.username,
        email: userData.email,
        uid: user.uid,
        searchRadius: 5,
        filterId: "",
        profilePicture: "",
        locationId: user.uid,
      }));
  
      return { success: true, user };
    } catch (error) {
      setError('Registration failed: ' + (error as Error).message);
      return { success: false, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

const fetchGroups = async (userId: string): Promise<GroupData[]> => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Query groups where the user is either the owner or a member
    const groupsQuery = query(
      collection(db, 'groups'),
      where('members', 'array-contains', userId)
    );

    const groupsSnapshot = await getDocs(groupsQuery);
    
    if (groupsSnapshot.empty) {
      console.log('No groups found for user:', userId);
      return [];
    }

    // Map the documents to GroupData objects
    const groups: GroupData[] = [];
    
    groupsSnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Only include active groups (if isActive field exists)
      if (data.isActive !== false) {
        groups.push({
          groupId: doc.id,
          groupName: data.name || 'Unnamed Group',
          groupPicture: data.groupPicture || '',
          isActive: data.isActive !== false,
          createdAt: data.createdAt?.toDate() || new Date(),
          ownerId: data.ownerId || data.createdBy || '',
          groupCode: data.groupCode || '',
          // Optional fields
          members: data.members || [],
          filtersId: data.filtersId || []
        });
      }
    });

    // Sort groups by name for consistent display
    groups.sort((a, b) => a.groupName.localeCompare(b.groupName));

    console.log(`Fetched ${groups.length} groups for user ${userId}`);
    return groups;

  } catch (error) {
    console.error('Error fetching user groups:', error);
    throw new Error(`Failed to fetch groups: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

 const signInWithGoogle = async (idToken: string): Promise<UserData> => {
    // 1) create Firebase credential
    
    const credential = GoogleAuthProvider.credential(idToken);
    // 2) sign in
    const userCred: UserCredential = await signInWithCredential(auth, credential);
    const { uid, email, displayName, photoURL } = userCred.user;
    // 3) fetch Firestore user record
    const userDocRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) {
      throw new Error('No Firestore user found – call registerWithGoogle first.');
    }
    // 4) parse and return
    const data = userSnap.data() as DocumentData;
    const userData: UserData = {
      uid,
      email: email!,
      username: data.username,
      profilePicture: data.profilePicture ?? photoURL ?? '',
      searchRadius: data.searchRadius,
      createdAt: data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt,
      filterId: data.filterId,
      groupIds: data.groupIds ?? [],
    };
    setUserData(userData);
    return userData;
  };

  const registerWithGoogle = async (idToken: string): Promise<UserData> => {
    // 1) sign in same as above
    const credential = GoogleAuthProvider.credential(idToken);
    const userCred: UserCredential = await signInWithCredential(auth, credential);
    const { uid, email, displayName, photoURL } = userCred.user;

    // 2) build your initial UserData
    const newUser: UserData = {
      uid,
      email: email!,
      username: displayName || email!.split('@')[0],
      profilePicture: photoURL ?? '',
      searchRadius: 5,        // default radius
      createdAt: new Date(),
      filterId: '',
      groupIds: [],
    };

    // 3) write to Firestore
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, {
      username: newUser.username,
      email: newUser.email,
      uid: newUser.uid,
      profilePicture: newUser.profilePicture,
      searchRadius: newUser.searchRadius,
      filterId: newUser.filterId,
      groupIds: newUser.groupIds,
      createdAt: newUser.createdAt,
    });

    // 4) update local state and return
    setUserData(newUser);
    return newUser;
  };

  const signInOrRegisterWithGoogle = async (idToken: string) => {
    try {
      // Try to sign in (will throw if no Firestore record)
      return await signInWithGoogle(idToken);
    } catch (e) {
      // If “no Firestore user” error, go register path
      if ((e as Error).message.includes('No Firestore user')) {
        return await registerWithGoogle(idToken);
      }
      throw e;
    }

  };

  // This would go in your handleFilters function
  const handleFilters = async (filterData: FilterData): Promise<AuthResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      // Get current user data
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      const currentFilterId = userData?.filterId;
      
      let newFilterId;
      
      // If user already has a filter, update it
      if (currentFilterId && currentFilterId !== "") {
        await updateDoc(doc(db, 'filters', currentFilterId), {
          ...filterData,
          userId: user.uid,
          filterId: currentFilterId
        });
        newFilterId = currentFilterId;
      } else {
        // Create new filter
        const filterRef = doc(collection(db, 'filters'));
        await setDoc(filterRef, {
          ...filterData,
          userId: user.uid,
          filterId: filterRef.id
        });
        newFilterId = filterRef.id;
        
        // Update user document with new filterId
        await updateDoc(doc(db, 'users', user.uid), {
          filterId: filterRef.id
        });
      }
      
      // Important: Update local state to reflect the changes
      if (userData) {
        setUserData(prev => ({
          ...prev!,
          filterId: newFilterId
        }));
      }
      
      return { success: true, filterId: newFilterId };
    } catch (error) {
      const errorMessage = (error as Error).message;
      setError(`Filter update failed: ${errorMessage}`);
      return {
        success: false,
        error: new Error(`Filter Error: ${errorMessage}`)
      };
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (groupData: GroupData): Promise<AuthResult> => {
    setLoading(true);
    setError(null);
  
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
  
      // Create group document
      const groupRef = doc(collection(db, 'groups'));
      const groupId = groupRef.id;
      const createdAt = new Date();
      
      // Generate a 6-digit group code
      const groupCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
      await setDoc(groupRef, {
        groupid: groupId,
        groupName: groupData.groupName,
        groupCode: groupCode,
        members: [user.uid],
        groupPicture: groupData.groupPicture || null,
        filtersId: groupData.filtersId || [],
        createdAt: createdAt,
        isActive: false, // Initialize as inactive
        ownerId: user.uid // Track group owner
      });
  
      // Get current user document to check existing groups
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentGroups = userData.groupIds || []; // Use array instead of single groupId
        
        // Add new groupId to the array if not already present
        if (!currentGroups.includes(groupId)) {
          await updateDoc(userDocRef, {
            groupIds: [...currentGroups, groupId]
          });
        }
      } else {
        // If user document doesn't exist, create it with the new groupId
        await setDoc(userDocRef, {
          groupIds: [groupId],
          // Add other user fields as needed
        }, { merge: true });
      }
  
      return { success: true, groupId: groupId };
    } catch (error) {
      console.error('Group creation error:', error);
      setError('Group creation failed: ' + (error as Error).message);
      return { success: false, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const createLike = async (likeData: LikeData): Promise<AuthResult> => {
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // 1. Validate that the group exists and user has permission
      const groupRef = doc(db, 'groups', likeData.groupId);
      const groupSnap = await getDoc(groupRef);
      
      if (!groupSnap.exists()) {
        throw new Error('Group not found');
      }
      
      const groupData = groupSnap.data();
      // Check if user is member of the group (adjust field name as needed)
      if (!groupData.members?.includes(user.uid)) {
        throw new Error('User not authorized to like in this group');
      }

      // 2. Check for duplicate likes (same user, group, and location)
      const likesQuery = query(
        collection(db, 'likes'),
        where('userId', '==', user.uid),
        where('groupId', '==', likeData.groupId),
        where('locationId', '==', likeData.locationId)
      );
      
      const existingLikes = await getDocs(likesQuery);
      if (!existingLikes.empty) {
        throw new Error('You have already liked this location in this group');
      }

      // 3. Validate locationId format (basic Google Places place_id validation)
      if (!likeData.locationId || !likeData.locationId.startsWith('ChIJ')) {
        throw new Error('Invalid location ID format');
      }

      // 4. Check if other users in the same group have liked this location
      const groupLikesQuery = query(
        collection(db, 'likes'),
        where('groupId', '==', likeData.groupId),
        where('locationId', '==', likeData.locationId)
      );
      
      const groupLikesSnap = await getDocs(groupLikesQuery);
      const existingGroupLikes = groupLikesSnap.docs;

      // Create like document
      const likeRef = doc(collection(db, 'likes'));
      await setDoc(likeRef, {
        likeId: likeRef.id,
        groupId: likeData.groupId,
        userId: user.uid, // Always use authenticated user's ID for security
        locationId: likeData.locationId,
        createdAt: new Date().toISOString()
      });

      // 5. If there are existing likes for this location in the same group, create/update match
      if (existingGroupLikes.length > 0) {
        try {
          await createOrUpdateMatch(likeData);
        } catch (matchError) {
          console.error('Error creating match:', matchError);
          // Don't fail the like creation if match creation fails
        }
      }

      return { success: true, likeId: likeRef.id };
    } catch (error) {
      console.error('Error creating like:', error);
      setError(error instanceof Error ? error.message : 'Failed to create like. Please try again.');
      return { success: false, error: error as Error };
    }
  };

  // Helper function to create or update match documents
  const createOrUpdateMatch = async (likeData: LikeData): Promise<void> => {
    try {
      // Check if match already exists for this location and group
      const matchQuery = query(
        collection(db, 'matches'),
        where('locationId', '==', likeData.locationId),
        where('groupId', '==', likeData.groupId)
      );
      
      const existingMatches = await getDocs(matchQuery);
      
      if (!existingMatches.empty) {
        // Match already exists, no need to create another one
        console.log('Match already exists for this location and group');
        return;
      }

      // Create new match document using the venue data from DiscoverScreen
      const matchRef = doc(collection(db, 'matches'));
      await setDoc(matchRef, {
        matchId: matchRef.id,
        locationId: likeData.locationId,
        locationName: likeData.locationName || 'Unknown Location',
        locationAddress: likeData.locationAddress || 'Address not available',
        locationRating: likeData.locationRating || 0,
        locationPicture: likeData.locationPicture || 'https://picsum.photos/400/600',
        groupId: likeData.groupId,
        createdAt: new Date().toISOString()
      });

      console.log('Match created successfully:', matchRef.id);
    } catch (error) {
      console.error('Error in createOrUpdateMatch:', error);
      throw error;
    }
  };

  const joinGroup = async (groupCode: string): Promise<AuthResult> => {
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Find group by code
      const groupsRef = collection(db, 'groups');
      const q = query(groupsRef, where('groupCode', '==', groupCode.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Group not found. Please check the code and try again.');
        return { success: false, error: new Error('Group not found') };
      }

      const groupDoc = querySnapshot.docs[0];
      const groupData = groupDoc.data();

      // Check if user is already a member
      if (groupData.members && groupData.members.includes(user.uid)) {
        setError('You are already a member of this group');
        return { success: false, error: new Error('Already a member') };
      }

      // Add user to group members
      await updateDoc(doc(db, 'groups', groupDoc.id), {
        members: arrayUnion(user.uid)
      });

      // Add group to user's groupIds
      await updateDoc(doc(db, 'users', user.uid), {
        groupIds: arrayUnion(groupDoc.id)
      });

      return { success: true, groupId: groupDoc.id };
    } catch (error) {
      console.error('Error joining group:', error);
      setError('Failed to join group. Please try again.');
      return { success: false, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

const leaveGroup = async (groupId: string): Promise<AuthResult> => {
  setLoading(true);
  setError(null);

  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    if (!groupDoc.exists()) {
      throw new Error('Group not found');
    }

    const groupData = groupDoc.data();
    const currentMembers = groupData.members || [];
    
    // Check if user is actually a member of this group
    if (!currentMembers.includes(user.uid)) {
      throw new Error('User is not a member of this group');
    }

    // Remove user from group members
    await updateDoc(doc(db, 'groups', groupId), {
      members: arrayRemove(user.uid)
    });

    // Remove group from user's groupIds
    await updateDoc(doc(db, 'users', user.uid), {
      groupIds: arrayRemove(groupId)
    });

    // Check if this was the last member and delete group if empty
    if (currentMembers.length === 1) {
      // This user was the only member, so delete the group
      await deleteDoc(doc(db, 'groups', groupId));
      console.log('Group deleted as no members remain');
    }

    return { success: true };
  } catch (error) {
    console.error('Error leaving group:', error);
    setError('Failed to leave group. Please try again.');
    return { success: false, error: error as Error };
  } finally {
    setLoading(false);
  }
};

  const deleteGroup = async (groupId: string): Promise<AuthResult> => {
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Get group data to check ownership and get members
      const groupDoc = await getDoc(doc(db, 'groups', groupId));
      if (!groupDoc.exists()) {
        throw new Error('Group not found');
      }

      const groupData = groupDoc.data();
      
      // Check if user is the owner
      if (groupData.ownerId !== user.uid) {
        setError('Only the group owner can delete the group');
        return { success: false, error: new Error('Not authorized') };
      }

      // Remove group from all members' groupIds
      const members = groupData.members || [];
      const updatePromises = members.map((memberId: string) => 
        updateDoc(doc(db, 'users', memberId), {
          groupIds: arrayRemove(groupId)
        })
      );
      
      await Promise.all(updatePromises);

      // Delete the group document
      await deleteDoc(doc(db, 'groups', groupId));

      return { success: true };
    } catch (error) {
      console.error('Error deleting group:', error);
      setError('Failed to delete group. Please try again.');
      return { success: false, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const performLogin = async (email: string, password: string): Promise<AuthResult> => {
    setLoading(true);
    setError(null);

    try {
      const result = await handleLogin(email, password);

      if (!result.success) {
        setError(result.error?.message || 'Login failed');
      }

      return result;
    } catch (error) {
    //  console.error('Login error:', error);
      setError('An unexpected error occurred during login.');
      return { success: false, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

const fetchUserMatches = async (userId: string): Promise<MatchData[]> => {
  try {
    console.log('🔍 fetchUserMatches called with userId:', userId);

    // 1. Fetch the user doc
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      console.log('❌ User document not found');
      return [];
    }

    const userData = userSnap.data() as { groupIds?: string[] };
    const userGroupIds = userData.groupIds ?? [];

    if (userGroupIds.length === 0) {
      console.log('👥 User has no groups');
      return [];
    }

    // 2. Firestore allows at most 10 items in an "in" query, so chunk if needed
    const chunks: string[][] = [];
    for (let i = 0; i < userGroupIds.length; i += 10) {
      chunks.push(userGroupIds.slice(i, i + 10));
    }

    // 3. Run one query per chunk and accumulate
    const allMatches: MatchData[] = [];

    for (const chunk of chunks) {
      const matchesQ = query(
        collection(db, 'matches'),
        where('groupId', 'in', chunk)
      );
      const snap = await getDocs(matchesQ);

      snap.docs.forEach(docSnap => {
        const data = docSnap.data() as DocumentData;
  const userIdStrings: string[] = Array.isArray(data.userIds) ? data.userIds : [];
   const matchedUsers: MatchedUser[] = userIdStrings.map(uid => ({
    userId: uid,  
  id: uid,
profileImage:  'https://picsum.photos/200/300',}));

        allMatches.push({
          matchId: data.matchId || docSnap.id,
          groupId: data.groupId,
          locationId: data.locationId,
          locationName: data.locationName,
          locationImage: data.locationPicture, // original field name
          locationRating: data.locationRating,
          locationDistance: "5", // custom logic if you compute real distance
          locationAddress: data.locationAddress,
          locationTypes: Array.isArray(data.locationTypes) ? data.locationTypes : [],
          matchedUsers,
          matchedUsersCount: matchedUsers.length,
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          updatedAt: new Date(),
          isActive: data.isActive ?? true,
        });
      });
    }

    // 4. Sort descending by creation time
    return allMatches.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

  } catch (error) {
    console.error('Error fetching user matches:', error);
    return [];
  }
};

  return { 
    handleRegister, 
    performLogin, 
    loading, 
    error, 
    handleFilters, 
    createGroup, 
    joinGroup, 
    leaveGroup, 
    deleteGroup ,
    fetchGroups,
    createLike,
    fetchUserMatches,
    signInWithGoogle,
    registerWithGoogle,
    signInOrRegisterWithGoogle,
  };
};