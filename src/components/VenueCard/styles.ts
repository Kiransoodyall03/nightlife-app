// components/VenueCard/styles.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  card: {
    width: width,
    height: '100%',
    backgroundColor: '#000',
    marginTop: -60,
    marginLeft: -10,
  },
  image: {
    width: '100%',
    height: '60%',
    position: 'relative',
  },
  infoContainer: {
    padding: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: '#fff',
    fontSize: 14,
  },
  type: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  rating: {
    fontSize: 16,
    color: '#FFD700',
  },
  distance: {
    fontSize: 16,
    color: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
});