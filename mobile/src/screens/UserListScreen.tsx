import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { api } from "../services/api";

export default function UserListScreen() {
  const [users, setUsers] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const userList = await api.getAllUsers();
      const profile = await api.me();

      setUsers(userList);
      setMe(profile);
    } catch (err) {
      Alert.alert("Error", "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function toggleFollow(targetId: string, isFollowing: boolean) {
    try {
      if (isFollowing) {
        await api.unfollow(targetId);
      } else {
        await api.follow(targetId);
      }

      load(); // refresh list
    } catch (err) {
      Alert.alert("Error", "Failed to update follow status");
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#041C32", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>All Users</Text>

      {users.map((u: any) => {
        const isMe = me?.username === u.username;
        const isFollowing = me?.following?.includes(u.username);

        return (
          <View key={u._id} style={styles.card}>
            <Text style={styles.username}>{u.username}</Text>
            {u.bio ? <Text style={styles.bio}>{u.bio}</Text> : null}

            {!isMe && (
              <TouchableOpacity
                style={[styles.button, isFollowing && styles.unfollowButton]}
                onPress={() => toggleFollow(u._id, isFollowing)}
              >
                <Text style={styles.buttonText}>
                  {isFollowing ? "Unfollow" : "Follow"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#041C32",
    flex: 1,
    padding: 15,
  },
  header: {
    fontSize: 26,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#092A46",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  username: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  bio: {
    color: "#B0BEC5",
    marginTop: 5,
  },
  button: {
    marginTop: 10,
    backgroundColor: "#1E90FF",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  unfollowButton: {
    backgroundColor: "#d9534f",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
