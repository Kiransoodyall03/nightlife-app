import { useState } from 'react';
import { handleLogin } from './login';
import { signInWithCredential, GoogleAuthProvider, UserCredential } from 'firebase/auth';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { addDoc, DocumentData, collection, doc, setDoc, updateDoc, GeoPoint, runTransaction, 
  query, where, getDoc, getDocs, arrayUnion, arrayRemove, deleteDoc, 
  limit} from 'firebase/firestore';
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

// Add this to your createLike function to track the complete flow
const createLikeWithComprehensiveDebug = async (likeData: LikeData): Promise<AuthResult> => {
  const debugSession = `DEBUG-${Date.now()}`;
  console.log(`🔥 === ${debugSession} START ===`);
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('📥 Input likeData:', JSON.stringify(likeData, null, 2));
  
  setError(null);

  try {
    const user = auth.currentUser;
    if (!user) {
      console.error(`${debugSession} ❌ User not authenticated`);
      throw new Error('User not authenticated');
    }
    
    console.log(`${debugSession} 👤 Authenticated user:`, user.uid);
    console.log(`${debugSession} 📧 User email:`, user.email);

    // STEP 1: Validate group
    console.log(`${debugSession} 🔍 STEP 1: Group validation`);
    const groupRef = doc(db, 'groups', likeData.groupId);
    const groupSnap = await getDoc(groupRef);
    
    if (!groupSnap.exists()) {
      console.error(`${debugSession} ❌ Group not found:`, likeData.groupId);
      throw new Error('Group not found');
    }
    
    const groupData = groupSnap.data();
    console.log(`${debugSession} 👥 Group members:`, groupData.members);
    console.log(`${debugSession} ✅ User is member:`, groupData.members?.includes(user.uid));
    
    if (!groupData.members?.includes(user.uid)) {
      console.error(`${debugSession} ❌ User not in group`);
      throw new Error('User not authorized to like in this group');
    }

    // STEP 2: Check duplicates
    console.log(`${debugSession} 🔍 STEP 2: Duplicate check`);
    const dupQuery = query(
      collection(db, 'likes'),
      where('userId', '==', user.uid),
      where('groupId', '==', likeData.groupId),
      where('locationId', '==', likeData.locationId)
    );
    
    const existingLikes = await getDocs(dupQuery);
    console.log(`${debugSession} 🔍 Existing likes by this user:`, existingLikes.size);
    
    if (!existingLikes.empty) {
      console.error(`${debugSession} ❌ Duplicate like found`);
      throw new Error('You have already liked this location in this group');
    }

    // STEP 3: Create like
    console.log(`${debugSession} 🔍 STEP 3: Creating like`);
    const likeRef = doc(collection(db, 'likes'));
    const likeDocData = {
      likeId: likeRef.id,
      groupId: likeData.groupId,
      userId: user.uid,
      locationId: likeData.locationId,
      locationName: likeData.locationName || 'Unknown Location',
      locationAddress: likeData.locationAddress || 'No address',
      locationRating: likeData.locationRating || 0,
      locationPicture: likeData.locationPicture || '',
      createdAt: new Date().toISOString()
    };
    
    console.log(`${debugSession} 📄 Like document:`, JSON.stringify(likeDocData, null, 2));
    
    await setDoc(likeRef, likeDocData);
    console.log(`${debugSession} ✅ Like created with ID:`, likeRef.id);

    // STEP 4: Query all likes for this location (CRITICAL STEP)
    console.log(`${debugSession} 🔍 STEP 4: Querying all likes for location`);
    const allLikesQuery = query(
      collection(db, 'likes'),
      where('groupId', '==', likeData.groupId),
      where('locationId', '==', likeData.locationId)
    );
    
    console.log(`${debugSession} 🔍 Query filters:`, {
      collection: 'likes',
      groupId: likeData.groupId,
      locationId: likeData.locationId
    });
    
    const allLikesSnap = await getDocs(allLikesQuery);
    const allLikes = allLikesSnap.docs;
    
    console.log(`${debugSession} 📊 CRITICAL: Found ${allLikes.length} total likes`);
    
    // Log each like in detail
    allLikes.forEach((likeDoc, index) => {
      const data = likeDoc.data();
      console.log(`${debugSession} 👍 Like ${index + 1}:`, {
        docId: likeDoc.id,
        userId: data.userId,
        groupId: data.groupId,
        locationId: data.locationId,
        locationName: data.locationName,
        createdAt: data.createdAt
      });
    });

    // STEP 5: Match creation decision
    console.log(`${debugSession} 🔍 STEP 5: Match creation decision`);
    if (allLikes.length >= 2) {
      console.log(`${debugSession} 🎉 MATCH CONDITION MET: ${allLikes.length} likes found`);
      
      const userIds = allLikes.map(doc => doc.data().userId);
      const uniqueUserIds = [...new Set(userIds)];
      
      console.log(`${debugSession} 👥 User IDs:`, userIds);
      console.log(`${debugSession} 👥 Unique User IDs:`, uniqueUserIds);
      
      if (uniqueUserIds.length >= 2) {
        console.log(`${debugSession} 🚀 Creating match with ${uniqueUserIds.length} unique users`);
        
        try {
          // Call the debug version of createOrUpdateMatch
          await createOrUpdateMatch(likeData, allLikes);
          console.log(`${debugSession} ✅ Match creation attempt completed`);
          
          // Verify match was created
          const verifyMatchQuery = query(
            collection(db, 'matches'),
            where('locationId', '==', likeData.locationId),
            where('groupId', '==', likeData.groupId)
          );
          
          const verifySnap = await getDocs(verifyMatchQuery);
          console.log(`${debugSession} 🔍 Verification: Found ${verifySnap.size} matches after creation`);
          
          if (verifySnap.size > 0) {
            console.log(`${debugSession} ✅ SUCCESS: Match verified in database`);
          } else {
            console.error(`${debugSession} ❌ ERROR: Match not found in database after creation!`);
          }
          
        } catch (matchError) {
          console.error(`${debugSession} ❌ Match creation error:`, matchError);
        }
      } else {
        console.log(`${debugSession} ℹ️ Only ${uniqueUserIds.length} unique users - need at least 2`);
      }
    } else {
      console.log(`${debugSession} ℹ️ Only ${allLikes.length} likes - need at least 2 for match`);
    }

    console.log(`${debugSession} ✅ LIKE CREATION SUCCESS`);
    return { success: true, likeId: likeRef.id };
    
  } catch (error) {
    console.error(`${debugSession} 💥 ERROR:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    setError(`Failed to create like: ${errorMessage}`);
    return { success: false, error: error as Error };
  } finally {
    console.log(`🔥 === ${debugSession} END ===`);
  }
};
const createOrUpdateMatch = async (likeData: LikeData, allGroupLikes?: any[]): Promise<void> => {
  console.log('🔥 === CREATE MATCH DEBUG START ===');
  console.log('📥 Received likeData for match:', likeData);
  console.log('📄 Received allGroupLikes:', allGroupLikes?.length || 0, 'documents');
  
  try {
    // Step 1: Check if match already exists
    console.log('🔍 Step 1: Checking for existing matches...');
    const matchQuery = query(
      collection(db, 'matches'),
      where('locationId', '==', likeData.locationId),
      where('groupId', '==', likeData.groupId)
    );
    
    console.log('🔍 Match query parameters:', {
      locationId: likeData.locationId,
      groupId: likeData.groupId
    });
    
    const existingMatches = await getDocs(matchQuery);
    console.log(`📊 Existing matches found: ${existingMatches.size}`);
    
    if (!existingMatches.empty) {
      console.log('ℹ️ Match already exists for this location and group');
      existingMatches.docs.forEach((matchDoc, index) => {
        const matchData = matchDoc.data();
        console.log(`  🎯 Existing Match ${index + 1}:`, {
          matchId: matchDoc.id,
          locationId: matchData.locationId,
          groupId: matchData.groupId,
          userIds: matchData.userIds,
          createdAt: matchData.createdAt
        });
      });
      console.log('⏭️ Skipping match creation - already exists');
      return;
    }
    
    console.log('✅ No existing matches found - proceeding with creation');

    // Step 2: Get all users who liked this location
    console.log('🔍 Step 2: Gathering user IDs who liked this location...');
    let userIds: string[] = [];
    
    if (allGroupLikes && allGroupLikes.length > 0) {
      console.log('📋 Using provided likes data...');
      userIds = allGroupLikes.map(likeDoc => {
        const data = likeDoc.data();
        console.log(`  👤 User from provided likes: ${data.userId}`);
        return data.userId;
      });
    } else {
      console.log('🔍 Querying for likes since none provided...');
      const likesQuery = query(
        collection(db, 'likes'),
        where('groupId', '==', likeData.groupId),
        where('locationId', '==', likeData.locationId)
      );
      
      console.log('🔍 Likes query parameters:', {
        groupId: likeData.groupId,
        locationId: likeData.locationId
      });
      
      const likesSnap = await getDocs(likesQuery);
      console.log(`📊 Found ${likesSnap.size} likes in query`);
      
      if (likesSnap.empty) {
        console.error('❌ ERROR: No likes found for this location/group combination!');
        console.log('🔍 This suggests the likes were not created properly');
        return;
      }
      
      userIds = likesSnap.docs.map(doc => {
        const data = doc.data();
        console.log(`  👤 User from query: ${data.userId}, created: ${data.createdAt}`);
        return data.userId;
      });
    }

    // Step 3: Validate user IDs
    console.log('🔍 Step 3: Validating user IDs...');
    console.log('👥 Raw userIds array:', userIds);
    
    if (userIds.length === 0) {
      console.error('❌ ERROR: No user IDs found!');
      return;
    }
    
    if (userIds.length < 2) {
      console.log('ℹ️ Only 1 user has liked this location - no match needed yet');
      console.log(`   User: ${userIds[0]}`);
      return;
    }

    // Remove duplicates and validate
    const uniqueUserIds = [...new Set(userIds)];
    console.log('👥 Unique userIds after deduplication:', uniqueUserIds);
    console.log(`📊 Match will be created with ${uniqueUserIds.length} users`);
    
    if (uniqueUserIds.length < 2) {
      console.log('ℹ️ After deduplication, less than 2 unique users - no match needed');
      return;
    }

    // Step 4: Prepare match document data
    console.log('🔍 Step 4: Preparing match document...');
    const matchRef = doc(collection(db, 'matches'));
    const matchDocData = {
      matchId: matchRef.id,
      locationId: likeData.locationId,
      locationName: likeData.locationName || 'Unknown Location',
      locationAddress: likeData.locationAddress || 'Address not available',
      locationRating: likeData.locationRating || 0,
      locationPicture: likeData.locationPicture || null,
      groupId: likeData.groupId,
      userIds: uniqueUserIds,
      matchedUsersCount: uniqueUserIds.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };
    
    console.log('📄 Match document to be created:', matchDocData);
    console.log('🆔 Match will be created with ID:', matchRef.id);

    // Step 5: Create the match document
    console.log('🔍 Step 5: Writing match document to Firestore...');
    await setDoc(matchRef, matchDocData);
    
    console.log('✅ Match document written successfully!');
    console.log('🎉 MATCH CREATED:', {
      matchId: matchRef.id,
      location: matchDocData.locationName,
      users: uniqueUserIds,
      group: likeData.groupId
    });

    // Step 6: Verify the match was created
    console.log('🔍 Step 6: Verifying match creation...');
    const verifySnap = await getDoc(matchRef);
    if (verifySnap.exists()) {
      console.log('✅ Match verification successful - document exists in Firestore');
      const verifyData = verifySnap.data();
      console.log('📄 Verified match data:', {
        matchId: verifyData.matchId,
        locationName: verifyData.locationName,
        userIds: verifyData.userIds,
        createdAt: verifyData.createdAt
      });
    } else {
      console.error('❌ ERROR: Match verification failed - document not found after creation!');
    }

  } catch (error) {
    console.error('💥 ERROR IN CREATE MATCH:', error);
    console.error('📍 Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    console.error('📍 Failed with likeData:', likeData);
    throw error;
  } finally {
    console.log('🔥 === CREATE MATCH DEBUG END ===');
  }
};

// Test functions to debug match creation issues
const debugMatchCreation = {
  
  // Test 1: Check if likes exist for a specific location/group
  async checkLikesForLocation(groupId: string, locationId: string) {
    console.log('🧪 TEST 1: Checking likes for location...');
    console.log('📍 Checking:', { groupId, locationId });
    
    try {
      const likesQuery = query(
        collection(db, 'likes'),
        where('groupId', '==', groupId),
        where('locationId', '==', locationId)
      );
      
      const likesSnap = await getDocs(likesQuery);
      console.log(`📊 Found ${likesSnap.size} likes for this location`);
      
      const likesData: any[] = [];
      likesSnap.forEach(doc => {
        const data = doc.data();
        likesData.push({
          docId: doc.id,
          userId: data.userId,
          createdAt: data.createdAt,
          locationName: data.locationName
        });
        console.log(`  👍 Like: User ${data.userId} at ${data.createdAt}`);
      });
      
      return likesData;
    } catch (error) {
      console.error('❌ Error checking likes:', error);
      return [];
    }
  },

  // Test 2: Check if matches exist for a location/group
  async checkMatchesForLocation(groupId: string, locationId: string) {
    console.log('🧪 TEST 2: Checking matches for location...');
    console.log('📍 Checking:', { groupId, locationId });
    
    try {
      const matchQuery = query(
        collection(db, 'matches'),
        where('locationId', '==', locationId),
        where('groupId', '==', groupId)
      );
      
      const matchSnap = await getDocs(matchQuery);
      console.log(`📊 Found ${matchSnap.size} matches for this location`);
      
      matchSnap.forEach(doc => {
        const data = doc.data();
        console.log(`  🎯 Match:`, {
          matchId: doc.id,
          locationName: data.locationName,
          userIds: data.userIds,
          createdAt: data.createdAt
        });
      });
      
      return matchSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('❌ Error checking matches:', error);
      return [];
    }
  },

  // Test 3: Simulate creating a second like and check if match gets created
  async simulateSecondLike(groupId: string, locationId: string, testUserId: string = 'test-user-2') {
    console.log('🧪 TEST 3: Simulating second like...');
    
    try {
      // First check existing likes
      const existingLikes = await this.checkLikesForLocation(groupId, locationId);
      
      if (existingLikes.length === 0) {
        console.error('❌ No existing likes found - create a first like before running this test');
        return;
      }
      
      if (existingLikes.length > 1) {
        console.log('ℹ️ Multiple likes already exist - checking if match exists...');
        await this.checkMatchesForLocation(groupId, locationId);
        return;
      }
      
      console.log('✅ Found 1 existing like - creating second like...');
      
      // Create a second like document
      const likeRef = doc(collection(db, 'likes'));
      const secondLikeData = {
        likeId: likeRef.id,
        groupId: groupId,
        userId: testUserId,
        locationId: locationId,
        locationName: existingLikes[0].locationName || 'Test Location',
        locationAddress: 'Test Address',
        locationRating: 4.5,
        locationPicture: null,
        createdAt: new Date().toISOString()
      };
      
      console.log('📄 Creating second like:', secondLikeData);
      await setDoc(likeRef, secondLikeData);
      console.log('✅ Second like created');
      
      // Now try to create a match
      console.log('🎯 Attempting to create match...');
      await createOrUpdateMatch({
        groupId: groupId,
        locationId: locationId,
        locationName: existingLikes[0].locationName || 'Test Location',
        locationAddress: 'Test Address',
        locationRating: 4.5,
        locationPicture: null,
      } as LikeData);
      
      // Check if match was created
      await this.checkMatchesForLocation(groupId, locationId);
      
    } catch (error) {
      console.error('❌ Error in simulation:', error);
    }
  },

  // Test 4: Check Firestore security rules
  async testFirestoreAccess() {
    console.log('🧪 TEST 4: Testing Firestore access...');
    
    try {
      // Test reading from collections
      console.log('🔍 Testing read access to likes collection...');
      const testLikesQuery = query(collection(db, 'likes'), limit(1));
      const likesTest = await getDocs(testLikesQuery);
      console.log('✅ Can read from likes collection');
      
      console.log('🔍 Testing read access to matches collection...');
      const testMatchesQuery = query(collection(db, 'matches'), limit(1));
      const matchesTest = await getDocs(testMatchesQuery);
      console.log('✅ Can read from matches collection');
      
      // Test writing to collections
      console.log('🔍 Testing write access to matches collection...');
      const testMatchRef = doc(collection(db, 'matches'));
      const testMatchData = {
        matchId: testMatchRef.id,
        locationId: 'test-location',
        groupId: 'test-group',
        userIds: ['test-user'],
        createdAt: new Date().toISOString(),
        isTest: true
      };
      
      await setDoc(testMatchRef, testMatchData);
      console.log('✅ Can write to matches collection');
      
      // Clean up test document
      await deleteDoc(testMatchRef);
      console.log('✅ Test document cleaned up');
      
    } catch (error) {
      console.error('❌ Firestore access error:', error);
      console.error('This might be a security rules issue');
    }
  },
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

      // Get all likes associated with this group
      const likesQuery = query(
        collection(db, 'likes'),
        where('groupId', '==', groupId)
      );
      const likesSnapshot = await getDocs(likesQuery);

      // Delete all likes associated with the group
      const deleteLikesPromises = likesSnapshot.docs.map(likeDoc => 
        deleteDoc(doc(db, 'likes', likeDoc.id))
      );

      // Remove group from all members' groupIds
      const members = groupData.members || [];
      const updateMembersPromises = members.map((memberId: string) => 
        updateDoc(doc(db, 'users', memberId), {
          groupIds: arrayRemove(groupId)
        })
      );

      // Remove group from current user's groupIds (in case they're not in members array)
      const updateCurrentUserPromise = updateDoc(doc(db, 'users', user.uid), {
        groupIds: arrayRemove(groupId)
      });

      // Execute all operations in parallel
      await Promise.all([
        ...deleteLikesPromises,
        ...updateMembersPromises,
        updateCurrentUserPromise
      ]);

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
    createLikeWithComprehensiveDebug,
    fetchUserMatches,
    signInWithGoogle,
    registerWithGoogle,
    signInOrRegisterWithGoogle,
  };
};