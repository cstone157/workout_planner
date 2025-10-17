import React, { useState } from 'react';
import { StyleSheet, View, Button } from 'react-native';
import Timer from './components/Timer'; // Import the Timer component

export default function App() {
  const [showTimer, setShowTimer] = useState(false);

  const handleTimerClose = () => {
    setShowTimer(false);
  };

  return (
    <View style={styles.container}>
      {showTimer ? (
        <Timer initialTimeInSeconds={10} onClose={handleTimerClose} /> // Set your desired countdown time here
      ) : (
        <Button title="Start 10 Second Timer" onPress={() => setShowTimer(true)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// import { StatusBar } from 'expo-status-bar';
// import { StyleSheet, Text, View } from 'react-native';

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <Text>Open up App.js to start working on your app!</Text>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
