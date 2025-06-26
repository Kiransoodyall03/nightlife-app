import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');
const TopHeading = height * 0.15;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center', 
    // alignItems: 'center', 
  },
  dashboard: {
    height: 60, 
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    height: TopHeading,
    width: '90%',
    backgroundColor: '#ddd', 
    borderRadius: 10,
  },
  cardsContainer: {
    flex: 1, 
    justifyContent: "center",
    alignItems: "center",
  },
  navbar: {
    height: TopHeading,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    width: '90%',
    backgroundColor: '#ddd',
    borderRadius: 10,
  },
  swiper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
  },
  LoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center'
  },
  dropdownContainer: {
    position: 'absolute',
    top: 0, // Adjust based on your status bar height
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: -2,
    zIndex: 1000, // Ensure it's above the cards
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
  },
    dropdownButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 48,
  },
    dropdownButtonText: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
  },

});

export default styles;
