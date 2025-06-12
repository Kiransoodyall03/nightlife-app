// src/components/GroupCodeModal/GroupCodeModal.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Clipboard, Alert, Share } from 'react-native';
import { GroupData } from '../../services/auth/types';
import { styles } from './styles';

interface GroupCodeModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedGroup: GroupData | null;
}

const GroupCodeModal: React.FC<GroupCodeModalProps> = ({
  isVisible,
  onClose,
  selectedGroup
}) => {
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [isSharing, setIsSharing] = useState<boolean>(false);

  // Don't render if no group is selected
  if (!selectedGroup) return null;

  const handleCopyToClipboard = async (): Promise<void> => {
    try {
      await Clipboard.setString(selectedGroup.groupCode);
      setCopySuccess(true);
      Alert.alert('Success', 'Group code copied to clipboard!');
      
      // Reset copy success message after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      Alert.alert('Error', 'Failed to copy group code');
    }
  };

  const handleShare = async (): Promise<void> => {
    setIsSharing(true);
    
    const shareText = `Join my group "${selectedGroup.groupName}" with code: ${selectedGroup.groupCode}`;
    
    try {
      await Share.share({
        message: shareText,
        title: `Join ${selectedGroup.groupName}`,
      });
    } catch (error) {
      console.error('Sharing failed:', error);
      Alert.alert('Error', 'Failed to share group code');
    } finally {
      setIsSharing(false);
    }
  };

  const handleBackdropPress = (): void => {
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1}
        onPress={handleBackdropPress}
      >
        <TouchableOpacity 
          style={styles.modal}
          activeOpacity={1}
          onPress={() => {}} // Prevent modal from closing when tapping content
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Group Code</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{selectedGroup.groupName}</Text>
              <Text style={styles.description}>
                Share this code with others to let them join your group
              </Text>
            </View>

            <View style={styles.codeContainer}>
              <View style={styles.codeDisplay}>
                <Text style={styles.codeText}>{selectedGroup.groupCode}</Text>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.copyButton,
                  copySuccess && styles.copyButtonSuccess
                ]}
                onPress={handleCopyToClipboard}
                disabled={copySuccess}
              >
                <Text style={styles.copyButtonText}>
                  {copySuccess ? '✓ Copied!' : 'Copy Code'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[
                  styles.shareButton,
                  isSharing && styles.shareButtonDisabled
                ]}
                onPress={handleShare}
                disabled={isSharing}
              >
                <Text style={styles.shareButtonText}>
                  {isSharing ? 'Sharing...' : '📱 Share'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default GroupCodeModal;