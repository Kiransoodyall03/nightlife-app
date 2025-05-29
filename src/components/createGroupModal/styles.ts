import { StyleSheet, Dimensions } from 'react-native';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export const modalStyles = StyleSheet.create({
  // Modal Container Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: screenHeight * 0.9,
    minHeight: screenHeight * 0.8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // Header Styles
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  exitButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
  },
  spacer: {
    width: 40, // Match exit button width for centering
  },

  // Avatar Styles
  avatarWrapper: {
    alignSelf: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },

  // Form Styles
  scrollContainer: {
    flex: 1,
  },
  form: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    color: '#333333',
    fontWeight: '400',
  },
  inputFocused: {
    borderColor: '#4A90E2',
    backgroundColor: '#ffffff',
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },

  // Filter Section Styles
  filterSection: {
    marginBottom: 30,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  filterContainer: {
    marginBottom: 15,
    minHeight: 50,
    justifyContent: 'center',
    paddingVertical: 5,
  },
  filterScroll: {
    paddingVertical: 5,
    paddingHorizontal: 2,
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  filterText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
    textTransform: 'capitalize',
  },
  filterRemoveButton: {
    padding: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(85, 85, 85, 0.1)',
  },
  noFiltersText: {
    color: '#888888',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 15,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(74, 144, 226, 0.05)',
  },
  filterButtonPressed: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    transform: [{ scale: 0.98 }],
  },
  filterButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Submit Button Styles
  submitButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6,
  },
  submitButtonPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.2,
  },
  submitButtonDisabled: {
    backgroundColor: '#cccccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  submitButtonTextDisabled: {
    color: '#888888',
  },

  // Loading States
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '500',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },

  // Error States
  errorText: {
    color: '#f44336',
    fontSize: 14,
    marginTop: 5,
    marginLeft: 16,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  errorMessage: {
    color: '#f44336',
    fontSize: 14,
    textAlign: 'center',
  },

  // Success States
  successContainer: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4caf50',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  successMessage: {
    color: '#4caf50',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Responsive Design
  modalContainerSmall: {
    maxHeight: screenHeight * 0.85,
    minHeight: screenHeight * 0.6,
  },
  modalContainerLarge: {
    maxHeight: screenHeight * 0.95,
    minHeight: screenHeight * 0.8,
  },

  // Animation Support
  fadeIn: {
    opacity: 1,
  },
  fadeOut: {
    opacity: 0.5,
  },

  // Accessibility
  accessibilityLabel: {
    // Styles for screen readers
  },
  interestsContainer: {
    marginTop: 15,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  
  interestsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  
  // Interests Grid
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  
  // Individual Interest Item
  interestItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    marginBottom: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  // Selected Interest Item (Tinder Pink)
  interestItemSelected: {
    backgroundColor: '#ff4458',
    borderColor: '#ff4458',
    transform: [{ scale: 1.05 }],
  },
  
  // Interest Text
  interestText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  
  // Selected Interest Text
  interestTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
});