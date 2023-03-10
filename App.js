import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet, Text, View, Button, Linking } from "react-native";
export default function App() {
  useEffect(() => {
    Linking.addEventListener("url", (event) => {
      console.log("event", event);
    });
  }, []);
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <Button
        title="Log in"
        onPress={() => {
          Linking.openURL(
            "https://ian.authillo.com/authorize?response_type=code&scope=openid name phone&state=someInfoForLater&redirect_uri=exp://10.0.0.82:19000&client_id=w3qi-IP24Vc6mFafN1ZCUuY5VhtjiU5aCu9hrC50Kg8&max_age=&code_challenge=code_verifier_hash123&code_challenge_method=S256"
          );
        }}
      ></Button>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
