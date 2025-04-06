import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');
const TopHeading = height * 0.15;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  dashboard: {
    height: 60, 
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#121212',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeModeButton: {
    backgroundColor: '#BB86FC',
  },
  modeButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
  },
  activeModeButtonText: {
    color: '#000',
  },
  groupInfoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  groupInfoText: {
    color: '#fff',
    fontSize: 14,
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
});

export default styles;
