// src/components/LeaveGroupModal/index.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { styles } from './styles';
import { GroupData } from 'src/services/auth/types';
import { useAuth } from 'src/services/auth/useAuth';
import { useNotification } from 'src/components/Notification/NotificationContext';

interface LeaveGroupModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedGroup: GroupData | null;
  onLeaveSuccess: () => void; // Callback after successful leave
}

const LeaveGroupModal: React.FC<LeaveGroupModalProps> = ({
  isVisible,
  onClose,
  selectedGroup,
  onLeaveSuccess
}) => {
  const { leaveGroup } = useAuth();
  const { showError } = useNotification();
  const [isLeaving, setIsLeaving] = useState(false);

  const handleLeave = async () => {
    if (!selectedGroup) return;

    setIsLeaving(true);
    try {
      const result = await leaveGroup(selectedGroup.groupId);
      
      if (result.success) {
        onLeaveSuccess(); // Update UI after leaving
        onClose(); // Close the modal
      } else {
        showError('Failed to leave group');
      }
    } catch (error) {
      showError('An unexpected error occurred');
      console.error('Error leaving group:', error);
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Leave Group</Text>
          
          <Text style={styles.message}>
            Are you sure you want to leave the group{' '}
            <Text style={{ fontWeight: 'bold' }}>{selectedGroup?.groupName}</Text>?
            You'll need a new invitation to rejoin.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isLeaving}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.leaveButton]}
              onPress={handleLeave}
              disabled={isLeaving}
            >
              <Text style={[styles.buttonText, styles.leaveButtonText]}>
                {isLeaving ? 'Leaving...' : 'Leave'}
              </Text>
            </TouchableOpacity>
          </View>

          {isLeaving && (
            <ActivityIndicator 
              size="small" 
              color="#ff3b30" 
              style={styles.loadingIndicator} 
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default LeaveGroupModal;