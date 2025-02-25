// styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  // Matched Locations Section
  matchedLocationsContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  horizontalScrollContent: {
    paddingVertical: 8,
    paddingRight: 20,
  },
  locationCircleContainer: {
    marginRight: 16,
  },
  locationCircleImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0', // Placeholder background
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  // Location Item
  locationItemContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationInfoContainer: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  starIcon: {
    width: 14,
    height: 14,
    tintColor: '#FFD700',
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
  },
  
  // Location Details (Right Side)
  locationDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchedUsersContainer: {
    flexDirection: 'row',
    marginRight: 12,
  },
  userImageWrapper: {
    marginLeft: -8, // Overlap effect
    borderWidth: 1.5,
    borderColor: '#ffffff',
    borderRadius: 15,
  },
  userProfileImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  extraCountContainer: {
    backgroundColor: '#d1e7dd',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  extraCountText: {
    fontSize: 10,
    color: '#333',
    fontWeight: '500',
  },
  uberButtonContainer: {
    backgroundColor: '#000',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uberButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Misc
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
});