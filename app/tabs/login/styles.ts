import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.9,
    backgroundColor: '#131140',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Jaldi',
    color: '#000000',
  },
  titleHighlight: {
    color: '#007AFF',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Jaldi',
    color: '#000',
  },
  input: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    marginVertical: 10,
    fontSize: 16,
    color: '#000',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  forgotPasswordText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  signInButton: {
    backgroundColor: '#026495',
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  signInText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    marginTop: 20,
  },
});
