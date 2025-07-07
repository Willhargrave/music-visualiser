import * as AuthSession from 'expo-auth-session';
import { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';
import { useAuth } from "../auth-context";

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

export default function Login() {
  const { setToken, setUsername } = useAuth();
  const [localToken, setLocalToken] = useState<string | null>(null);

  const redirectUri = AuthSession.makeRedirectUri({
    native: "musicvisualiser://redirect",
  });
  const clientId = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!;

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId,
      scopes: [
        'user-read-email',
        'user-read-private',
        'user-modify-playback-state', 
        'user-library-read',
        'user-read-playback-state',   
        'user-read-currently-playing',
      ],
    
      redirectUri,
      responseType: 'code',
      usePKCE: true,
    },
    discovery
  );

  useEffect(() => {
    if (
      response?.type === 'success' &&
      response.params.code &&
      request?.codeVerifier
    ) {
      const code = response.params.code;
      fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: [
          `client_id=${clientId}`,
          `grant_type=authorization_code`,
          `code=${code}`,
          `redirect_uri=${encodeURIComponent(redirectUri)}`,
          `code_verifier=${request.codeVerifier}`
        ].join('&')
      })
        .then(res => res.json())
        .then(data => {
          setToken(data.access_token);
          console.log('Spotify Access Token:', data.access_token);

          if (data.access_token) {
            fetch("https://api.spotify.com/v1/me", {
              headers: { Authorization: `Bearer ${data.access_token}` },
            })
              .then(res => res.json())
              .then(userData => {
                if (userData.display_name) setUsername(userData.display_name);
                console.log("Spotify User Data:", userData);
              });
          }
        })
        .catch(e => {
          console.error("Error exchanging code for token", e);
        });
    }
  }, [response]);
  

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {localToken ? (
        <Text>Logged in!</Text>
      ) : (
        <Button
        title="Login with Spotify"
        onPress={async () => {
        const result = await promptAsync();
        console.log("PromptAsync result:", result);
        }}
        disabled={!request}
/>
      )}
    </View>
  );
}

