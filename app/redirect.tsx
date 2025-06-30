import { useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";

export default function Redirect() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    // You might handle the auth params here if needed
    // For now, redirect to home or login
    router.replace("/");
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Redirecting...</Text>
    </View>
  );
}
