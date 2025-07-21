import { StyleSheet, Dimensions } from 'react-native';

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
  gradient: {
    height: '50%', // Take up bottom half of the card
    justifyContent: 'flex-end',
    width: '100%',
  },
  image: {
    width: '100%',
    justifyContent: 'flex-end',
    height: '100%',
  },
  infoContainer: {
    padding: 12,
    width: '100%',
  },
  name: {
    fontSize: 36,
    fontWeight: 'bold',
    fontFamily: 'Jaldi-Regular',
    color: '#fff',
    marginBottom: 8,
    marginLeft: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    marginLeft: 10,
  },
  tag: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF3F7D',
    padding: 8,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginRight: 8,
    textAlign: 'center',
  },
  tagText: {
    color: '#FF3F7D',
    fontSize: 16,
    fontFamily: 'Jaldi-Bold',
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  typeBox: {
    backgroundColor: '#f0f0f0',
    borderRadius: 60,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  typeText: {
    fontSize: 16,
    fontFamily: 'Jaldi-Regular',
    color: '#fff',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  type: {
    fontSize: 16,
    color: '#fff',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  ratingDistanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  distance: {
    fontSize: 16,
    color: '#fff',
  },
  rating: {
    fontSize: 16,
    color: '#FFA500',
    fontWeight: '600',
    marginRight: 12,
    marginLeft: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
    marginBottom: 20,
  },
  dropdownWrapper: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 200,
    zIndex: 1000,
  },
  dropdownButtonInCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  dropdownButtonTextInCard: {
    color: '#000',
    fontSize: 14,
  },
    imageIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 2,
  },
  activeDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  // Tap instruction styles
  tapInstruction: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tapInstructionText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
    opacity: 0.8,
  },
  
  // Action button styles (if using Pressable instead of Button component)
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});