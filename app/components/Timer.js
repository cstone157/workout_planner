// ExerciseComponent.js
import React, { useState, useEffect, useRef } from 'react'; // Import useEffect and useRef
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import ExerciseSetComponent from './ExerciseSetComponent';
import styles from '../stylesheets/ExerciseComponentStyles';

const Timer = ({
  name,
  description,
  initialSets,
  timeBetweenSets = 60, // Default to 60 seconds if not provided
  timeAfterExercise = 0,
}) => {
  const [sets, setSets] = useState(initialSets || []);
  const [nextSetId, setNextSetId] = useState(
    initialSets && initialSets.length > 0
      ? Math.max(...initialSets.map(s => parseInt(s.id))) + 1
      : 1
  );
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Timer state
  const [restTimer, setRestTimer] = useState(0); // Current time left on timer
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [restingSetId, setRestingSetId] = useState(null); // ID of the set that triggered the current rest
  const timerRef = useRef(null); // Use ref to hold interval ID

  // Determine the index of the next uncompleted set
  const getNextActiveSetId = () => {
    // Find the first set that is NOT completed/resting
    const nextSet = sets.find(set => !set.completed && set.id !== restingSetId);
    return nextSet ? nextSet.id : null;
  };

  // ----- Timer Logic -----
  useEffect(() => {
    if (isTimerRunning && restTimer > 0) {
      timerRef.current = setInterval(() => {
        setRestTimer(prevTime => prevTime - 1);
      }, 1000);
    } else if (restTimer === 0 && isTimerRunning) {
      // Timer finished
      clearInterval(timerRef.current);
      setIsTimerRunning(false);
      setRestingSetId(null); // Clear resting set ID

      // Optionally, alert the user
      Alert.alert("Rest Time Over!", "Time to start the next set.");
    }

    return () => clearInterval(timerRef.current); // Cleanup on unmount or re-render
  }, [isTimerRunning, restTimer]);

  // ----- Set Management Handlers -----
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

  const handleSetCompleted = (setId) => {
    // Mark the set as completed
    setSets(prevSets =>
      prevSets.map(set =>
        set.id === setId ? { ...set, completed: true } : set
      )
    );
    console.log(`Set ${setId} marked as completed.`);

    // Start the rest timer
    setRestTimer(timeBetweenSets);
    setIsTimerRunning(true);
    setRestingSetId(setId); // Store which set just finished
  };

  // Format timer for display
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };


  const activeSetId = getNextActiveSetId(); // Get the ID of the next active set

  return (
    {isTimerRunning && (
    <View style={styles.restTimerDisplay}>
        <Text style={styles.restTimerLabel}>Resting after Set {restingSetId}:</Text>
        <Text style={styles.restTimerValue}>{formatTime(restTimer)}</Text>
        <TouchableOpacity onPress={() => { setIsTimerRunning(false); setRestTimer(0); setRestingSetId(null); clearInterval(timerRef.current); }} style={styles.skipButton}>
        <Text style={styles.skipButtonText}>Skip Rest</Text>
        </TouchableOpacity>
    </View>
    )}
  );
};

export default Timer;