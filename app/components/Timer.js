// Timer.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Vibration, Animated, Easing } from 'react-native';
import { Audio } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';

const Timer = ({ initialTimeInSeconds, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(initialTimeInSeconds);
  const [flashColor] = useState(new Animated.Value(0));
  const [soundObject, setSoundObject] = useState(null);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.ALL);
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/alarm.mp3') // Make sure you have an alarm.mp3 in your assets folder
      );
      setSoundObject(sound);
    };
    loadSound();

    return () => {
      ScreenOrientation.unlockAsync();
      if (soundObject) {
        soundObject.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      handleTimerEnd();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleTimerEnd = async () => {
    if (soundObject) {
      await soundObject.replayAsync();
    }
    Vibration.vibrate([0, 500, 500, 500, 500, 500]); // Vibrate
    flashScreen();
  };

  const flashScreen = () => {
    Animated.sequence([
      Animated.timing(flashColor, { toValue: 1, duration: 200, useNativeDriver: false, easing: Easing.linear }),
      Animated.timing(flashColor, { toValue: 0, duration: 200, useNativeDriver: false, easing: Easing.linear }),
      Animated.timing(flashColor, { toValue: 1, duration: 200, useNativeDriver: false, easing: Easing.linear }),
      Animated.timing(flashColor, { toValue: 0, duration: 200, useNativeDriver: false, easing: Easing.linear }),
      Animated.timing(flashColor, { toValue: 1, duration: 200, useNativeDriver: false, easing: Easing.linear }),
      Animated.timing(flashColor, { toValue: 0, duration: 200, useNativeDriver: false, easing: Easing.linear }),
    ]).start(() => {
      setTimeout(() => {
        onClose();
      }, 500); // Give a little extra time before closing
    });
  };

  const backgroundColor = flashColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['#fff', 'lightgreen'],
  });

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 100,
    fontWeight: 'bold',
  },
});

export default Timer;