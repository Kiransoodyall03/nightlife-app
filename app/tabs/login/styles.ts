// filepath: /c:/Users/User/Desktop/nightlife-app/nightlife-app/app/tabs/login/styles.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
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
    fontFamily: 'Jaldi-Regular', // Use the font family name
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
    fontFamily: 'Jaldi-Regular', // Use the font family name
    color: '#000',
  },
  input: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: 50,
    borderRadius: 25,
    fontFamily: 'Jaldi-Regular', 
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
    fontFamily: 'Jaldi-Regular', 
    fontSize: 14,
  },
  signInButton: {
    backgroundColor: '#026495',
    fontFamily: 'Jaldi-Regular', 
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  signInText: {
    fontFamily: 'Jaldi-Regular', 
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
  logo: {
    width: 70,
    height: 50,
    marginTop: 20,
  },
});