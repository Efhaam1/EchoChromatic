import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import LottieView from 'lottie-react-native';
import * as SplashScreen from 'expo-splash-screen';

const { width } = Dimensions.get('window');

SplashScreen.preventAutoHideAsync();

const LoadingScreen = () => {
  const router = useRouter();
  const animation = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    'Lora-regular': require('../assets/fonts/Lora/Lora-Regular.ttf'),
    'Lora-semibold': require('../assets/fonts/Lora/Lora-SemiBold.ttf'),
  });

  useEffect(() => {
    async function prepare() {
      try {
        await fontsLoaded;
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        await SplashScreen.hideAsync();
        animation.current?.play();
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
        
        // Set a timeout to navigate after 5 seconds with transition
        setTimeout(() => {
          router.replace('/welcome');
        }, 5000);
      }
    }

    prepare();
  }, [fontsLoaded, fadeAnim]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
        <Text style={styles.loadingText}>EchoChromatic</Text>
        <LottieView
          ref={animation}
          source={require('../assets/images/audio-wave.json')}
          style={styles.animation}
          autoPlay={true}
          loop={true}
        />
        <Text style={styles.subText}>Loading your audio-visual experience...</Text>
      </Animated.View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  animation: {
    width: width * 0.8,
    height: width * 0.4,  // Reduced height to fit better
  },
  loadingText: {
    fontSize: 52,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Lora-semibold',
  },
  subText: {
    marginTop: 10,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Lora-regular',
  },
});

export default LoadingScreen;