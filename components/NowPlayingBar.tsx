import React from 'react';
import { View, Text, Image, TouchableOpacity, ViewStyle } from 'react-native';



type Props = {
    nowPlaying: CurrentlyPlaying;
    onTogglePlayPause: () => void;
    style?: ViewStyle
    onSkip: () => void;
  };  


export default function NowPlayingBar({ nowPlaying, onTogglePlayPause, style, onSkip }: Props) {
  return (
    <View
    style={[
        {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#222',
          flexDirection: 'row',
          alignItems: 'center',
          padding: 12,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.2,
          shadowRadius: 6,
          elevation: 12,
        },
        style,
      ]}

    >
 {/* <Image
  source={
    nowPlaying.albumImage
      ? { uri: nowPlaying.albumImage }
      : require("../assets/default-cover.png")
  }
  style={{ width: 48, height: 48, borderRadius: 8, marginRight: 12 }}
/> */}

      <View style={{ flex: 1 }}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }} numberOfLines={1}>
          {nowPlaying.name}
        </Text>
        <Text style={{ color: '#aaa' }} numberOfLines={1}>
          {nowPlaying.artists}
        </Text>
      </View>
      <TouchableOpacity onPress={onTogglePlayPause} style={{ marginLeft: 10 }}>
    <Text style={{ color: '#fff', fontSize: 24 }}>
      {nowPlaying.isPlaying ? '⏸️' : '▶️'}
    </Text>
  </TouchableOpacity>
  §<TouchableOpacity onPress={onSkip} style={{ marginLeft: 16 }}>
    <Text style={{ color: '#fff', fontSize: 24 }}>⏭️</Text>
  </TouchableOpacity>
    </View>
  );
}
