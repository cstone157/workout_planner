// ExerciseSetComponent.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Button, Alert } from 'react-native';

const ExerciseSetComponent = ({
  initialReps,
  initialWeight,
  isWarmup: initialIsWarmup,
  onSave,
  onToggleSetType,
  setId,
  isActive,     // New: true if this is the set being actively worked on
  isResting,    // New: true if a rest timer just started because this set was completed
  onSetCompleted, // New: callback when this set is marked complete
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentReps, setCurrentReps] = useState(String(initialReps));
  const [currentWeight, setCurrentWeight] = useState(String(initialWeight));
  const [isWarmup, setIsWarmup] = useState(initialIsWarmup);

  React.useEffect(() => {
    setIsWarmup(initialIsWarmup);
  }, [initialIsWarmup]);

  // If resting (just completed), ensure the editor is collapsed and cannot be opened
  React.useEffect(() => {
    if (isResting) { // If a rest timer for this set starts, collapse the editor
      setIsExpanded(false);
    }
  }, [isResting]);

  const handleSave = () => {
    const newReps = parseInt(currentReps);
    const newWeight = parseFloat(currentWeight);

    if (isNaN(newReps) || newReps <= 0 || isNaN(newWeight) || newWeight < 0) {
      Alert.alert("Invalid Input", "Please enter valid numbers for reps and weight.");
      return;
    }

    if (onSave) {
      onSave(newReps, newWeight, isWarmup);
    }
    setIsExpanded(false);
  };

  const handleToggleSetType = () => {
    if (isResting) return; // Cannot toggle type if resting

    const newIsWarmup = !isWarmup;
    setIsWarmup(newIsWarmup);
    if (onToggleSetType) {
      onToggleSetType(setId, newIsWarmup);
    }
  };

  const handleMarkComplete = () => {
    // Only allow marking complete if it's currently active and not already resting
    if (isActive && !isResting && onSetCompleted) {
      onSetCompleted(setId);
    }
  };


  return (
    <View style={[
        styles.outerContainer,
        isResting && styles.restingContainer, // Light green when resting
        isActive && styles.activeContainer, // Highlight current set
      ]}>
      <View style={styles.mainContent}>
        <Text style={styles.repsText}>{initialReps} reps</Text>
        <Text style={styles.weightText}>{initialWeight} kg</Text>
        <TouchableOpacity
          onPress={handleToggleSetType}
          style={styles.setTypeButton}
          disabled={isResting} // Disable touch if resting
        >
          <Text style={[styles.setTypeText, isWarmup ? styles.warmup : styles.workSet]}>
            {isWarmup ? 'Warmup' : 'Work Set'}
          </Text>
        </TouchableOpacity>
        {!isResting && ( // Only show the expand button if not resting
          <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={styles.expandButton}>
            <Text style={styles.expandButtonText}>...</Text>
          </TouchableOpacity>
        )}
      </View>

      {isExpanded && !isResting && ( // Only show expanded content if expanded AND not resting
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

      {isActive && !isResting && ( // Show "Mark Complete" button only for active, non-resting sets
        <TouchableOpacity style={styles.markCompleteButton} onPress={handleMarkComplete}>
          <Text style={styles.markCompleteButtonText}>Mark Complete</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ExerciseSetComponent;


import React, { useState } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, TextInput, Button, Alert } from 'react-native';

// const ExerciseSetComponent = ({
//   initialReps,
//   initialWeight,
//   isWarmup: initialIsWarmup,
//   onSave,
//   onToggleSetType,
//   setId,
//   completed, // This is the new parameter
// }) => {
//   const [isExpanded, setIsExpanded] = useState(false);
//   const [currentReps, setCurrentReps] = useState(String(initialReps));
//   const [currentWeight, setCurrentWeight] = useState(String(initialWeight));
//   const [isWarmup, setIsWarmup] = useState(initialIsWarmup);

//   // Synchronize local isWarmup state with prop
//   React.useEffect(() => {
//     setIsWarmup(initialIsWarmup);
//   }, [initialIsWarmup]);

//   // If completed, ensure the editor is collapsed and cannot be opened
//   React.useEffect(() => {
//     if (completed) {
//       setIsExpanded(false); // Collapse editor if set is marked complete
//     }
//   }, [completed]); // Rerun this effect if 'completed' prop changes

//   const handleSave = () => {
//     // ... (input validation and onSave call)
//     // If completed, this function should logically not be reachable
//     // because the 'Save' button itself won't be rendered.
//     if (isNaN(parseInt(currentReps)) || parseInt(currentReps) <= 0 || isNaN(parseFloat(currentWeight)) || parseFloat(currentWeight) < 0) {
//       Alert.alert("Invalid Input", "Please enter valid numbers for reps and weight.");
//       return;
//     }
//     if (onSave) {
//       onSave(parseInt(currentReps), parseFloat(currentWeight), isWarmup);
//     }
//     setIsExpanded(false);
//   };

//   const handleToggleSetType = () => {
//     if (completed) return; // Cannot toggle type if the set is completed

//     const newIsWarmup = !isWarmup;
//     setIsWarmup(newIsWarmup);
//     if (onToggleSetType) {
//       onToggleSetType(setId, newIsWarmup);
//     }
//   };

//   return (
//     // 1. Light green background when completed
//     <View style={[styles.outerContainer, completed && styles.completedContainer]}>
//       <View style={styles.mainContent}>
//         <Text style={styles.repsText}>{initialReps} reps</Text>
//         <Text style={styles.weightText}>{initialWeight} kg</Text>
//         <TouchableOpacity
//           onPress={handleToggleSetType}
//           style={styles.setTypeButton}
//           disabled={completed} // 2. Disable set type toggle
//         >
//           <Text style={[styles.setTypeText, isWarmup ? styles.warmup : styles.workSet]}>
//             {isWarmup ? 'Warmup' : 'Work Set'}
//           </Text>
//         </TouchableOpacity>
//         {!completed && ( // 3. Modification button ("...") is not rendered if completed
//           <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={styles.expandButton}>
//             <Text style={styles.expandButtonText}>...</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       {/* 4. Expanded content (editor) is not rendered if completed */}
//       {isExpanded && !completed && (
//         <View style={styles.expandedContent}>
//           <View style={styles.inputGroup}>
//             <Text style={styles.inputLabel}>Reps:</Text>
//             <TextInput
//               style={styles.input}
//               onChangeText={setCurrentReps}
//               value={currentReps}
//               keyboardType="numeric"
//               maxLength={3}
//               editable={!completed} // Redundant as not rendered, but good for safety
//             />
//           </View>
//           <View style={styles.inputGroup}>
//             <Text style={styles.inputLabel}>Weight (kg):</Text>
//             <TextInput
//               style={styles.input}
//               onChangeText={setCurrentWeight}
//               value={currentWeight}
//               keyboardType="numeric"
//               maxLength={5}
//               editable={!completed} // Redundant as not rendered, but good for safety
//             />
//           </View>
//           <Button title="Save Changes" onPress={handleSave} disabled={completed} /> {/* Redundant as not rendered, but good for safety */}
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   outerContainer: {
//     backgroundColor: '#f0f0f0',
//     padding: 10,
//     marginVertical: 5,
//     borderRadius: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 1.41,
//     elevation: 2,
//   },
//   // Style for completed sets - turns background light green
//   completedContainer: {
//     backgroundColor: '#D4EDDA', // Light green color
//     borderColor: '#28A745', // Darker green border for emphasis
//     borderWidth: 1,
//   },
//   mainContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   repsText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     flex: 1,
//     textAlign: 'center',
//   },
//   weightText: {
//     fontSize: 18,
//     color: '#555',
//     flex: 1,
//     textAlign: 'center',
//   },
//   setTypeButton: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   setTypeText: {
//     fontSize: 16,
//     fontWeight: '600',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 5,
//     overflow: 'hidden',
//     minWidth: 80,
//     textAlign: 'center',
//   },
//   warmup: {
//     backgroundColor: '#FFEB3B',
//     color: '#333',
//   },
//   workSet: {
//     backgroundColor: '#4CAF50',
//     color: '#fff',
//   },
//   expandButton: {
//     paddingLeft: 10,
//     paddingVertical: 5,
//   },
//   expandButtonText: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#777',
//   },
//   expandedContent: {
//     marginTop: 10,
//     paddingTop: 10,
//     borderTopWidth: 1,
//     borderTopColor: '#e0e0e0',
//   },
//   inputGroup: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   inputLabel: {
//     fontSize: 16,
//     marginRight: 10,
//     width: 80,
//   },
//   input: {
//     flex: 1,
//     height: 40,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 5,
//     paddingHorizontal: 10,
//     backgroundColor: '#fff',
//     fontSize: 16,
//   },
// });

// export default ExerciseSetComponent;