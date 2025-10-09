import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import Timer from './components/Timer'; // Adjust path if needed

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Timer seconds={10} /> {/* Set your desired countdown seconds */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
});

export default App;