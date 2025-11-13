import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { api } from "../services/api";

export default function GameSearchScreen({ navigation }: any) {
  const [query, setQuery] = useState("");
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load all games on screen open
  useEffect(() => {
    loadAllGames();
  }, []);

  async function loadAllGames() {
    try {
      setLoading(true);
      const data = await api.searchGames(""); 
      setGames(data);
    } catch (err) {
      console.error("Error loading all games:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(text: string) {
    setQuery(text);
    try {
      setLoading(true);
      const data = await api.searchGames(text);
      setGames(data);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Browse Games</Text>

      <TextInput
        style={styles.searchBox}
        placeholder="Search games..."
        placeholderTextColor="#8899aa"
        value={query}
        onChangeText={handleSearch}
      />

      {loading ? (
        <ActivityIndicator color="#fff" size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={games}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("GameDetail", { game: item })}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>

                <Text style={styles.meta}>
                  {item.genres?.join(", ") || "Unknown Genre"}
                </Text>

                <Text style={styles.metaSmall}>
                  {item.platforms?.join(", ") || "Unknown Platform"}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#041C32",
    padding: 16,
  },
  header: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
  },
  searchBox: {
    backgroundColor: "#092A46",
    color: "#ffffff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#092A46",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  meta: {
    color: "#9ECFFF",
    fontSize: 14,
    marginTop: 4,
  },
  metaSmall: {
    color: "#7FB3D5",
    fontSize: 12,
    marginTop: 2,
  },
});
