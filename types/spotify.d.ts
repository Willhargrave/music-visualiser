type SpotifyPlaylist = {
  id: string;
  name: string;
};

type SpotifyTrack = {
  track: {
    id: string;
    name: string;
    uri: string;
    artists: { name: string }[];
    album: {
      images: { url: string }[];
    };
  };
};

type CurrentlyPlaying = {
    name: string;
    artists: string;
    albumImage: string;
    isPlaying: boolean;
    uri: string;
  };

  type PulseProps = {
    tempo: number;
    energy?: number; 
  };