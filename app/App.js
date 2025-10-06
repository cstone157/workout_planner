import React, { useState } from 'react';
//import { View, StyleSheet, Text } from 'react-native';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ExerciseComponent from './components/ExerciseComponent';


const App = () => {
  const workoutPlan = [
    {
      id: 'ex1',
      name: 'Barbell Bench Press',
      description: 'Compound exercise for chest, shoulders, and triceps.',
      sets: [
        { id: '1', reps: 10, weight: 20, isWarmup: true },
        { id: '2', reps: 8, weight: 50, isWarmup: false },
        { id: '3', reps: 6, weight: 60, isWarmup: false },
        { id: '4', reps: 6, weight: 65, isWarmup: false },
      ],
      timeBetweenSets: 90, // Example: 90 seconds rest
      timeAfterExercise: 120, // Example: 120 seconds rest
    },
    {
      id: 'ex2',
      name: 'Dumbbell Rows',
      description: 'Unilateral exercise for back strength and muscle balance.',
      sets: [
        { id: '5', reps: 12, weight: 15, isWarmup: false },
        { id: '6', reps: 10, weight: 17.5, isWarmup: false },
        { id: '7', reps: 10, weight: 17.5, isWarmup: false },
      ],
      timeBetweenSets: 60, // Example: 60 seconds rest
      timeAfterExercise: 90, // Example: 90 seconds rest
    },
    {
      id: 'ex3',
      name: 'Overhead Press',
      description: 'Strengthens shoulders and upper chest.',
      sets: [
        { id: '8', reps: 12, weight: 10, isWarmup: true },
        { id: '9', reps: 8, weight: 25, isWarmup: false },
      ],
      timeBetweenSets: 75,
      timeAfterExercise: 0, // No rest after this one, moving straight to next (or end of workout)
    },
  ];

  return (
    <ScrollView style={appStyles.scrollView}>
      <View style={appStyles.container}>
        <Text style={appStyles.workoutHeader}>My Workout Plan</Text>
        {workoutPlan.map(exercise => (
          <ExerciseComponent
            key={exercise.id}
            name={exercise.name}
            description={exercise.description}
            initialSets={exercise.sets}
            timeBetweenSets={exercise.timeBetweenSets} // Pass new prop
            timeAfterExercise={exercise.timeAfterExercise} // Pass new prop
          />
        ))}
      </View>
    </ScrollView>
  );
};

const appStyles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
    padding: 15,
    paddingTop: 50,
  },
  workoutHeader: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#222',
  },
});

export default App;