// GroupDetailStyles.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // ------------- Header Section -------------
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#6200EE',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  // ------------- Cover Images Section -------------
  coverContainer: {
    height: 140,
    marginVertical: 12,
    paddingLeft: 16,
  },
  coverImage: {
    width: 120,
    height: 120,
    marginRight: 12,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  // ------------- Location Item Section -------------
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  locationRating: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  locationDistance: {
    fontSize: 14,
    color: '#666',
  },
  // ------------- Matched Members Overlap -------------
  membersContainer: {
    width: 80, // adjust as needed
    height: 40,
    position: 'relative',
    marginRight: 12,
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
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#fff',
    opacity: 0.9, // slightly reduced clarity
  },
  extraCountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  // ------------- Uber Button -------------
  uberButton: {
    backgroundColor: '#000',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uberButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
