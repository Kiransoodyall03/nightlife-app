import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 100,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    height: '40%',
    width: '100%',
    backgroundColor: 'transparent',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    height: '33.33%',
    width: '100%',
    zIndex: 1,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  type: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#ddd',
    marginBottom: 8,
  },
  distance: {
    fontSize: 12,
    color: '#fff',
  },
  rating: {
    fontSize: 12,
    color: '#ffd700',
  },
  actions: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
});
export default styles;
