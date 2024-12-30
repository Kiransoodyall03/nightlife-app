import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;

export default StyleSheet.create({

    container: {
      width: SIDEBAR_WIDTH,
      height: '100%',
      backgroundColor: '#1A1A1A',
      paddingVertical: 20,
      justifyContent: 'space-between',
    },
    profileSection: {
      height: height * 0.3,
      alignItems: 'center',
      justifyContent: 'center',
    },
    imageContainer: {
      width: SIDEBAR_WIDTH * 0.4,
      height: SIDEBAR_WIDTH * 0.4,
      borderRadius: SIDEBAR_WIDTH * 0.2,
      overflow: 'hidden',
      borderWidth: 3,
      borderColor: '#333',
    },
    profileImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    navigationSection: {
      flex: 1,
      paddingTop: 20,
    },
    navItem: {
      paddingVertical: 15,
      paddingHorizontal: 30,
      marginBottom: 10,
    },
    navText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '500',
    },
    logoutButton: {
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderTopWidth: 1,
      borderTopColor: '#333',
    },
    logoutText: {
      color: '#FF4444',
      fontSize: 18,
      fontWeight: '500',
    },
  });