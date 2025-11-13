// src/screens/ProfileScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { api } from "../services/api";

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

export default function ProfileScreen({ navigation }: Props) {
  const [me, setMe] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      const data = await api.me();
      setMe(data);
      setUsername(data.username || "");
      setBio(data.bio || "");
    } catch (err: any) {
      console.error("loadProfile error:", err?.response?.data || err);
      Alert.alert(
        "Error",
        err?.response?.data?.error || "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      const payload: { username?: string; bio?: string } = {};
      if (username.trim().length > 0) payload.username = username.trim();
      payload.bio = bio.trim();

      const updated = await api.updateProfile(payload);
      setMe(updated);
      setUsername(updated.username || "");
      setBio(updated.bio || "");
      Alert.alert("Success", "Profile updated.");
    } catch (err: any) {
      console.error("updateProfile error:", err?.response?.data || err);
      Alert.alert(
        "Update Failed",
        err?.response?.data?.error || "Could not update profile"
      );
    } finally {
      setSaving(false);
    }
  }

  function handleViewFollowers() {
    if (!me?.followers) return;
    navigation.navigate("UserList", {
      mode: "followers",
      usernames: me.followers as string[],
    });
  }

  function handleViewFollowing() {
    if (!me?.following) return;
    navigation.navigate("UserList", {
      mode: "following",
      usernames: me.following as string[],
    });
  }

  function handleBackHome() {
    navigation.navigate("Home");
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Header / Card */}
      <View style={styles.headerCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {(me?.username || "U").charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.displayName}>{me?.username || "User"}</Text>
        <Text style={styles.emailText}>{me?.email || ""}</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <TouchableOpacity style={styles.statCard} onPress={handleViewFollowers}>
          <Text style={styles.statNumber}>
            {me?.followers?.length ?? 0}
          </Text>
          <Text style={styles.statLabel}>Followers</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statCard} onPress={handleViewFollowing}>
          <Text style={styles.statNumber}>
            {me?.following?.length ?? 0}
          </Text>
          <Text style={styles.statLabel}>Following</Text>
        </TouchableOpacity>
      </View>

      {/* Editable fields */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Edit Profile</Text>

        <Text style={styles.fieldLabel}>Username</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#6c7a89"
        />

        <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Bio</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          style={[styles.input, styles.bioInput]}
          placeholder="Tell the world about your gaming taste..."
          placeholderTextColor="#6c7a89"
          multiline
        />

        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Back Home button */}
      <TouchableOpacity style={styles.backHomeButton} onPress={handleBackHome}>
        <Text style={styles.backHomeText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#041C32",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerCard: {
    backgroundColor: "#092A46",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#0E3A5D",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
  },
  displayName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  emailText: {
    color: "#9ECFFF",
    fontSize: 13,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#092A46",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  statNumber: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    color: "#9ECFFF",
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    backgroundColor: "#092A46",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  fieldLabel: {
    color: "#9ECFFF",
    fontSize: 13,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#041C32",
    color: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#123456",
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  saveButton: {
    marginTop: 14,
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  backHomeButton: {
    alignSelf: "center",
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#9ECFFF",
  },
  backHomeText: {
    color: "#9ECFFF",
    fontWeight: "600",
  },
});
