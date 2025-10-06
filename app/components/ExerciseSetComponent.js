import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Button, Alert } from 'react-native';

const ExerciseSetComponent = ({ initialReps, initialWeight, isWarmup: initialIsWarmup, onSave, onToggleSetType, setId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentReps, setCurrentReps] = useState(String(initialReps));
  const [currentWeight, setCurrentWeight] = useState(String(initialWeight));
  const [isWarmup, setIsWarmup] = useState(initialIsWarmup); // Local state for immediate feedback

  // Effect to update local isWarmup if initialIsWarmup prop changes from parent
  // This is important if the parent component re-renders and passes a different initialIsWarmup
  React.useEffect(() => {
    setIsWarmup(initialIsWarmup);
  }, [initialIsWarmup]);

  const handleSave = () => {
    const newReps = parseInt(currentReps);
    const newWeight = parseFloat(currentWeight);

    if (isNaN(newReps) || newReps <= 0 || isNaN(newWeight) || newWeight < 0) {
      Alert.alert("Invalid Input", "Please enter valid numbers for reps and weight.");
      return;
    }

    if (onSave) {
      onSave(newReps, newWeight, isWarmup); // Pass isWarmup to parent
    }
    setIsExpanded(false); // Collapse after saving
  };

  const handleToggleSetType = () => {
    const newIsWarmup = !isWarmup;
    setIsWarmup(newIsWarmup); // Update local state for immediate visual feedback
    if (onToggleSetType) {
      onToggleSetType(setId, newIsWarmup); // Notify parent of the change
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.mainContent}>
        <Text style={styles.repsText}>{initialReps} reps</Text>
        <Text style={styles.weightText}>{initialWeight} kg</Text>
        <TouchableOpacity onPress={handleToggleSetType} style={styles.setTypeButton}>
          <Text style={[styles.setTypeText, isWarmup ? styles.warmup : styles.workSet]}>
            {isWarmup ? 'Warmup' : 'Work Set'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={styles.expandButton}>
          <Text style={styles.expandButtonText}>...</Text>
        </TouchableOpacity>
      </View>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Reps:</Text>
            <TextInput
              style={styles.input}
              onChangeText={setCurrentReps}
              value={currentReps}
              keyboardType="numeric"
              maxLength={3}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Weight (kg):</Text>
            <TextInput
              style={styles.input}
              onChangeText={setCurrentWeight}
              value={currentWeight}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>
          <Button title="Save Changes" onPress={handleSave} />
        </View>
      )}
    </View>
  );
};

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
  setTypeButton: { // New style for the touchable area
    flex: 1,
    alignItems: 'center', // Center the text within the touchable area
  },
  setTypeText: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    overflow: 'hidden',
    // Removed flex: 1 and textAlign: 'center' from here, moved to setTypeButton
    minWidth: 80, // Ensure enough width for "Work Set" / "Warmup"
    textAlign: 'center',
  },
  warmup: {
    backgroundColor: '#FFEB3B', // Yellow for warmup
    color: '#333',
  },
  workSet: {
    backgroundColor: '#4CAF50', // Green for work set
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
});

export default ExerciseSetComponent;