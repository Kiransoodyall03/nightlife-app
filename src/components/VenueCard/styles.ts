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
    marginBottom: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
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
    fontFamily: 'Jaldi-Regular',
    color: '#fff',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  typeBox: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  typeText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
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
    color: '#666',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  distance: {
    fontSize: 14,
    color: '#007AFF',
  },
  rating: {
    fontSize: 14,
    color: '#FFA500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
