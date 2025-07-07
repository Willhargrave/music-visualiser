import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, View, Text, Button, FlatList, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../auth-context';
import NowPlayingBar from '@/components/NowPlayingBar';
import { MaterialIcons } from '@expo/vector-icons';
import PulseAnimation from '@/components/Animation';



export default function Index() {
  const { token, username } = useAuth();
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [nowPlaying, setNowPlaying] = useState<CurrentlyPlaying | null>(null);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [showTracks, setShowTracks] = useState(true);
  const [audioFeatures, setAudioFeatures] = useState<{ tempo: number, energy: number } | null>(null);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);




  const router = useRouter();
  console.log('Token in render:', token);


  useEffect(() => {
    if (!token) return;
    const testTrackId = "7qiZfU4dY1lWllzX7mPBI3";
    console.log('Spotify Access Token:', token);
    fetch(`https://api.spotify.com/v1/audio-features/${testTrackId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(features => {
        console.log('Known good Audio Features response:', features);
      });
  }, [token]);

  
  

  useEffect(() => {
      if (token) {
        fetchCurrentlyPlaying(); 
        const interval = setInterval(fetchCurrentlyPlaying, 5000); 
        console.log('Spotify Access Token:', token);
        return () => clearInterval(interval);
      }
    }, [token]);

    useEffect(() => {
      if (currentTrackId && token) {
        fetch(`https://api.spotify.com/v1/audio-features/${currentTrackId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(res => res.json())
          .then(features => {
            console.log('Audio Features API raw response:', features);
            setAudioFeatures({ tempo: features.tempo, energy: features.energy });
          })
          .catch(() => setAudioFeatures(null));
      } else {
        setAudioFeatures(null);
      }
    }, [currentTrackId, token]);
    
    useEffect(() => {
      if (token) {
        fetch('https://api.spotify.com/v1/me/playlists', {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => setPlaylists(data.items || []));
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
              albumImage: data.item.album.images[2]?.url || data.item.album.images[0]?.url,
              isPlaying: data.is_playing,
              uri: data.item.uri,
            });
            if (data.item.id !== currentTrackId) {
              console.log('Setting currentTrackId:', data.item.id);
              setCurrentTrackId(data.item.id);
            }
          } else {
            setNowPlaying(null);
            setCurrentTrackId(null);
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
        fetchCurrentlyPlaying();
      });
    };
    

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
      fetchCurrentlyPlaying();
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
    <TouchableOpacity
      onPress={() => setShowPlaylists(prev => !prev)}
      style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}
    >
      <Text style={{ fontWeight: 'bold', fontSize: 16, marginRight: 8 }}>Your Playlists:</Text>
      <MaterialIcons
        name={showPlaylists ? "expand-less" : "expand-more"}
        size={22}
        color="#333"
      />
    </TouchableOpacity>
    {showPlaylists && (
      <FlatList
        data={playlists}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setSelectedPlaylist(item.id);
              fetchTracks(item.id);
              setShowTracks(true); 
            }}
            style={{ padding: 10, backgroundColor: '#eee', marginBottom: 8, borderRadius: 8 }}
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
        style={{ marginBottom: 16 }}
      />
    )}

    {tracks.length > 0 && showTracks && (
      <>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginRight: 8 }}>Tracks:</Text>
          <TouchableOpacity onPress={() => setShowTracks(false)}>
            <MaterialIcons name="close" size={22} color="#333" />
          </TouchableOpacity>
        </View>
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
    {audioFeatures && (
      <>
       {console.log('Tempo:', audioFeatures.tempo, 'Energy:', audioFeatures.energy)}
      <PulseAnimation tempo={audioFeatures.tempo} energy={audioFeatures.energy} />
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

