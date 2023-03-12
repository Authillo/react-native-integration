import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  Platform,
  Linking,
} from "react-native";
import * as WebBrowser from "expo-web-browser";

export default function App() {
  const [haveReturned, setHaveReturned] = useState(false);
  const [userId, setUserId] = useState("");
  const [userInfo, setUserInfo] = useState("");
  const [parsedJWT, setParsedJWT] = useState("");
  const clientId = "w3qi-IP24Vc6mFafN1ZCUuY5VhtjiU5aCu9hrC50Kg8";
  const redirectUrl = "exp://10.0.0.82:19000";
  const scopes = `openid name phone email`;
  const maxAge = 3600;

  function parseQueryParams(queryString) {
    const regex = /[?&]([^=#]+)=([^&#]*)/g;
    let params = {};
    let match;
    while ((match = regex.exec(queryString))) {
      params[match[1]] = match[2];
    }
    return params;
  }

  useEffect(() => {
    if (Platform.OS === "android") {
      const func = async () => {
        Linking.addEventListener("url", async (event) => {
          console.log("event", event);
          const params = parseQueryParams(event.url);
          console.log("queryParams: ", params);
          console.log("code: ", params.code);
          let codeRes;
          codeRes = await fetch(
            "http://10.0.2.2:5001/codeResponse?" +
              new URLSearchParams({
                code: params.code,
                makeUserInfoReq: true,
              })
          );
          const codeResponse = JSON.parse(await codeRes.json());
          console.log("codeResponse: ", codeResponse);
          setParsedJWT(codeResponse.idTokenParsed);
          setUserInfo(codeResponse.userInfo);
          setUserId(codeResponse.idTokenParsed.sub);
        });
      };
      func();
    }
  }, []);

  return (
    <View style={styles.container}>
      {!haveReturned && (
        <Button
          title="Log in (webViewController)"
          onPress={async () => {
            console.log("about to request");
            try {
              // const res = await fetch("http://localhost:5001/codeResponse");
              // const res = await fetch("https://auth.authillo.com/token");
              // const res = await fetch("http://localhost:5001/getCodeChallenge");
              let res;
              if (Platform.OS === "android") {
                res = await fetch("http://10.0.2.2:5001/getCodeChallenge");
              } else {
                res = await fetch("http://localhost:5001/getCodeChallenge");
              }
              const parsedResponse = JSON.parse(await res.json());

              const codeChallenge = parsedResponse.codeChallenge;
              console.log("codeChallenge: ", codeChallenge);
              const redirectLink = `http://ian.authillo.com/authorize?response_type=code&scope=${scopes}&state=undefined&redirect_uri=${redirectUrl}&client_id=${clientId}&max_age=${maxAge}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
              let redirectRes = await WebBrowser.openAuthSessionAsync(
                redirectLink
              );
              setHaveReturned(true);
              console.log("redirectRes: ", redirectRes);
              if (Platform.OS === "ios") {
                const params = parseQueryParams(redirectRes.url);
                console.log("queryParams: ", params);
                console.log("code: ", params.code);
                let codeRes;
                codeRes = await fetch(
                  "http://localhost:5001/codeResponse?" +
                    new URLSearchParams({
                      code: params.code,
                      makeUserInfoReq: true,
                    })
                );

                const codeResponse = JSON.parse(await codeRes.json());
                console.log("codeResponse: ", codeResponse);
                setParsedJWT(codeResponse.idTokenParsed);
                setUserInfo(codeResponse.userInfo);
                setUserId(codeResponse.idTokenParsed.sub);
              }
            } catch (err) {
              console.log("err: ", err);
            }
          }}
        ></Button>
      )}
      {haveReturned && !userId && <Text>Loading...</Text>}
      {haveReturned && userId && <Text>User ID: {userId}</Text>}
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
