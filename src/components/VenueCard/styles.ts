import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = Math.min(height * 0.8, height - 100); // Ensure card doesn't exceed screen size

export default StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center', // Centers content vertically inside the card
    alignItems: 'center', // Centers content horizontally inside the card
    marginBottom: 100
  },
  image: {
    width: '100%',
    height: '65%',
  },
  infoContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: {
    color: '#fff',
  },
  type: {
    fontSize: 16,
    color: '#fff',
  },
  description: {
    fontSize: 14,
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
});
