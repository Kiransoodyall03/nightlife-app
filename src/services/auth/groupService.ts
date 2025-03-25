import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    updateDoc, 
    arrayUnion, 
    setDoc, 
    serverTimestamp 
  } from 'firebase/firestore';
  import { auth, db } from '../firebase/config';
  import { GroupData } from '../auth/types';
  
  export interface JoinGroupResult {
    success: boolean;
    group?: GroupData;
    error?: string;
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
      
      // Create the group data
      const groupData: GroupData = {
        groupId,
        groupName,
        members: [creatorId],
        createdAt: new Date(),
        isActive: true,
        filterId,
      };
      
      // Save to Firestore
      await setDoc(groupRef, {
        ...groupData,
        createdAt: serverTimestamp(),
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
      const groupData = groupDoc.data() as GroupData & { inviteExpiry: Date };
      
      // Check if invite has expired
      if (groupData.inviteExpiry && new Date(groupData.inviteExpiry.getSeconds() * 1000) < new Date()) {
        return { success: false, error: 'Invite code has expired' };
      }
      
      // Check if user is already a member
      if (groupData.members.includes(user.uid)) {
        return { success: true, group: groupData };
      }
      
      // Add user to the group members
      await updateDoc(doc(db, 'groups', groupData.groupId), {
        members: arrayUnion(user.uid)
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