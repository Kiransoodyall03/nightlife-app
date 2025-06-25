import { useState } from 'react';
import { handleLogin } from './login';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { addDoc, collection, doc, setDoc, updateDoc, GeoPoint, runTransaction, 
  query, where, getDoc, getDocs, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { AuthResult, AuthUser, FilterData, GroupData, UserData } from './types';
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
    fetchGroups
  };
};