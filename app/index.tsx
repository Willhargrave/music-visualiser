import React, { useEffect, useState } from "react";
import { View, Text, Button, Alert } from "react-native";
import AudioRecord from "react-native-audio-record";
import PulseAnimation from "@/components/Animation"; 

export default function Index() {
  const [recording, setRecording] = useState(false);
  const [amplitude, setAmplitude] = useState(0);

  // Helper: Calculate amplitude from PCM buffer
  const calculateAmplitude = (pcm: Uint8Array) => {
    let sum = 0;
    for (let i = 0; i < pcm.length; i++) {
      const val = pcm[i] - 128;
      sum += val * val;
    }
    return Math.min(1, Math.sqrt(sum / pcm.length) / 128);
  };

  const startMic = async () => {
    // @ts-ignore
    const granted = await AudioRecord.requestAuthorization();
    if (!granted) {
      Alert.alert("Microphone permission denied");
      return;
    }
    AudioRecord.init({
      sampleRate: 44100,
      channels: 1,
      bitsPerSample: 8,
      audioSource: 6,
      wavFile: "test.wav",
    });
    setAmplitude(0);
    setRecording(true);

    AudioRecord.on("data", (data: string) => {
      const pcm = Uint8Array.from(atob(data), c => c.charCodeAt(0));
      const amp = calculateAmplitude(pcm);
      setAmplitude(amp);
    });

    AudioRecord.start();
  };

  const stopMic = async () => {
    setRecording(false);
    AudioRecord.stop();
  };

  useEffect(() => {
    return () => {
      AudioRecord.stop();
    };
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ marginBottom: 10 }}>Mic-powered Music Visualiser (Pulse)</Text>
      {!recording ? (
        <Button title="Start Visualiser" onPress={startMic} />
      ) : (
        <Button title="Stop Visualiser" onPress={stopMic} />
      )}
      <PulseAnimation tempo={120} energy={amplitude} />
    </View>
  );
}
