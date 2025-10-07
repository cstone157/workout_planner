import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  restingContainer: { // Light green when resting (completed and timer running)
    backgroundColor: '#D4EDDA',
    borderColor: '#28A745',
    borderWidth: 1,
  },
  activeContainer: { // Optional: Highlight the currently active set
      borderColor: '#007AFF',
      borderWidth: 2,
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  repsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  weightText: {
    fontSize: 18,
    color: '#555',
    flex: 1,
    textAlign: 'center',
  },
  setTypeButton: {
    flex: 1,
    alignItems: 'center',
  },
  setTypeText: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    overflow: 'hidden',
    minWidth: 80,
    textAlign: 'center',
  },
  warmup: {
    backgroundColor: '#FFEB3B',
    color: '#333',
  },
  workSet: {
    backgroundColor: '#4CAF50',
    color: '#fff',
  },
  expandButton: {
    paddingLeft: 10,
    paddingVertical: 5,
  },
  expandButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#777',
  },
  expandedContent: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
    marginRight: 10,
    width: 80,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  markCompleteButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  markCompleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default styles;
