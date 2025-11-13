import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import GameSearchScreen from "./src/screens/GameSearchScreen";
import GameDetailScreen from "./src/screens/GameDetailScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState<"Login" | "Home" | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("token");
      setInitialRoute(token ? "Home" : "Login");
    };
    checkToken();
  }, []);

  if (!initialRoute) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen name="Register" component={RegisterScreen} />

        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen name="Profile" component={ProfileScreen} />

        <Stack.Screen
          name="GameSearch"
          component={GameSearchScreen}
          options={{ title: "Game Search" }}
        />

        {/* The REAL working screen */}
        <Stack.Screen name="GameDetail" component={GameDetailScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
