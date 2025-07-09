import React, { useState, useRef } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Audio, AVPlaybackStatus } from "expo-av";

export default function Index() {
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.assets && result.assets.length > 0) {
        setAudioUri(result.assets[0].uri);
        setFileName(result.assets[0].name);
      } else {
        setAudioUri(null);
        setFileName(null);
      }
    } catch (err) {
      Alert.alert("Error", "Could not pick audio file.");
    }
  };

  const playAudio = async () => {
    if (!audioUri) return;
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true },
        (status: AVPlaybackStatus) => {
          if ("isPlaying" in status) setIsPlaying(status.isPlaying);
        }
      );
      soundRef.current = sound;
    } catch (err) {
      Alert.alert("Error", "Failed to play audio.");
    }
  };

  const stopAudio = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      setIsPlaying(false);
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Music Visualiser</Text>
      <Button title="Pick an audio file" onPress={pickAudio} />

      {audioUri && (
        <View style={{ marginTop: 20, alignItems: "center" }}>
          <Text style={styles.filename}>File: {fileName || "Unknown"}</Text>
          <Button
            title={isPlaying ? "Stop" : "Play"}
            onPress={isPlaying ? stopAudio : playAudio}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  filename: { marginBottom: 10 },
});

