import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  container: {
    width: '80%',
    backgroundColor: 'rgba(19, 17, 64, 1)',
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
  },
  titleContainer: {
    marginBottom: 30,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 25,
    width: '100%',
    marginVertical: 8,
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontFamily: 'Jaldi-Regular',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#FFFFFF',
  },
  dividerText: {
    color: '#FFFFFF',
    fontFamily: 'Jaldi-Regular',
    paddingHorizontal: 10,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    marginVertical: 8,
    fontSize: 16,
    fontFamily: 'Jaldi-Regular',
    color: '#000000',
  },
  loginButton: {
    backgroundColor: '#026495',
    width: '100%',
    padding: 15,
    borderRadius: 25,
    marginTop: 15,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Jaldi-Regular',
    fontSize: 16,
    textAlign: 'center',
  },
  signUpButton: {
    padding: 15,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Jaldi-Regular',
    textAlign: 'center',
    fontSize: 16,
  },
});