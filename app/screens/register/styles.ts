import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  inputError: {
    borderColor: '#F44336',
    borderWidth: 1,
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: '#ccc',
  },
  titleContainer: {
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#333333',
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    color: '#ffffff',
    fontSize: 16,
  },
  button: {
    width: '100%',
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  locationContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
  locationErrorText: {
    fontSize: 14,
    color: '#F44336',
    marginTop: 5,
  },
  refreshLocationText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 5,
  },
  errorText: {
    color: '#ff4444',
    marginBottom: 10,
    textAlign: 'center',
  },
});