import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Button, Vibration } from 'react-native';
import { Audio } from 'expo-av';

const INITIAL_COUNTDOWN_SECONDS = 60; // Set your desired countdown time here

export default function App() {
  const [seconds, setSeconds] = useState(INITIAL_COUNTDOWN_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const [flashCount, setFlashCount] = useState(0); // To manage screen flashes
  const [backgroundColor, setBackgroundColor] = useState('#fff'); // For screen flash
  const soundObject = useRef(new Audio.Sound()); // Ref for the sound object

  // Load sound effect once
  useEffect(() => {
    const loadSound = async () => {
      try {
        // You can replace this with your own sound file
        // For example: require('./assets/chime.mp3')
        await soundObject.current.loadAsync(require('./assets/chime.mp3'));
      } catch (error) {
        console.log('Error loading sound', error);
      }
    };
    loadSound();

    // Unload sound when component unmounts
    return () => {
      soundObject.current.unloadAsync();
    };
  }, []); // Empty dependency array means this runs once on mount

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(s => s - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      // Timer finished!
      setIsActive(false); // Stop the timer
      setFlashCount(3);   // Start flashing
      playSound();        // Play the chime
      Vibration.vibrate(500); // Add a small vibration
    } else if (!isActive && seconds !== INITIAL_COUNTDOWN_SECONDS) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  // Screen flash logic
  useEffect(() => {
    let flashInterval = null;
    if (flashCount > 0) {
      flashInterval = setInterval(() => {
        setBackgroundColor(prevColor => (prevColor === '#fff' ? 'blue' : '#fff'));
      }, 300); // Flash every 300ms

      setTimeout(() => {
        clearInterval(flashInterval);
        setBackgroundColor('#fff'); // Ensure it ends on white
        setFlashCount(0); // Reset flash count
      }, flashCount * 2 * 300); // Total duration for flashes (e.g., 3 flashes = 6 color changes)
    }
    return () => clearInterval(flashInterval);
  }, [flashCount]);


  const playSound = async () => {
    try {
      await soundObject.current.replayAsync();
    } catch (error) {
      console.log('Error playing sound', error);
    }
  };

  function toggle() {
    setIsActive(!isActive);
  }

  function reset() {
    setIsActive(false);
    setSeconds(INITIAL_COUNTDOWN_SECONDS);
    setFlashCount(0);
    setBackgroundColor('#fff');
  }

  // Format the time for display
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor }]}>
      <Text style={styles.timerText}>{formatTime(seconds)}</Text>
      <View style={styles.buttonContainer}>
        <Button title={isActive ? "Pause" : "Start"} onPress={toggle} />
        <Button title="Reset" onPress={reset} color="red" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 80,
    marginBottom: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '60%',
    justifyContent: 'space-around',
  },
});

// import React, { useState } from 'react';
// //import { View, StyleSheet, Text } from 'react-native';
// import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import ExerciseComponent from './components/ExerciseComponent';


// const App = () => {
//   const workoutPlan = [
//     {
//       id: 'ex1',
//       name: 'Barbell Bench Press',
//       description: 'Compound exercise for chest, shoulders, and triceps.',
//       sets: [
//         { id: '1', reps: 10, weight: 20, isWarmup: true },
//         { id: '2', reps: 8, weight: 50, isWarmup: false },
//         { id: '3', reps: 6, weight: 60, isWarmup: false },
//         { id: '4', reps: 6, weight: 65, isWarmup: false },
//       ],
//       timeBetweenSets: 15, // Example: 90 seconds rest
//       timeAfterExercise: 120, // Example: 120 seconds rest
//     },
//     {
//       id: 'ex2',
//       name: 'Dumbbell Rows',
//       description: 'Unilateral exercise for back strength and muscle balance.',
//       sets: [
//         { id: '5', reps: 12, weight: 15, isWarmup: false },
//         { id: '6', reps: 10, weight: 17.5, isWarmup: false },
//         { id: '7', reps: 10, weight: 17.5, isWarmup: false },
//       ],
//       timeBetweenSets: 60, // Example: 60 seconds rest
//       timeAfterExercise: 90, // Example: 90 seconds rest
//     },
//     {
//       id: 'ex3',
//       name: 'Overhead Press',
//       description: 'Strengthens shoulders and upper chest.',
//       sets: [
//         { id: '8', reps: 12, weight: 10, isWarmup: true },
//         { id: '9', reps: 8, weight: 25, isWarmup: false },
//       ],
//       timeBetweenSets: 75,
//       timeAfterExercise: 0, // No rest after this one, moving straight to next (or end of workout)
//     },
//   ];

//   return (
//     <ScrollView style={appStyles.scrollView}>
//       <View style={appStyles.container}>
//         <Text style={appStyles.workoutHeader}>My Workout Plan</Text>
//         {workoutPlan.map(exercise => (
//           <ExerciseComponent
//             key={exercise.id}
//             name={exercise.name}
//             description={exercise.description}
//             initialSets={exercise.sets}
//             timeBetweenSets={exercise.timeBetweenSets} // Pass new prop
//             timeAfterExercise={exercise.timeAfterExercise} // Pass new prop
//           />
//         ))}
//       </View>
//     </ScrollView>
//   );
// };

// const appStyles = StyleSheet.create({
//   scrollView: {
//     flex: 1,
//     backgroundColor: '#f8f8f8',
//   },
//   container: {
//     flex: 1,
//     padding: 15,
//     paddingTop: 50,
//   },
//   workoutHeader: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//     color: '#222',
//   },
// });

// export default App;