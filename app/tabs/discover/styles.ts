import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');
const TopHeading = height * 0.15;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  dashboard: {
    height: 60, 
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    height: TopHeading,
    width: '90%',
    backgroundColor: '#ddd', 
    borderRadius: 10,
  },
  cardsContainer: {
    flex: 1, 
    justifyContent: "center",
    alignItems: "center",
  },
  navbar: {
    height: TopHeading,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    width: '90%',
    backgroundColor: '#ddd',
    borderRadius: 10,
  },
  swiper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default styles;
