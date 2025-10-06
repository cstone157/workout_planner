import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import ExerciseSetComponent from './ExerciseSetComponent'; // Adjust path as needed

const ExerciseComponent = ({
  name,
  description,
  initialSets,
  timeBetweenSets,
  timeAfterExercise,
}) => {
  const [sets, setSets] = useState(initialSets || []);
  const [nextSetId, setNextSetId] = useState(
    initialSets && initialSets.length > 0
      ? Math.max(...initialSets.map(s => parseInt(s.id))) + 1
      : 1
  );
  const [isCollapsed, setIsCollapsed] = useState(true); // New state for collapse

  const handleUpdateSet = (setId, newReps, newWeight) => {
    setSets(prevSets =>
      prevSets.map(set =>
        set.id === setId ? { ...set, reps: newReps, weight: newWeight } : set
      )
    );
    console.log(`Exercise Set ${setId} updated for ${name}: Reps - ${newReps}, Weight - ${newWeight}`);
  };

  const handleToggleSetType = (setId, newIsWarmup) => {
    setSets(prevSets =>
      prevSets.map(set =>
        set.id === setId ? { ...set, isWarmup: newIsWarmup } : set
      )
    );
    console.log(`Exercise Set ${setId} type toggled for ${name}. New type: ${newIsWarmup ? 'Warmup' : 'Work Set'}`);
  };

  const handleToggleSetCompleted = (setId) => { // New handler for toggling completion
    setSets(prevSets =>
      prevSets.map(set =>
        set.id === setId ? { ...set, completed: !set.completed } : set
      )
    );
  };

  const handleAddSet = () => {
    const newSet = {
      id: String(nextSetId),
      reps: 0,
      weight: 0,
      isWarmup: false,
      completed: false, // New sets start as not completed
    };
    setSets(prevSets => [...prevSets, newSet]);
    setNextSetId(prevId => prevId + 1);
  };
  
  const handleRemoveSet = (setIdToRemove) => {
    if (Platform.OS === 'web') {
      const confirmed = confirm("Are you sure you want to remove this set?");
      if (confirmed) {
        setSets(prevSets => prevSets.filter(set => set.id !== setIdToRemove));
      }
    } else {
      Alert.alert(
        "Remove Set",
        "Are you sure you want to remove this set?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            onPress: () => setSets(prevSets => prevSets.filter(set => set.id !== setIdToRemove)),
            style: "destructive"
          }
        ],
        { cancelable: true }
      );
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setIsCollapsed(!isCollapsed)} style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.collapseIcon}>{isCollapsed ? '▼' : '▲'}</Text>
      </TouchableOpacity>

      {!isCollapsed && ( // Conditionally render content if not collapsed
        <View>
          <Text style={styles.description}>{description}</Text>

          {/* Display timeBetweenSets */}
          {timeBetweenSets !== undefined && (
            <Text style={styles.timerText}>Rest Between Sets: {timeBetweenSets} seconds</Text>
          )}

          <View style={styles.setsContainer}>
            {sets.map((set, index) => (
              <View key={set.id} style={styles.setRow}>
                <Text style={styles.setIndexText}>{index + 1}.</Text>
                <ExerciseSetComponent
                  setId={set.id}
                  initialReps={set.reps}
                  initialWeight={set.weight}
                  isWarmup={set.isWarmup}
                  completed={set.completed} // Pass the completed status
                  onSave={(newReps, newWeight) => handleUpdateSet(set.id, newReps, newWeight)}
                  onToggleSetType={handleToggleSetType}
                  style={styles.individualSetComponent}
                />
                <TouchableOpacity onPress={() => handleToggleSetCompleted(set.id)} style={[styles.markCompleteButton, set.completed && styles.markCompleteButtonCompleted]}>
                    <Text style={styles.markCompleteButtonText}>{set.completed ? '✓' : '◯'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleRemoveSet(set.id)} style={styles.removeSetButton}>
                  <Text style={styles.removeSetButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.addSetButton} onPress={handleAddSet}>
            <Text style={styles.addSetButtonText}>+ Add Set</Text>
          </TouchableOpacity>

          {/* Display timeAfterExercise */}
          {timeAfterExercise !== undefined && (
            <Text style={styles.timerText}>Rest After Exercise: {timeAfterExercise} seconds</Text>
          )}
        </View>
      )}
    </View>
  );
};

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
  header: { // Style for the collapsible header
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 5, // Add some padding for the collapse functionality
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    flex: 1, // Allow name to take available space
  },
  collapseIcon: { // Style for the collapse arrow icon
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginLeft: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 5, // Add margin to separate from name/icon
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
  markCompleteButton: {
    marginLeft: 8,
    padding: 5,
    backgroundColor: '#DDDDDD',
    borderRadius: 5,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markCompleteButtonCompleted: {
      backgroundColor: '#28A745', // Green when completed
  },
  markCompleteButtonText: {
      color: '#333',
      fontWeight: 'bold',
      fontSize: 16,
  },
});

export default ExerciseComponent;