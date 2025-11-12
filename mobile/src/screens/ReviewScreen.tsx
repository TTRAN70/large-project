import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { api } from "../services/api";

export default function ReviewScreen() {
  const [gameId, setGameId] = useState("");
  const [rating, setRating] = useState("10");
  const [body, setBody] = useState("");

  async function submit() {
    try {
      await api.postReview(gameId, Number(rating), body);
      Alert.alert("Success", "Review created!");
      setBody("");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error || "Failed to create review");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Review</Text>
      <TextInput placeholder="Game ID" value={gameId} onChangeText={setGameId} style={styles.input}/>
      <TextInput placeholder="Rating (0-10)" value={rating} onChangeText={setRating} style={styles.input} keyboardType="numeric"/>
      <TextInput placeholder="Body" value={body} onChangeText={setBody} style={[styles.input, { height: 100 }]} multiline/>
      <TouchableOpacity style={styles.button} onPress={submit}>
        <Text style={styles.buttonText}>Post Review</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  input: { borderWidth: 1, borderColor: "#999", borderRadius: 6, padding: 10, marginBottom: 10 },
  button: { backgroundColor: "#28a745", padding: 12, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "bold" },
});
