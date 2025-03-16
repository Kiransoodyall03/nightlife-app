import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingBottom: 20,
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
    borderRadius: 100,
    marginBottom: 8,
  },
  inlineEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#007AFF',
    paddingVertical: 4,
    fontFamily: 'Jaldi-Regular',
  },
  profileImagePlaceholder: {
    width: 125,
    height: 125,
    borderRadius: 100,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontFamily: 'Jaldi-Regular',
  },
  filterButton: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Jaldi-Regular',
  },
  profileImage: {
    width: 125,
    height: 125,
    borderRadius: 100,
  },
  uploadText: {
    marginTop: 8,
    color: '#007AFF',
    textAlign: 'center',
    fontFamily: 'Jaldi-Regular',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 30,
  },
  section: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: 'Jaldi-Regular',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ff0000',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Jaldi-Regular',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Jaldi-Regular',
  },
  email: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Jaldi-Regular',
  },
  settingsSection: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 20,
    flexGrow: 1,
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
    fontFamily: 'Jaldi-Regular',
  },
  actionsSection: {
    marginTop: 24,
    paddingHorizontal: 20,
    width: '100%',
  },
  actionButton: {
    paddingVertical: 12,
    marginBottom: 16,
  },
  deleteText: {
    color: '#FF3B30',
    fontFamily: 'Jaldi-Regular',
  },
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
    borderRadius: 8
  },
});