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