import { StyleSheet } from "react-native";
export default StyleSheet.create({
  userInfoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f4',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImagePlaceholderText: {
    color: 'white',
    fontSize: 32,
    fontFamily: 'Jaldi-Bold',
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Jaldi-Bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Jaldi-Regular',
    color: '#666',
    marginTop: 4,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 10,
  },
  drawerIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  logoutButton: {
    padding: 15,
    marginHorizontal: 15,
    marginTop: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
  },
  logoutText: {
    fontFamily: 'Jaldi-Regular',
    color: '#FF3B30',
    fontSize: 16,
  }
});