import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { api } from "../services/api";

export default function ProfileScreen({ navigation }: any) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await api.me();
        setProfile(data);
        setUsername(data.username);
        setBio(data.bio || "");
      } catch (err: any) {
        Alert.alert("Error", err?.response?.data?.error || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSave() {
    try {
      const updated = await api.updateProfile({ username, bio });
      setProfile(updated);
      Alert.alert("Success", "Profile updated successfully!");
      setEditing(false);
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.error || "Failed to update profile");
    }
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#fff" />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      {/* Card Container */}
      <View style={styles.card}>
        {editing ? (
          <>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              placeholderTextColor="#aaa"
            />

            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, { height: 100 }]}
              multiline
              value={bio}
              onChangeText={setBio}
              placeholder="Enter bio"
              placeholderTextColor="#aaa"
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>Save Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setEditing(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.infoBox}>
              <Text style={styles.username}>{profile.username}</Text>
              <Text style={styles.bio}>{profile.bio || "No bio yet. Add one!"}</Text>
            </View>

            <View style={styles.stats}>
              <Text style={styles.stat}>Followers: {profile.followers?.length ?? 0}</Text>
              <Text style={styles.stat}>Following: {profile.following?.length ?? 0}</Text>
            </View>

            <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
              <Text style={styles.editText}>Edit Profile</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Back Home Button */}
      <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate("Home")}>
        <Text style={styles.homeText}>← Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#041C32",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#092A46",
    borderRadius: 15,
    padding: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  infoBox: {
    alignItems: "center",
    marginBottom: 20,
  },
  username: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "700",
  },
  bio: {
    color: "#B0BEC5",
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 10,
  },
  label: {
    color: "#B0BEC5",
    fontSize: 16,
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#0B2E4E",
    color: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#0A3D62",
  },
  editButton: {
    backgroundColor: "#007BFF",
    padding: 14,
    borderRadius: 10,
    marginTop: 15,
  },
  editText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#28A745",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "#6C757D",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  cancelText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 15,
  },
  stat: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  homeButton: {
    marginTop: 25,
  },
  homeText: {
    color: "#9ECFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
