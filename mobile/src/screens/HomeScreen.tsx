import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { api } from "../services/api";
import { logout } from "../services/auth";
import { colors } from "../theme/colors";

export default function HomeScreen({ navigation }: any) {
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.me();
        setMe(data);
      } catch (e: any) {
        Alert.alert("Error", e?.response?.data?.error || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleLogout() {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.accent} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {me?.username ?? "User"} 👋</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Profile")}>
        <Text style={styles.buttonText}>View Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("GameSearch")}>
        <Text style={styles.buttonText}>Search Games</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: colors.danger }]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Followers: {me?.followers?.length ?? 0}</Text>
        <Text style={styles.footerText}>Following: {me?.following?.length ?? 0}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    color: colors.textPrimary,
  },
  button: {
    backgroundColor: colors.card,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 8,
    width: 220,
  },
  buttonText: {
    color: colors.textPrimary,
    fontWeight: "700",
    textAlign: "center",
  },
  footer: { marginTop: 20, alignItems: "center" },
  footerText: { color: colors.textSecondary, fontWeight: "500" },
});
