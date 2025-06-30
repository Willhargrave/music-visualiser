import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, View, Text, Button, FlatList, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../auth-context';
import NowPlayingBar from '@/components/NowPlayingBar';




export default function Index() {
  const { token, username } = useAuth();
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [nowPlaying, setNowPlaying] = useState<CurrentlyPlaying | null>(null);


  const router = useRouter();

  useEffect(() => {
      if (token) {
        fetchCurrentlyPlaying(); 
        const interval = setInterval(fetchCurrentlyPlaying, 5000); 
        return () => clearInterval(interval);
      }
    }, [token]);
    

    const fetchCurrentlyPlaying = () => {
      fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.status === 204 ? null : res.json())
        .then(data => {
          if (data && data.item) {
            setNowPlaying({
              name: data.item.name,
              artists: data.item.artists.map((a: { name: string }) => a.name).join(', '),
              albumImage: data.item.album.images[1]?.url || data.item.album.images[0]?.url,
              isPlaying: data.is_playing,
              uri: data.item.uri,
            });
          } else {
            setNowPlaying(null);
          }
        });
    };

    const togglePlayPause = () => {
      if (!nowPlaying) return;
      const endpoint = nowPlaying.isPlaying
        ? "https://api.spotify.com/v1/me/player/pause"
        : "https://api.spotify.com/v1/me/player/play";
      fetch(endpoint, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      }).then(() => {
        fetchCurrentlyPlaying(); // <-- update nowPlaying state right away
      });
    };
    

  useEffect(() => {
    if (token) {
      fetch('https://api.spotify.com/v1/me/playlists', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setPlaylists(data.items || []));
    }
  }, [token]);

  const fetchTracks = (playlistId: string) => {
    fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setTracks(data.items || []));
  };

  const playTrack = (trackUri: string) => {
    fetch("https://api.spotify.com/v1/me/player/play", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ uris: [trackUri] }),
    }).then(res => {
      if (res.status === 204) {
        console.log("Playback started!");
      } else if (res.status === 404) {
        Alert.alert(
          "No Active Spotify Device",
          "Please open the Spotify app, play any track, then return here and try again.",
          [
            { text: "Open Spotify", onPress: () => Linking.openURL('spotify://') },
            { text: "OK" }
          ]
        );
      } else {
        res.text().then(t => console.log("Playback error:", t));
      }
    });
  };

  const skipToNext = () => {
    fetch("https://api.spotify.com/v1/me/player/next", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => {
      fetchCurrentlyPlaying(); // Refresh now playing
    });
  };
  
  

if (!token) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>This is a test</Text>
      <Button title="Go to Login" onPress={() => router.push('/login')} />
    </View>
  );
}


return (
  <View style={{ flex: 1, padding: 20, paddingBottom: 80 }}>
    <Text>Welcome, {username || "Spotify User"}!</Text>
    <Text style={{ marginVertical: 10, fontWeight: 'bold' }}>Your Playlists:</Text>

    <FlatList
      data={playlists}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => {
            setSelectedPlaylist(item.id);
            fetchTracks(item.id);
          }}
          style={{ padding: 10, backgroundColor: '#eee', marginBottom: 8, borderRadius: 8 }}
        >
          <Text>{item.name}</Text>
        </TouchableOpacity>
      )}
      style={{ marginBottom: 16 }}
    />

    {tracks.length > 0 && (
      <>
        <Text style={{ marginVertical: 10, fontWeight: 'bold' }}>Tracks:</Text>
        <FlatList
          data={tracks}
          keyExtractor={item => item.track.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => playTrack(item.track.uri)}
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}
            >
              <Image
                source={{ uri: item.track.album.images[2]?.url || item.track.album.images[0]?.url }}
                style={{ width: 40, height: 40, borderRadius: 4, marginRight: 8 }}
              />
              <View>
                <Text>{item.track.name}</Text>
                <Text style={{ color: '#666' }}>
                  {item.track.artists.map(artist => artist.name).join(', ')}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </>
    )}
   {nowPlaying && (
  <NowPlayingBar
    nowPlaying={nowPlaying}
    onTogglePlayPause={togglePlayPause}
    style={{ bottom: 40 }}
    onSkip={skipToNext}
  />
)}
  </View>
);
}

