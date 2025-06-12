// src/components/GroupCodeModal/styles.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modal: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    maxWidth: 400,
    width: width - 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 25,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  closeButtonText: {
    fontSize: 24,
    color: '#6b7280',
    fontWeight: '300',
  },

  content: {
    padding: 24,
  },

  groupInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },

  groupName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },

  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    textAlign: 'center',
  },

  codeContainer: {
    marginBottom: 24,
  },

  codeDisplay: {
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },

  codeText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Courier',
    color: '#374151',
    letterSpacing: 2,
  },

  copyButton: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  copyButtonSuccess: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
  },

  copyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },

  actions: {
    flexDirection: 'row',
    gap: 12,
  },

  shareButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#25d366',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#25d366',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  shareButtonDisabled: {
    opacity: 0.7,
  },

  shareButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
});