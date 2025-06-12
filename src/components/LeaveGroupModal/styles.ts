// src/components/LeaveGroupModal/styles.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;
const isDesktop = width >= 1024;

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: isDesktop ? 40 : isTablet ? 30 : 20,
  },
  modalContainer: {
    width: isDesktop ? Math.min(400, width * 0.4) : isTablet ? '60%' : '85%',
    maxWidth: 500,
    minWidth: isDesktop ? 350 : 280,
    backgroundColor: 'white',
    borderRadius: isDesktop ? 24 : 20,
    padding: isDesktop ? 35 : isTablet ? 30 : 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: isDesktop ? 4 : 2,
    },
    shadowOpacity: isDesktop ? 0.3 : 0.25,
    shadowRadius: isDesktop ? 8 : 4,
    elevation: isDesktop ? 8 : 5,
    // Ensure modal doesn't exceed screen height
    maxHeight: height * 0.8,
  },
  title: {
    fontSize: isDesktop ? 26 : isTablet ? 24 : 22,
    fontWeight: 'bold',
    marginBottom: isDesktop ? 20 : isTablet ? 18 : 15,
    textAlign: 'center',
    color: '#333',
    paddingHorizontal: 10,
  },
  message: {
    fontSize: isDesktop ? 18 : isTablet ? 17 : 16,
    textAlign: 'center',
    marginBottom: isDesktop ? 35 : isTablet ? 30 : 25,
    color: '#555',
    lineHeight: isDesktop ? 26 : isTablet ? 24 : 22,
    paddingHorizontal: isDesktop ? 15 : 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 0,
  },
  button: {
    paddingVertical: isDesktop ? 16 : isTablet ? 14 : 12,
    paddingHorizontal: isDesktop ? 32 : isTablet ? 20 : 16,
    borderRadius: isDesktop ? 14 : 10,
    minWidth: isDesktop ? 140 : isTablet ? 120 : 100,
    maxWidth: isDesktop ? 180 : isTablet ? 150 : 140,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: isDesktop ? 8 : isTablet ? 6 : 4,
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  leaveButton: {
    backgroundColor: '#ff3b30',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: isDesktop ? 18 : isTablet ? 17 : 16,
  },
  cancelButtonText: {
    color: '#333',
  },
  leaveButtonText: {
    color: 'white',
  },
  loadingIndicator: {
    marginTop: isDesktop ? 20 : isTablet ? 18 : 15,
  },
});