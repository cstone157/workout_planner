import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Sound from 'react-native-sound';

// Make sure your chime.mp3 is in the appropriate assets folder
// For Android: android/app/src/main/res/raw/chime.mp3
// For iOS: Add it to your Xcode project, ensuring it's part of the 'Copy Bundle Resources' build phase
const chimeSound = new Sound('chime.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    console.log('failed to load the sound', error);
    return;
  }
  // loaded successfully
  console.log('sound loaded successfully');
});

const TimerComponent = ({ seconds }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isFlashing, setIsFlashing] = useState(false);
  const flashOpacity = useRef(new Animated.Value(0)).current; // For the green flash

  useEffect(() => {
    if (timeLeft <= 0) {
      handleTimerEnd();
      return;
    }

    const timerInterval = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [timeLeft]);

  const handleTimerEnd = () => {
    // Play chime
    chimeSound.play((success) => {
      if (success) {
        console.log('successfully finished playing');
      } else {
        console.log('playback failed due to audio decoding errors');
      }
    });

    // Flash screen three times
    let flashCount = 0;
    const flashAnimation = () => {
      if (flashCount < 3) {
        setIsFlashing(true);
        Animated.sequence([
          Animated.timing(flashOpacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(flashOpacity, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start(() => {
          flashCount++;
          flashAnimation();
        });
      } else {
        setIsFlashing(false);
      }
    };
    flashAnimation();
  };

  const skipTimer = () => {
    setTimeLeft(0); // Immediately set to 0 to trigger handleTimerEnd
  };

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <View style={styles.container}>
      {isFlashing && (
        <Animated.View style={[styles.flashOverlay, { opacity: flashOpacity }]} />
      )}
      <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
      <TouchableOpacity style={styles.skipButton} onPress={skipTimer}>
        <Text style={styles.skipButtonText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  timerText: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#333',
  },
  skipButton: {
    marginTop: 30,
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  skipButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 255, 0, 0.7)', // Green flash with some transparency
    zIndex: 100, // Ensure it's on top
  },
});

export default Timer;