// matchLocationList.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  locationItemContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
  },
  locationImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  locationInfoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  distanceText: {
    fontSize: 13,
    color: '#666',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  matchedUsersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userProfileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#fff',
    marginLeft: -10,
  },
  extraCountContainer: {
    backgroundColor: '#ccc',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 5,
  },
  extraCountText: {
    fontSize: 12,
    color: '#fff',
  },
  uberButton: {
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  uberButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  separator: {
    height: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyStateText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#888',
    marginBottom: 6,
  },
});
