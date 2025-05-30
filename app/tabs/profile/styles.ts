import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingBottom: 30,
  },
  backgroundHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    width: '100%',
    resizeMode: 'cover',
  },
  profileImageContainer: {
    marginTop: 80,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    position: 'relative',
  },
  profileImage: {
    width: 115,
    height: 115,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 115,
    height: 115,
    borderRadius: 60,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  editImageButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#fff',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  inlineEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  editInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#007AFF',
    paddingVertical: 4,
    textAlign: 'center',
    minWidth: 100,
  },
  smallEditInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#007AFF',
    paddingVertical: 2,
    width: 40,
    textAlign: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 25,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  settingsList: {
    width: '90%',
    marginBottom: 25,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  settingContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 10,
  },
  settingAction: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  toggleContainer: {
    padding: 4,
  },
  toggleBackground: {
    width: 50,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
  },
  toggleCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  actionsSection: {
    width: '90%',
    marginTop: 'auto',
  },
  logoutButton: {
    backgroundColor: '#f8f8f8',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  logoutButtonText: {
    color: '#FF0000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#f8f8f8',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  deleteButtonText: {
    color: '#FF0000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // For backwards compatibility
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center'
  },
  retryText: {
    color: '#007AFF',
    marginTop: 10
  },
  inlineError: {
    padding: 15,
    backgroundColor: '#ffebee',
    margin: 20,
    borderRadius: 8,
    width: '90%',
  }
});