import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
} from "react-native";
import { api } from "../services/api";
import StarRating from "react-native-star-rating-widget";

export default function GameSearchScreen() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchGames();
  }, []);

  async function fetchGames() {
    try {
      const res = await api.searchGames("");
      setGames(res);
    } catch (err) {
      console.error("Error fetching games:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    setLoading(true);
    try {
      const res = await api.searchGames(search);
      setGames(res);
    } catch (err) {
      console.error("Error fetching games:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleRatingChange(gameId: string, rating: number) {
    setRatings((prev) => ({ ...prev, [gameId]: rating }));
    // Optional: send to backend later via api.postReview(gameId, rating * 2, "")
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#fff" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Games</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a game..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={games}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.image && <Image source={{ uri: item.image }} style={styles.image} />}
            <Text style={styles.name}>{item.title}</Text>
            <Text style={styles.genre}>{item.genre || "Unknown Genre"}</Text>

            <Text style={styles.desc}>
              {item.description ||
                "No description available. This game has not yet been described."}
            </Text>

            <StarRating
              rating={ratings[item._id] || 0}
              onChange={(rating) => handleRatingChange(item._id, rating)}
              starSize={30}
              enableHalfStar={true}
              color="#FFD700"
              animationConfig={{ scale: 1.2 }}
            />

            <Text style={styles.ratingText}>
              Rating: {(ratings[item._id] || 0) * 2}/10
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#041C32",
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#092A46",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0A3D62",
  },
  searchButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    marginLeft: 10,
    borderRadius: 8,
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#092A46",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  name: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  genre: {
    color: "#9ECFFF",
    fontSize: 14,
    marginBottom: 6,
  },
  desc: {
    color: "#B0BEC5",
    fontSize: 14,
    marginBottom: 10,
  },
  ratingText: {
    color: "#FFD700",
    textAlign: "center",
    fontWeight: "600",
    marginTop: 6,
  },
});
