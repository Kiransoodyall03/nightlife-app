import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1, // Fill screen
  },
  dashboard: {
    height: 60, // Dashboard height
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    height: 40,
    width: '90%',
    backgroundColor: '#ddd', // Placeholder design
    borderRadius: 10,
  },
  cardsContainer: {
    flex: 1, // Take up remaining space
  },
  navbar: {
    height: 60, // Navbar height
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    height: 40,
    width: '90%',
    backgroundColor: '#ddd', // Placeholder design
    borderRadius: 10,
  },
  swiper: {
    width: '100%',     
    height: '80%',               
    justifyContent: 'center',      
    alignItems: 'center',           
  },
});

export default styles;
