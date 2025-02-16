// styles.ts
import { StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';
const { width } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const ITEM_MARGIN = 8;
const ITEM_WIDTH = (width - (32 + (NUM_COLUMNS + 1) * ITEM_MARGIN)) / NUM_COLUMNS;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Jaldi-Regular',
  },
  doneButton: {
    padding: 8,
  },
  doneButtonText: {
    color: '#FF0051',
    fontSize: 16,
    fontFamily: 'Jaldi-Regular',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
  },
  counterContainer: {
    padding: 12,
    backgroundColor: '#f5f5f5',
  },
  counterText: {
    color: '#666',
    textAlign: 'center',
  },
  selectedContainer: {
    height: 64,
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
  },
  selectedType: {
    backgroundColor: 'white',
    borderColor: '#FF0051',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  selectedTypeText: {
    color: '#FF0051',
    fontFamily: 'Jaldi-Regular',
    fontSize: 14,
  },
  gridContent: {
    padding: 16,
  },
  gridItem: {
    width: ITEM_WIDTH,
    margin: ITEM_MARGIN,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedGridItem: {
    backgroundColor: 'white',
    borderColor: '#FF0051',
    borderWidth: 1,
  },
  typeText: {
    fontSize: 14,
    fontFamily: 'Jaldi-Regular',
  },
});