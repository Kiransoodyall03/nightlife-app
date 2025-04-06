import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    arrayUnion, 
    arrayRemove, 
    collection, 
    query, 
    where, 
    getDocs, 
    increment, 
    serverTimestamp,
    Timestamp
  } from 'firebase/firestore';
  import { db, auth } from '../firebase/config';
  import { GroupData, GooglePlace, UserData, FilterData } from '../auth/types';
  
  // Interface for swipe data
  export interface SwipeData {
    userId: string;
    locationId: string;
    groupId?: string; // Made optional for non-group swipes
    direction: 'left' | 'right';
    timestamp: Date | Timestamp;
  }
  
  // Interface for location match data
  export interface LocationMatchData {
    locationId: string;
    groupId: string;
    matchCount: number;
    matchThreshold: number;
    isMatch: boolean;
    likedBy: string[]; // Array of user IDs who liked this location
    matchTimestamp?: Date | Timestamp;
    locationDetails?: GooglePlace;
    createdAt?: Date | Timestamp;
  }
  // Add this to src/services/auth/swipeMatchService.ts
export const repairGroupFilterRelationships = async (userId: string) => {
  try {
    console.log("Starting repair of group-filter relationships");
    const activeGroups = await getActiveGroups(userId);
    
    for (const group of activeGroups) {
      if (group.filterId && group.filterId !== userId) {
        console.log(`Repairing filter ${group.filterId} for group ${group.groupId}`);
        
        try {
          // Update the filter document to ensure it has groupId
          await updateDoc(doc(db, 'filters', group.filterId), {
            groupId: group.groupId
          });
          console.log(`Successfully updated filter ${group.filterId}`);
        } catch (error) {
          console.error(`Failed to update filter ${group.filterId}:`, error);
        }
      } else {
        console.log(`Group ${group.groupId} has invalid filterId: ${group.filterId}`);
      }
    }
    
    console.log("Repair process completed");
    return true;
  } catch (error) {
    console.error("Error repairing group-filter relationships:", error);
    return false;
  }
};
  /**
   * Get all active groups for a user
   */
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
      
      const userData = userDoc.data() as UserData & { activeGroupIds?: string[] };
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

  export const hasActiveGroups = async (userId: string): Promise<boolean> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return false;
      
      const userData = userDoc.data() as UserData & { activeGroupIds?: string[] };
      return Array.isArray(userData.activeGroupIds) && userData.activeGroupIds.length > 0;
    } catch (error) {
      console.error('Error checking for active groups:', error);
      return false;
    }
  };
  
  /**
   * Record a user's swipe on a location for all active groups
   */
  export const recordSwipe = async (
    location: GooglePlace, 
    direction: 'left' | 'right'
  ): Promise<boolean> => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const userId = user.uid;
      const locationId = location.place_id;
      
      // Get active groups
      const activeGroups = await getActiveGroups(userId);
      
      // Store the base swipe data
      const baseSwipeData: Omit<SwipeData, 'groupId'> = {
        userId,
        locationId,
        direction,
        timestamp: new Date()
      };
      
      // Create a document ID using userId and locationId
      const baseSwipeId = `${userId}_${locationId}`;
      await setDoc(doc(db, 'user_swipes', baseSwipeId), {
        ...baseSwipeData,
        timestamp: serverTimestamp()
      });
      
      // Process for each active group
      for (const group of activeGroups) {
        // Create a group-specific swipe record
        const groupSwipeId = `${userId}_${locationId}_${group.groupId}`;
        await setDoc(doc(db, 'group_swipes', groupSwipeId), {
          ...baseSwipeData,
          groupId: group.groupId,
          timestamp: serverTimestamp()
        });
        
        // If it's a right swipe, update matches
        if (direction === 'right') {
          await handleRightSwipe(userId, group.groupId, location);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error recording swipe:', error);
      return false;
    }
  };
  
  /**
   * Handle a right swipe (like) on a location
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
          
          // Here you could trigger notifications to group members
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
   * Get matches for a specific group
   */
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
   * Check if user has already swiped on this location
   */
  export const hasUserSwiped = async (
    userId: string, 
    locationId: string
  ): Promise<boolean> => {
    try {
      const swipeId = `${userId}_${locationId}`;
      const swipeDoc = await getDoc(doc(db, 'user_swipes', swipeId));
      return swipeDoc.exists();
    } catch (error) {
      console.error('Error checking if user swiped:', error);
      return false;
    }
  };