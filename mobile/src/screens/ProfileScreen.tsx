import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../services/api";

export default function ProfileScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const [followers, setFollowers] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      const me = await api.me();

      setUsername(me.username || "");
      setBio(me.bio || "");

      setFollowers(me.followers || []);
      setFollowing(me.following || []);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.error || "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    if (!username.trim()) {
      Alert.alert("Error", "Username cannot be empty.");
      return;
    }

    try {
      await api.updateProfile(username.trim(), bio.trim());
      Alert.alert("Success", "Profile updated!");
      loadProfile();
    } catch (err: any) {
      Alert.alert(
        "Update Failed",
        err?.response?.data?.error || "Could not update profile."
      );
    }
  }

  async function handleDeleteAccount() {
    Alert.alert(
      "Delete Account?",
      "This action cannot be undone. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.deleteAccount();

              await AsyncStorage.removeItem("token");

              Alert.alert("Account Deleted", "Your account has been removed.", [
                {
                  text: "OK",
                  onPress: () => navigation.reset({
                    index: 0,
                    routes: [{ name: "Login" }],
                  }),
                },
              ]);
            } catch (err: any) {
              Alert.alert(
                "Error",
                err?.response?.data?.error ||
                  "Something went wrong deleting your account."
              );
            }
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.countRow}>
        <View style={styles.countBox}>
          <Text style={styles.countNumber}>{followers.length}</Text>
          <Text style={styles.countLabel}>Followers</Text>
        </View>

        <View style={styles.countBox}>
          <Text style={styles.countNumber}>{following.length}</Text>
          <Text style={styles.countLabel}>Following</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Followers</Text>
      {followers.length === 0 ? (
        <Text style={styles.emptyText}>No followers yet.</Text>
      ) : (
        followers.map((name, idx) => (
          <Text key={`follower-${idx}`} style={styles.userItem}>
            • {name}
          </Text>
        ))
      )}

      <Text style={styles.sectionTitle}>Following</Text>
      {following.length === 0 ? (
        <Text style={styles.emptyText}>You're not following anyone.</Text>
      ) : (
        following.map((name, idx) => (
          <Text key={`following-${idx}`} style={styles.userItem}>
            • {name}
          </Text>
        ))
      )}

      <Text style={styles.label}>Username</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#777"
      />

      <Text style={styles.label}>Bio</Text>
      <TextInput
        value={bio}
        onChangeText={setBio}
        style={[styles.input, { height: 100 }]}
        placeholder="Tell us about yourself..."
        placeholderTextColor="#777"
        multiline
      />

      <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
        <Text style={styles.buttonText}>Save Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
        <Text style={styles.deleteText}>Delete Account</Text>
      </TouchableOpacity>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#041C32",
    flex: 1,
  },

  countRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 25,
    marginTop: 10,
  },
  countBox: {
    alignItems: "center",
    marginHorizontal: 25,
  },
  countNumber: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
  },
  countLabel: {
    color: "#aaa",
    fontSize: 14,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
  },

  emptyText: {
    color: "#789",
    fontStyle: "italic",
    marginBottom: 10,
  },

  userItem: {
    color: "#ddd",
    fontSize: 16,
    marginBottom: 6,
  },

  label: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 6,
    marginTop: 20,
    fontWeight: "600",
  },

  input: {
    backgroundColor: "#092A46",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },

  saveButton: {
    backgroundColor: "#1E90FF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  deleteButton: {
    backgroundColor: "#FF4444",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },

  deleteText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
