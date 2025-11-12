import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { login, saveToken } from "../services/auth";
import { colors } from "../theme/colors";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    try {
      const data = await login(email, password);
      await saveToken(data.token);
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch (err: any) {
      Alert.alert("Login Error", err?.response?.data?.error || "Something went wrong");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back 👋</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.textSecondary}
        onChangeText={setEmail}
        value={email}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background, padding: 24 },
  title: { color: colors.textPrimary, fontSize: 26, fontWeight: "700", marginBottom: 30 },
  input: {
    width: "90%",
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    color: colors.textPrimary,
    marginBottom: 15,
  },
  button: { backgroundColor: colors.accent, padding: 14, borderRadius: 8, width: "90%", marginTop: 10 },
  buttonText: { color: "#fff", fontWeight: "700", textAlign: "center" },
  link: { color: colors.textSecondary, marginTop: 20 },
});
