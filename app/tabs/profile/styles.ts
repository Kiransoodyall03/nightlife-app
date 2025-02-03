import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backgroundHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150, // Adjust based on your design
    resizeMode: 'cover',
  },
  profileImageContainer: {
    marginTop: 100, // Half of background header height
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileInitial: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  recalibrateButton: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  recalibrateButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 50, // Space for profile image
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  settingsSection: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 20,
  },
  settingItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingHorizontal: 20,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  actionsSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  actionButton: {
    paddingVertical: 12,
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
  },
  deleteText: {
    color: '#FF3B30',
  },
});