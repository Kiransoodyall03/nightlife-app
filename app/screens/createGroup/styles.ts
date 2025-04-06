import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Light background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#000', // Dark text for back button
  },
  scrollContent: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center', // Center content horizontally
  },
  // Image picker styles
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    // Add shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  groupImagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6200EE',
    fontWeight: '500',
  },
  // Existing styles
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000', // Dark text
    marginTop: 24,
    marginBottom: 16,
    alignSelf: 'flex-start', // Align text to the left
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
    width: '100%',
  },
  inputLabel: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f2f2f2', // Light grey background for input
    borderRadius: 8,
    color: '#000',
    padding: 16,
    fontSize: 16,
    width: '100%',
  },
  filterButton: {
    backgroundColor: '#e0e0e0', // Light grey for button background
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  filterButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 14,
    color: '#333', // Slightly dark grey for informational text
    textAlign: 'center',
    marginBottom: 24,
    width: '100%',
  },
  createButton: {
    backgroundColor: '#6200EE', // Retain primary button color
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
    width: '100%',
  },
  createButtonText: {
    color: '#fff', // White text on the primary button
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#aaa',
    opacity: 0.7,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 16,
    width: '100%',
  },
  errorButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  errorButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingText: {
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default styles;