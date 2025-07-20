import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#181818',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  input: {
    width: '100%',
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: '#222',
    color: '#fff',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ff5252',
    borderWidth: 2,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#ff5252',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#888',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  locationText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
  },
  errorText: {
    color: '#ff5252',
    fontSize: 14,
    marginTop: 5,
  },
  valText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 2,
  },
});