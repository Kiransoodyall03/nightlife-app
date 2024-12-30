import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9; // 90% of screen width
const CARD_HEIGHT = height * 0.8; // 70% of screen height

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: height * 0.1, // Moves card higher up
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#000',
    borderRadius: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '65%',
    position: 'relative',
  },
  infoContainer: {
    flex: 1,
    padding: width * 0.04,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'space-between',
    maxHeight: '45%',
  },
  name: {
    fontSize: Math.max(24, width * 0.06),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: height * 0.01,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: width * 0.02,
    marginBottom: height * 0.015,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.008,
    borderRadius: 16,
  },
  tagText: {
    color: '#fff',
    fontSize: Math.max(14, width * 0.035),
  },
  type: {
    fontSize: Math.max(16, width * 0.04),
    color: '#fff',
    marginBottom: height * 0.01,
  },
  description: {
    fontSize: Math.max(14, width * 0.035),
    color: '#fff',
    marginBottom: height * 0.015,
    lineHeight: 20,
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
    justifyContent: 'space-between',
    marginBottom: height * 0.02,
  },
  rating: {
    fontSize: Math.max(16, width * 0.04),
    color: '#FFD700',
  },
  distance: {
    fontSize: Math.max(16, width * 0.04),
    color: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: width * 0.03,
    paddingBottom: height * 0.02,
  },
});