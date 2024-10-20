import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Animated, Modal, Dimensions, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

const { width } = Dimensions.get('window');
const BAR_COUNT = 32;

const UploadAudio = () => {
    const router = useRouter();
    const [audioFeatures, setAudioFeatures] = useState(null);
    const animatedValues = useRef(Array(BAR_COUNT).fill(0).map(() => new Animated.Value(0))).current;
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [audioUri, setAudioUri] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [volume, setVolume] = useState(1.0);
    const [frequency, setFrequency] = useState(1.0);
    const [sound, setSound] = useState();
    const [recording, setRecording] = useState();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const handleBackPress = () => {
        router.replace('/welcome');  // Navigate to the root, which should be your welcome screen
    };

    const [fontsLoaded] = useFonts({
        'Lora-regular': require('../assets/fonts/Lora/Lora-Regular.ttf'),
        'Lora-medium': require('../assets/fonts/Lora/Lora-Medium.ttf'),
        'Lora-semibold': require('../assets/fonts/Lora/Lora-SemiBold.ttf'),
        'Lora-bold': require('../assets/fonts/Lora/Lora-Bold.ttf'),
    });

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
        return sound ? () => { sound.unloadAsync(); } : undefined;
    }, [sound]);

    useEffect(() => {
        let animationFrame;
        if (isAnalyzing) {
            const animate = () => {
                const mockFeatures = Array(BAR_COUNT).fill(0).map(() => Math.random() * frequency);
                setAudioFeatures(mockFeatures);
                mockFeatures.forEach((value, index) => {
                    Animated.spring(animatedValues[index], {
                        toValue: value * 150,
                        friction: 6,
                        useNativeDriver: false,
                    }).start();
                });
                animationFrame = requestAnimationFrame(animate);
            };
            animate();
        }
        return () => cancelAnimationFrame(animationFrame);
    }, [isAnalyzing, frequency]);

    const handleAudioUpload = async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            const audioFile = result.assets[0];
            setAudioUri(audioFile.uri);
            setModalVisible(true);
            await playAndAnalyzeAudio(audioFile.uri);
        }
    };

    const playAndAnalyzeAudio = async (uri) => {
        const { sound } = await Audio.Sound.createAsync({ uri });
        setSound(sound);
        await sound.playAsync();
        setIsPlaying(true);
        setIsAnalyzing(true);
    };

    const handlePlayPause = async () => {
        if (sound) {
            if (isPlaying) {
                await sound.pauseAsync();
            } else {
                await sound.playAsync();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleStop = async () => {
        if (sound) {
            await sound.stopAsync();
            setIsPlaying(false);
            setIsAnalyzing(false);
        }
    };

    const handleVolumeChange = async (value) => {
        setVolume(value);
        if (sound) {
            await sound.setVolumeAsync(value);
        }
    };

    const handleFrequencyChange = (value) => {
        setFrequency(value);
    };

    const startRecording = async () => {
        try {
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });
            const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            setRecording(recording);
            setIsRecording(true);
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = async () => {
        setRecording(undefined);
        setIsRecording(false);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setAudioUri(uri);
        setModalVisible(true);
        await playAndAnalyzeAudio(uri);
    };

    if (!fontsLoaded) {
        return null;
    }

    return (
        <ImageBackground source={require('../assets/images/background3.jpg')} style={styles.background} resizeMode="cover">
            <BlurView intensity={10} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
                    <Ionicons name="arrow-back" size={30} color="white" />
                </TouchableOpacity>
                <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                    <Text style={styles.title}>EchoChromatic</Text>
                    <Text style={styles.subtitle}>Upload or Record Audio</Text>
                    <TouchableOpacity style={styles.button} onPress={handleAudioUpload}>
                        <LinearGradient colors={['#FFFFFF', '#BDBDBD', '#757575']} style={styles.buttonGradient}>
                            <Text style={styles.buttonText}>Select Audio File</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={isRecording ? stopRecording : startRecording}>
                        <LinearGradient colors={['#FFFFFF', '#BDBDBD', '#757575']} style={styles.buttonGradient}>
                            <Text style={styles.buttonText}>{isRecording ? 'Stop Recording' : 'Start Recording'}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <Text style={styles.note}>
                        Note: This app currently uses mock data for analysis and does not analyze real-time audio. Stay tuned for future updates!
                    </Text>

                    <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                        <BlurView intensity={100} style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Audio Visualizer</Text>
                            <View style={styles.visualizer}>
                                {animatedValues.map((value, index) => (
                                    <Animated.View
                                        key={index}
                                        style={[styles.bar, {
                                            height: value,
                                            backgroundColor: `hsl(${(index / BAR_COUNT) * 360}, 100%, 50%)`,
                                        }]}
                                    />
                                ))}
                            </View>
                            <Text style={styles.sliderLabel}>Volume</Text>
                            <Slider
                                value={volume}
                                onValueChange={handleVolumeChange}
                                minimumValue={0}
                                maximumValue={1}
                                step={0.01}
                                style={styles.slider}
                                minimumTrackTintColor="#FFFFFF"
                                maximumTrackTintColor="#000000"
                                thumbTintColor="#FFFFFF"
                            />
                            <Text style={styles.sliderLabel}>Frequency (Mock)</Text>
                            <Slider
                                value={frequency}
                                onValueChange={handleFrequencyChange}
                                minimumValue={0.1}
                                maximumValue={2}
                                step={0.1}
                                style={styles.slider}
                                minimumTrackTintColor="#FFFFFF"
                                maximumTrackTintColor="#000000"
                                thumbTintColor="#FFFFFF"
                            />
                            <View style={styles.controlsContainer}>
                                <TouchableOpacity onPress={handlePlayPause} style={styles.controlButton}>
                                    <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="white" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleStop} style={styles.controlButton}>
                                    <Ionicons name="stop" size={24} color="white" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.controlButton}>
                                    <Ionicons name="close" size={24} color="white" />
                                </TouchableOpacity>
                            </View>
                        </BlurView>
                    </Modal>
                </Animated.View>
            </SafeAreaView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    background: { flex: 1, width: '100%', height: '100%' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: {
        paddingTop: 30,
        textAlign: 'left',
        fontSize: 47,
        color: 'rgba(255, 255, 255, 0.9)',
        fontFamily: 'Lora-semibold',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 3,
    },
    subtitle: {
        paddingTop: 10,
        fontSize: 24,
        color: 'rgba(255, 255, 255, 0.9)',
        fontFamily: 'Lora-semibold',
        marginBottom: 0,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        textAlign: 'center',
    },
    button: { borderRadius: 25, overflow: 'hidden', marginTop: 20 },
    buttonGradient: { paddingVertical: 15, paddingHorizontal: 30 },
    buttonText: { fontSize: 18, color: 'black', fontFamily: 'Lora-semibold' },
    note: {
        marginTop: 20,
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        fontFamily: 'Lora-regular',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 20,
        fontFamily: 'Lora-bold',
    },
    visualizer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 150,
        width: '100%',
        marginBottom: 30,
    },
    bar: { width: (width - 40) / BAR_COUNT, borderTopLeftRadius: 5, borderTopRightRadius: 5 },
    sliderLabel: { color: 'white', fontFamily: 'Lora-semibold', fontSize: 16, marginBottom: 5 },
    slider: { width: '80%', marginBottom: 20 },
    controlsContainer: { flexDirection: 'row', justifyContent: 'center', width: '100%', marginTop: 20 },
    controlButton: {
        marginHorizontal: 20,
        padding: 10,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    backButton: {
        marginTop:40,
        position: 'absolute',
        top: 40,
        left: 20,
        padding: 10,
        zIndex: 10,
    },
});

export default UploadAudio;