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
  errorText: {
    color: '#ff4444',
    marginBottom: 10,
    textAlign: 'center',
  },
});