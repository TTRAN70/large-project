import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { register } from "../services/auth";
import { colors } from "../theme/colors";

export default function RegisterScreen({ navigation }: any) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister() {
    try {
      await register(username, email, password);
      Alert.alert("Account created successfully!", "Please check your email and verify your account before logging in.");
      navigation.navigate("Login");
    } catch (err: any) {
      Alert.alert("Register Error", err?.response?.data?.error || "Something went wrong");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account 🕹️</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor={colors.textSecondary}
        onChangeText={setUsername}
        value={username}
      />

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

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already have an account? Login</Text>
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
