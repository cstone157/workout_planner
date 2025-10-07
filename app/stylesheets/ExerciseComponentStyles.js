import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 5,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  collapseIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginLeft: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    marginBottom: 15,
  },
  timerText: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'right',
    marginTop: 5,
    marginBottom: 10,
    fontWeight: '500',
  },
  setsContainer: {
    marginTop: 10,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  setIndexText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    width: 25,
    textAlign: 'right',
    color: '#555',
  },
  individualSetComponent: {
    flex: 1,
  },
  removeSetButton: {
    marginLeft: 10,
    padding: 5,
    backgroundColor: '#ff4d4d',
    borderRadius: 5,
  },
  removeSetButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  addSetButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  addSetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  restTimerDisplay: { // Styles for the timer display
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#E6F0FF', // Light blue background
      padding: 10,
      borderRadius: 8,
      marginVertical: 10,
      borderWidth: 1,
      borderColor: '#007AFF',
  },
  restTimerLabel: {
      fontSize: 16,
      color: '#333',
      fontWeight: 'bold',
  },
  restTimerValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#007AFF',
  },
  skipButton: {
      backgroundColor: '#FF5733', // Orange/Red color
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 5,
  },
  skipButtonText: {
      color: '#fff',
      fontWeight: 'bold',
  },
});

export default styles;