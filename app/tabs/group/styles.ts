// CombinedGroupsMatchesStyles.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const circleSize = 80;

export const styles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // ------------- Header -------------
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 0,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  
  // ------------- Groups Section Container -------------
  groupsContainer: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    marginBottom: 10,
    paddingBottom: 16,
  },
  groupsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 16,
    marginBottom: 12,
  },
  
  // ------------- Groups Horizontal Scroll -------------
  groupsScroll: {
    paddingVertical: 8,
    paddingLeft: 16,
  },
  groupCircle: {
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    marginRight: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    // Add shadow for better elevation effect like in the mockup
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupCircleSelected: {
    borderColor: '#FF0051',
    borderWidth: 3,
  },
  groupImage: {
    width: circleSize,
    height: circleSize,
    resizeMode: 'cover',
  },
  groupLabelContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 4,
  },
  groupLabelText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // ------------- Create Group Button -------------
  createGroupButtonContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  createGroupButton: {
    backgroundColor: '#6200ee', // Purple color like in mockup
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  createGroupButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // No visible divider in the mockup
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  
  // ------------- Locations List -------------
  locationsList: {
    paddingBottom: 20,
  },
  
  // Each location item - updated to match mockup
  locationItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  locationInfo: {
    flex: 1,
    paddingRight: 8,
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  locationRating: {
    fontSize: 14,
    color: '#ffd700', // Yellow for star rating
    marginBottom: 2,
  },
  locationDistance: {
    fontSize: 14,
    color: '#666',
  },
  
  // ------------- Overlapping Matched Members -------------
  membersContainer: {
    height: 40,
    position: 'relative',
    marginRight: 10,
    width: 90, // Make room for at least 3 circles plus +3 indicator
  },
  memberImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#fff',
  },
  extraCountContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4CAF50', // Green like in mockup
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#fff',
  },
  extraCountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  
  // ------------- Uber Button -------------
  uberButton: {
    backgroundColor: '#000',
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uberButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  
  // ------------- Other Styles (keeping from existing) -------------
  discoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  discoverButtonText: {
    color: '#6200ee',
    marginLeft: 4,
    fontWeight: '500',
  },
  activeGroupCircle: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  activeIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  groupActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    color: '#000',
    marginRight: 12,
    fontSize: 14,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: 'bold',
    fontSize: 12,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  listHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  listHeaderCount: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
    fontSize: 16,
  },
  discoverNowButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  discoverNowButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
  },
  
  // Base styles for action buttons
  actionButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    elevation: 2,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  joinGroupButton: {
    backgroundColor: '#03DAC6',
  },
  
  inviteButton: {
    backgroundColor: '#BB86FC',
  },
});