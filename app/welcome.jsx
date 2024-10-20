import React, { useEffect } from 'react'; 
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Video } from 'expo-av';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay, withTiming, Easing } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'Lora-regular': require('../assets/fonts/Lora/Lora-Regular.ttf'),
    'Lora-medium': require('../assets/fonts/Lora/Lora-Medium.ttf'),
    'Lora-bold': require('../assets/fonts/Lora/Lora-Bold.ttf'),
    'Lora-semibold': require('../assets/fonts/Lora/Lora-SemiBold.ttf'),
  });

  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const descriptionOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.5);

  useEffect(() => {
    titleOpacity.value = withDelay(500, withSpring(1));
    subtitleOpacity.value = withDelay(1000, withSpring(1));
    descriptionOpacity.value = withDelay(1500, withSpring(1));
    buttonScale.value = withDelay(2000, withSpring(1));
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: withTiming(titleOpacity.value * -20, { duration: 1000 }) }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: withTiming(subtitleOpacity.value * -20, { duration: 1000 }) }],
  }));

  const descriptionStyle = useAnimatedStyle(() => ({
    opacity: descriptionOpacity.value,
    transform: [{ translateX: withTiming((1 - descriptionOpacity.value) * 50, { duration: 1000 }) }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleButtonClick = () => {
    router.push('/audio-upload');
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        <Video
          source={require('../assets/videos/dark_vinyl_record_spinning_1.mov')}
          style={styles.video}
          shouldPlay
          isLooping
          resizeMode="cover"
        />
      </View>

      <View style={styles.gradientOverlay} />

      <View style={styles.overlayContent}>
        <Animated.Text style={[styles.welcomeText, titleStyle]}>EchoChromatic</Animated.Text>
        <Animated.Text style={[styles.welcomeSubheading, subtitleStyle]}>Explore the Art of Sound Visualization</Animated.Text>

        <Animated.Text style={[styles.descriptionText, descriptionStyle]}>
        EchoChromatic's mock analyzer offers a simulated experience of how the app visualizes sound. Upload or record audio to see a dynamic visual response based on key audio features such as frequency and rhythm. While this version uses placeholder data, it demonstrates the app's core concept of turning sound into a vibrant, interactive visual pattern. Perfect for exploring the visual potential of your audio without detailed analysis.        </Animated.Text>

        <Animated.View style={[styles.buttonContainer, buttonStyle]}>
          <TouchableOpacity style={styles.button} onPress={handleButtonClick} accessibilityLabel="Click me">
            <Text style={styles.buttonText}>Explore Now</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1E1E',
  },
  videoContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  video: {
    flex: 1,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayContent: {
    zIndex: 1,
    paddingHorizontal: 20,
    paddingBottom: 47,
    width: '100%',
  },
  welcomeText: {
    paddingTop: 30,
    textAlign: 'left',
    fontSize: 47,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Lora-semibold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  welcomeSubheading: {
    paddingTop: 30,
    textAlign: 'left',
    fontSize: 33,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Lora-semibold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  descriptionText: {
    marginRight: 70,
    marginTop: 30,
    textAlign: 'left',
    fontSize: 21,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    fontFamily: 'Lora-regular',
  },
  buttonContainer: {
    alignSelf: 'flex-start',
    marginTop: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontFamily: 'Lora-semibold',
  },
});

export default WelcomeScreen;