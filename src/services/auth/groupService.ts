import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  setDoc, 
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { GroupData, GooglePlace, FilterData, UserData } from '../auth/types';

export interface JoinGroupResult {
  success: boolean;
  group?: GroupData;
  error?: string;
}

// Interface for location match data
export interface LocationMatchData {
  locationId: string;
  groupId: string;
  matchCount: number;
  matchThreshold: number;
  isMatch: boolean;
  likedBy: string[]; // Array of user IDs who liked this location
  matchTimestamp?: Date;
  locationDetails?: GooglePlace;
  createdAt?: Date;
}

/**
 * Create a new group
 */
export const createGroup = async (
  groupName: string, 
  creatorId: string,
  filterId: string = ''
): Promise<GroupData> => {
  try {
    // Create a new document reference
    const groupRef = doc(collection(db, 'groups'));
    const groupId = groupRef.id;
    
    // Generate an invite code
    const inviteCode = generateInviteCode();
    const inviteExpiry = new Date();
    inviteExpiry.setHours(inviteExpiry.getHours() + 24);
    
    // Create the group data
    const groupData: GroupData & {
      inviteCode: string;
      inviteExpiry: Date;
    } = {
      groupId,
      groupName,
      members: [creatorId],
      createdAt: new Date(),
      isActive: true,
      filterId,
      inviteCode,
      inviteExpiry
    };
    
    // Save to Firestore
    await setDoc(groupRef, {
      ...groupData,
      createdAt: serverTimestamp(),
      inviteExpiry: serverTimestamp()
    });
    
    // Set this group as active for the creator
    await updateDoc(doc(db, 'users', creatorId), {
      activeGroupIds: arrayUnion(groupId)
    });
    
    return groupData;
  } catch (error) {
    console.error('Error creating group:', error);
    throw new Error('Failed to create group');
  }
};

/**
 * Join a group using an invite code
 */
export const joinGroupByInviteCode = async (inviteCode: string): Promise<JoinGroupResult> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'You must be logged in to join a group' };
    }
    
    // Query for groups with this invite code
    const groupsQuery = query(
      collection(db, 'groups'),
      where('inviteCode', '==', inviteCode)
    );
    
    const snapshot = await getDocs(groupsQuery);
    
    if (snapshot.empty) {
      return { success: false, error: 'Invalid invite code' };
    }
    
    const groupDoc = snapshot.docs[0];
    const groupData = groupDoc.data() as GroupData & { inviteExpiry: any };
    
    // Check if invite has expired
    if (groupData.inviteExpiry) {
      const expiryDate = new Date(groupData.inviteExpiry.seconds * 1000);
      if (expiryDate < new Date()) {
        return { success: false, error: 'Invite code has expired' };
      }
    }
    
    // Check if user is already a member
    if (groupData.members.includes(user.uid)) {
      return { success: true, group: groupData };
    }
    
    // Add user to the group members
    await updateDoc(doc(db, 'groups', groupData.groupId), {
      members: arrayUnion(user.uid)
    });
    
    // Set this group as active for the user
    await updateDoc(doc(db, 'users', user.uid), {
      activeGroupIds: arrayUnion(groupData.groupId)
    });
    
    // Update the group data with the new member
    const updatedGroupData = {
      ...groupData,
      members: [...groupData.members, user.uid]
    };
    
    return { success: true, group: updatedGroupData };
  } catch (error) {
    console.error('Error joining group:', error);
    return { success: false, error: 'Failed to join group' };
  }
};

/**
 * Leave a group
 */
