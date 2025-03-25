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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000', // Dark text
    marginTop: 24,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 24,
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
  },
  filterButton: {
    backgroundColor: '#e0e0e0', // Light grey for button background
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 24,
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
  },
  createButton: {
    backgroundColor: '#6200EE', // Retain primary button color
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
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
