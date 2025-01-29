import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');
const TopHeading = height * 0.15;

const styles = StyleSheet.create({
  container: {
    flex: 1, // Take full screen height
    justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally
  },
  dashboard: {
    height: 60, // Dashboard height
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    height: TopHeading,
    width: '90%',
    backgroundColor: '#ddd', // Placeholder design
    borderRadius: 10,
  },
  cardsContainer: {
    flex: 1, // Take up remaining space
    justifyContent: "center",
    alignItems: "center",
  },
  navbar: {
    height: TopHeading, // Navbar height
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    width: '90%',
    backgroundColor: '#ddd', // Placeholder design
    borderRadius: 10,
  },
  swiper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default styles;