export const leaveGroup = async (groupId: string): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('You must be logged in to leave a group');
    }
    
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    
    if (!groupDoc.exists()) {
      throw new Error('Group not found');
    }
    
    const groupData = groupDoc.data() as GroupData;
    
    // Remove user from members array
    const updatedMembers = groupData.members.filter(id => id !== user.uid);
    
    await updateDoc(doc(db, 'groups', groupId), {
      members: updatedMembers
    });
    
    // Remove from active groups
    await updateDoc(doc(db, 'users', user.uid), {
      activeGroupIds: arrayRemove(groupId)
    });
    
    // If no members left, consider deleting or deactivating the group
    if (updatedMembers.length === 0) {
      await updateDoc(doc(db, 'groups', groupId), {
        isActive: false
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error leaving group:', error);
    return false;
  }
};

/**
 * Get all groups for a user
 */
export const getUserGroups = async (userId: string): Promise<GroupData[]> => {
  try {
    const groupsQuery = query(
      collection(db, 'groups'),
      where('members', 'array-contains', userId),
      where('isActive', '==', true)
    );
    
    const snapshot = await getDocs(groupsQuery);
    return snapshot.docs.map(doc => doc.data() as GroupData);
  } catch (error) {
    console.error('Error fetching user groups:', error);
    return [];
  }
};
  export const getActiveGroups = async (userId: string): Promise<GroupData[]> => {
    try {
      // Query for groups where user is a member and group is active
      const groupsQuery = query(
        collection(db, 'groups'),
        where('members', 'array-contains', userId),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(groupsQuery);
      
      // Get user's active groups
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return [];
      
      const userData = userDoc.data() as UserData & { activeGroupIds?: string[] };
      const activeGroupIds = userData.activeGroupIds || [];
      
      // Filter groups to only include active ones
      const activeGroups: GroupData[] = [];
      
      snapshot.docs.forEach(groupDoc => {
        const groupData = groupDoc.data() as GroupData;
        const groupId = groupDoc.id;
        
        if (activeGroupIds.includes(groupId)) {
          activeGroups.push({
            ...groupData,
            groupId
          });
        }
      });
      
      return activeGroups;
    } catch (error) {
      console.error('Error fetching active groups:', error);
      return [];
    }
  };
/**
 * Toggle a group as active/inactive for a user
 */
export const toggleActiveGroup = async (userId: string, groupId: string): Promise<boolean> => {
  try {
    // Verify the group exists and user is a member
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    if (!groupDoc.exists()) {
      throw new Error('Group not found');
    }
    
    const groupData = groupDoc.data() as GroupData;
    if (!groupData.members.includes(userId)) {
      throw new Error('User is not a member of this group');
    }
    
    // Get current active group IDs
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    const activeGroupIds = userData.activeGroupIds || [];
    
    // Check if group is already active
    const isCurrentlyActive = activeGroupIds.includes(groupId);
    
    if (isCurrentlyActive) {
      // Remove from active groups
      await updateDoc(doc(db, 'users', userId), {
        activeGroupIds: arrayRemove(groupId)
      });
    } else {
      // Add to active groups
      await updateDoc(doc(db, 'users', userId), {
        activeGroupIds: arrayUnion(groupId)
      });
    }
    
    return !isCurrentlyActive; // Return new active state
  } catch (error) {
    console.error('Error toggling active group:', error);
    throw error;
  }
};

/**
 * Get combined filters from all active groups
 */
  export const getCombinedGroupFilters = async (userId: string): Promise<string[]> => {
    try {
      console.log("Starting getCombinedGroupFilters for user:", userId);
      const activeGroups = await getActiveGroups(userId);
      
      if (activeGroups.length === 0) {
        console.log("No active groups found");
        return []; 
      }
      
      console.log(`Found ${activeGroups.length} active groups:`, activeGroups.map(g => g.groupId));
      
      const combinedFilters = new Set<string>();
      
      // Check each group's filter
      for (const group of activeGroups) {
        try {
          // CRITICAL FIX: Verify group.filterId exists and is not the user ID
          if (!group.filterId || group.filterId === userId) {
            console.log(`Group ${group.groupId} has invalid filterId: ${group.filterId}`);
            continue;
          }
          
          console.log(`Attempting to read filter ${group.filterId} for group ${group.groupId}`);
          
          const filterDoc = await getDoc(doc(db, 'filters', group.filterId));
          
          if (filterDoc.exists()) {
            const filterData = filterDoc.data() as FilterData;
            
            // Check if the filter document has the correct structure
            if (!filterData.groupId) {
              console.log(`Filter ${group.filterId} is missing groupId field, updating document`);
              try {
                // Update the document to add the groupId field
                await updateDoc(doc(db, 'filters', group.filterId), {
                  groupId: group.groupId
                });
                console.log(`Updated filter ${group.filterId} with groupId ${group.groupId}`);
              } catch (updateErr) {
                console.error(`Failed to update filter document:`, updateErr);
              }
            }
            
            // Add the filters to our set
            if (filterData.isFiltered && Array.isArray(filterData.filters)) {
              console.log(`Adding ${filterData.filters.length} filters from group ${group.groupId}`);
              filterData.filters.forEach(filter => combinedFilters.add(filter));
            } else {
              console.log(`Group ${group.groupId}'s filter has no filters or isFiltered=false`);
            }
          } else {
            console.log(`Filter ${group.filterId} doesn't exist`);
          }
        } catch (error: any) {
          console.error(`Error processing group ${group.groupId}:`, error);
          
          // Don't let one group's error stop the entire process
          continue;
        }
      }
      
      const resultArray = Array.from(combinedFilters);
      console.log(`Combined filters: ${resultArray.length} unique types`);
      
      return resultArray;
    } catch (error) {
      console.error("Error in getCombinedGroupFilters:", error);
      return []; // Return empty array on error
    }
  };


/**
 * Record a swipe for all active groups
 */
export const recordSwipe = async (location: GooglePlace, direction: 'left' | 'right'): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const userId = user.uid;
    const locationId = location.place_id;
    
    // Get user's active group IDs
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return false;
    
    const userData = userDoc.data();
    const activeGroupIds = userData.activeGroupIds || [];
    
    // First record the basic swipe (not group-specific)
    const swipeId = `${userId}_${locationId}`;
    await setDoc(doc(db, 'user_swipes', swipeId), {
      userId,
      locationId,
      direction,
      timestamp: serverTimestamp()
    });
    
    // If we have active groups and this is a right swipe, record for groups
    if (activeGroupIds.length > 0 && direction === 'right') {
      for (const groupId of activeGroupIds) {
        // Check if user is a member of this group
        const groupDoc = await getDoc(doc(db, 'groups', groupId));
        if (!groupDoc.exists()) continue;
        
        const groupData = groupDoc.data() as GroupData;
        if (!groupData.members.includes(userId)) continue;
        
        // Record the group-specific swipe
        const groupSwipeId = `${userId}_${locationId}_${groupId}`;
        await setDoc(doc(db, 'group_swipes', groupSwipeId), {
          userId,
          locationId,
          groupId,
          direction,
          timestamp: serverTimestamp()
        });
        
        // Update location matches
        await handleRightSwipe(userId, groupId, location);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error recording swipe:', error);
    return false;
  }
};

/**
 * Handle a right swipe (like) on a location for a group
 */
const handleRightSwipe = async (
  userId: string, 
  groupId: string, 
  location: GooglePlace
): Promise<void> => {
  try {
    const locationId = location.place_id;
    
    // Get the group to determine match threshold (default to majority)
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    if (!groupDoc.exists()) return;
    
    const groupData = groupDoc.data() as GroupData;
    const memberCount = groupData.members.length;
    
    // By default, a match occurs when majority of members like the location
    const defaultThreshold = Math.ceil(memberCount / 2);
    
    // Check if a location_match document already exists
    const matchDocRef = doc(db, 'location_matches', `${groupId}_${locationId}`);
    const matchDoc = await getDoc(matchDocRef);
    
    if (matchDoc.exists()) {
      // Update existing match document
      const matchData = matchDoc.data() as LocationMatchData;
      
      // Check if user already liked this location
      if (matchData.likedBy && matchData.likedBy.includes(userId)) {
        return; // Already recorded this user's like
      }
      
      // Add user to likedBy array if not already present
      await updateDoc(matchDocRef, {
        likedBy: arrayUnion(userId),
        matchCount: increment(1)
      });
      
      // Check if this like creates a match
      const newMatchCount = matchData.matchCount + 1;
      const threshold = matchData.matchThreshold || defaultThreshold;
      
      if (!matchData.isMatch && newMatchCount >= threshold) {
        // We have a match! Update the status
        await updateDoc(matchDocRef, {
          isMatch: true,
          matchTimestamp: serverTimestamp()
        });
      }
    } else {
      // Create a new match document
      const locationMatchData: LocationMatchData = {
        locationId,
        groupId,
        matchCount: 1,
        matchThreshold: defaultThreshold,
        isMatch: 1 >= defaultThreshold, // Will be true if only 1 member in group
        likedBy: [userId],
        locationDetails: location
      };
      
      await setDoc(matchDocRef, {
        ...locationMatchData,
        createdAt: serverTimestamp(),
        matchTimestamp: 1 >= defaultThreshold ? serverTimestamp() : null
      });
    }
    
    // Store location details in a separate collection for easy access
    await setDoc(doc(db, 'locations', locationId), {
      ...location,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
  } catch (error) {
    console.error('Error handling right swipe:', error);
    throw error;
  }
};

/**
 * Check if user has already swiped on a location
 */
export const hasUserSwiped = async (userId: string, locationId: string): Promise<boolean> => {
  try {
    const swipeId = `${userId}_${locationId}`;
    const swipeDoc = await getDoc(doc(db, 'user_swipes', swipeId));
    return swipeDoc.exists();
  } catch (error) {
    console.error('Error checking if user swiped:', error);
    return false;
  }
};

/**
 * Repair group filter relationships - fixes data structure issues
 * Use this function when encountering permission errors in the filters collection
 */
export const repairGroupFilterRelationships = async (userId: string) => {
  try {
    console.log("Starting repair of group-filter relationships");
    const activeGroups = await getActiveGroups(userId);
    let repairCount = 0;
    
    for (const group of activeGroups) {
      if (group.filterId && group.filterId !== userId) {
        console.log(`Checking filter ${group.filterId} for group ${group.groupId}`);
        
        try {
          // First check if the filter document exists
          const filterDoc = await getDoc(doc(db, 'filters', group.filterId));
          
          if (filterDoc.exists()) {
            const filterData = filterDoc.data() as FilterData;
            
            // Check if groupId is missing or incorrect
            if (!filterData.groupId || filterData.groupId !== group.groupId) {
              console.log(`Repairing filter ${group.filterId} for group ${group.groupId}`);
              
              await updateDoc(doc(db, 'filters', group.filterId), {
                groupId: group.groupId
              });
              
              repairCount++;
              console.log(`Successfully updated filter ${group.filterId}`);
            } else {
              console.log(`Filter ${group.filterId} already has correct groupId`);
            }
          } else {
            console.log(`Filter ${group.filterId} doesn't exist, cannot repair`);
          }
        } catch (error) {
          console.error(`Failed to repair filter ${group.filterId}:`, error);
        }
      } else {
        console.log(`Group ${group.groupId} has invalid filterId: ${group.filterId}`);
      }
    }
    
    console.log(`Repair process completed. Fixed ${repairCount} filter documents.`);
    return true;
  } catch (error) {
    console.error("Error repairing group-filter relationships:", error);
    return false;
  }
};
// Add this to your groupService.ts file
export const fixGroupFilterIds = async (userId: string) => {
  try {
    console.log("Starting to fix group filter IDs");
    const activeGroups = await getActiveGroups(userId);
    
    for (const group of activeGroups) {
      if (!group.filterId || group.filterId === userId) {
        console.log(`Group ${group.groupId} has invalid filterId: ${group.filterId}, creating new filter`);
        
        try {
          // Create a new filter document specifically for this group
          const filterRef = doc(collection(db, 'filters'));
          const filterId = filterRef.id;
          
          // Create the filter with default values
          await setDoc(filterRef, {
            filterId,
            groupId: group.groupId,
            isFiltered: false,
            filters: ['bar', 'restaurant', 'cafe', 'night_club'] // Default types
          });
          
          // Update the group with the new filterId
          await updateDoc(doc(db, 'groups', group.groupId), {
            filterId
          });
          
          console.log(`Created new filter ${filterId} for group ${group.groupId}`);
        } catch (error) {
          console.error(`Failed to create filter for group ${group.groupId}:`, error);
        }
      }
    }
    
    console.log("Group filter ID fix completed");
    return true;
  } catch (error) {
    console.error("Error fixing group filter IDs:", error);
    return false;
  }
};
export const getGroupMatches = async (groupId: string): Promise<LocationMatchData[]> => {
  try {
    const matchesQuery = query(
      collection(db, 'location_matches'),
      where('groupId', '==', groupId),
      where('isMatch', '==', true)
    );
    
    const snapshot = await getDocs(matchesQuery);
    return snapshot.docs.map(doc => doc.data() as LocationMatchData);
  } catch (error) {
    console.error('Error fetching group matches:', error);
    return [];
  }
};

/**
 * Generate a random invite code
 */
const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};