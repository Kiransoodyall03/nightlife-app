// styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  matchedLocationsContainer: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEFF2',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
    fontFamily: 'Inter-SemiBold',
  },
  horizontalScrollContent: {
    paddingRight: 20,
  },
  locationCircleContainer: {
    marginRight: 16,
    position: 'relative',
  },
  locationCircleImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  locationItemContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  locationImage: {
    width: 96,
    height: 96,
    borderRadius: 12,
    marginRight: 16,
  },
  locationInfoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  locationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 12,
  },
  starIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#EA580C',
    fontWeight: '500',
  },
  distanceText: {
    fontSize: 14,
    color: '#64748B',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchedUsersContainer: {
    flexDirection: 'row',
    marginLeft: -8,
  },
  userProfileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginLeft: -8,
  },
  extraCountContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  extraCountText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  uberButton: {
    backgroundColor: '#000000',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uberButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  arrowIcon: {
    width: 16,
    height: 16,
    tintColor: '#FFFFFF',
  },
  separator: {
    height: 1,
    backgroundColor: '#EDEFF2',
    marginHorizontal: 20,
  },
  createGroupButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  createGroupButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FF1493',
    width: '80%',
    marginVertical: 8,
  },
  createGroupButtonText: {
    color: '#FF1493',
    fontWeight: '500',
    fontSize: 16,
  },
  selectedGroupContainer: {
    borderWidth: 2,
    borderColor: '#4CAF50', 
    transform: [{ scale: 1.05 }], 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  emptyStateContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  
  emptyStateText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  // Add these styles to your existing styles object
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  
  // Group item container with name below
  groupItemContainer: {
    alignItems: 'center',
    marginRight: 15,
    maxWidth: 80, // Constrain width for text wrapping
  },
  
  // Group name text below circle
  groupNameText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    marginTop: 5,
    fontWeight: '500',
  },
  
  // Empty groups state
  emptyGroupsContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  emptyGroupsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  emptyGroupsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },

});