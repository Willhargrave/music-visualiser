import React, { useState, useRef } from "react";
import { View, Text, FlatList, TouchableOpacity, Button, Alert } from "react-native";
import { Audio } from "expo-av";
import { DEMO_TRACKS } from "@/components/demo-tracks";
import NowPlayingBar from "../components/NowPlayingBar";
import PulseAnimation from "../components/Animation";
import { MaterialIcons } from "@expo/vector-icons";

export default function Index() {
  const [showDemo, setShowDemo] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<null | {
    name: string;
    artists: string;
    albumImage?: string;
    isPlaying: boolean;
    uri: any;
    index: number;
  }>(null);

  const [amplitude, setAmplitude] = useState(0.6); // Simulate, see NOTE
  const soundRef = useRef<Audio.Sound | null>(null);

  // Handle play/pause
  const playTrack = async (track, index) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(track.uri, { shouldPlay: true });
      soundRef.current = sound;
      setNowPlaying({
        name: track.name,
        artists: "Demo Track",
        albumImage: undefined,
        isPlaying: true,
        uri: track.uri,
        index,
      });
      // Optionally simulate changing amplitude
      setAmplitude(0.7 + 0.2 * Math.random());
      // Listen for end of track
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          skipToNext();
        }
      });
    } catch (err) {
      Alert.alert("Playback error", err.message);
    }
  };

  const togglePlayPause = async () => {
    if (!nowPlaying || !soundRef.current) return;
    const status = await soundRef.current.getStatusAsync();
    if (status.isPlaying) {
      await soundRef.current.pauseAsync();
      setNowPlaying((prev) => prev && { ...prev, isPlaying: false });
    } else {
      await soundRef.current.playAsync();
      setNowPlaying((prev) => prev && { ...prev, isPlaying: true });
    }
  };

  const skipToNext = () => {
    if (!nowPlaying) return;
    const nextIndex = (nowPlaying.index + 1) % DEMO_TRACKS.length;
    playTrack(DEMO_TRACKS[nextIndex], nextIndex);
  };

  // Clean up
  React.useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  return (
    <View style={{ flex: 1, padding: 20, paddingBottom: 80 }}>
      <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8 }}>
        Demo Music Visualiser
      </Text>
      <TouchableOpacity
        onPress={() => setShowDemo((prev) => !prev)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginVertical: 10,
          marginBottom: showDemo ? 8 : 16,
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 16, marginRight: 8 }}>Demo Tracks</Text>
        <MaterialIcons name={showDemo ? "expand-less" : "expand-more"} size={22} color="#333" />
      </TouchableOpacity>
      {showDemo && (
        <FlatList
          data={DEMO_TRACKS}
          keyExtractor={(item, idx) => idx.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={{
                padding: 10,
                backgroundColor: "#eee",
                marginBottom: 8,
                borderRadius: 8,
              }}
              onPress={() => playTrack(item, index)}
            >
              <Text>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Show animation based on amplitude (simulate for demo tracks) */}
      <View style={{ marginTop: 30, marginBottom: 70 }}>
        <PulseAnimation tempo={120} energy={amplitude} />
      </View>

      {/* Now Playing Bar at bottom */}
      {nowPlaying && (
        <NowPlayingBar
          nowPlaying={nowPlaying}
          onTogglePlayPause={togglePlayPause}
          onSkip={skipToNext}
          style={{ bottom: 40 }}
        />
      )}
    </View>
  );
}

