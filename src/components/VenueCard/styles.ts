import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    card: {
        width: width * 0.9,
        height: height * 0.7,
        borderRadius: 16,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        overflow: 'hidden',
      },
  image: {
    width: '100%',
    height: '60%',
  },
  infoContainer: {
    padding: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  type: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFB800',
  },
  distance: {
    fontSize: 12,
    color: '#666',
  },
});

export default styles;
