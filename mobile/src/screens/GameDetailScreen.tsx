import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import StarRating from "react-native-star-rating-widget";
import { api } from "../services/api";

type Props = {
  route: { params: { game: any } };
  navigation: any;
};

export default function GameDetailScreen({ route, navigation }: Props) {
  const { game } = route.params;
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [myBody, setMyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    try {
      setLoading(true);

      const me = await api.me();
      const data = await api.gameReviews(game._id);

      setReviews(data);
      if (data.length > 0) {
        const avg =
          data.reduce((sum, r) => sum + (r.rating || 0), 0) / data.length;
        setAverageRating(avg);
      }

      const mine = data.find((r) => r.user?.username === me.username);
      if (mine) {
        setMyRating(mine.rating / 2);
        setMyBody(mine.body || "");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmitReview() {
    if (myRating <= 0) {
      Alert.alert("Rating required", "Please select at least 0.5 stars.");
      return;
    }

    try {
      setSubmitting(true);
      const rating10 = myRating * 2;

      await api.saveReview(game._id, rating10, myBody.trim());
      await loadData();
      Alert.alert("Success", "Your review has been saved!");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong while saving your review.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {game.image && (
        <Image source={{ uri: game.image }} style={styles.cover} />
      )}

      <Text style={styles.title}>{game.title}</Text>
      <Text style={styles.meta}>{game.genres?.join(", ")}</Text>
      <Text style={styles.meta}>{game.platforms?.join(", ")}</Text>

      <Text style={styles.sectionLabel}>Description</Text>
      <Text style={styles.description}>{game.description}</Text>

      <Text style={styles.sectionLabel}>Average Rating</Text>
      <Text style={styles.avgValue}>
        {(averageRating / 2).toFixed(1)} / 5 ({averageRating.toFixed(1)}/10)
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Your Rating</Text>

        <StarRating rating={myRating} onChange={setMyRating} enableHalfStar />

        <TextInput
          style={styles.reviewInput}
          placeholder="Write your review..."
          placeholderTextColor="#777"
          multiline
          value={myBody}
          onChangeText={setMyBody}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmitReview}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>
            {submitting ? "Saving..." : "Submit Review"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>All Reviews</Text>

        {reviews.length === 0 ? (
          <Text style={{ color: "#bbb" }}>No reviews yet.</Text>
        ) : (
          reviews.map((r) => (
            <View key={r._id} style={styles.reviewCard}>
              <Text style={styles.reviewUser}>{r.user.username}</Text>
              <Text style={styles.reviewRating}>
                {(r.rating / 2).toFixed(1)} / 5 ({r.rating}/10)
              </Text>
              <Text style={styles.reviewBody}>{r.body}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#041C32", padding: 16 },
  cover: { width: "100%", height: 240, borderRadius: 12 },
  title: { color: "#fff", fontSize: 22, fontWeight: "900", marginTop: 10 },
  meta: { color: "#9ECFFF", marginBottom: 4 },
  description: { color: "#ccc", marginBottom: 10 },
  section: { marginTop: 20 },
  sectionLabel: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 8 },
  avgValue: { color: "#FFD700", fontSize: 18, fontWeight: "900" },
  reviewInput: {
    backgroundColor: "#092A46",
    color: "#fff",
    padding: 10,
    borderRadius: 10,
    minHeight: 60,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#1e90ff",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "700" },
  reviewCard: {
    backgroundColor: "#092A46",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  reviewUser: { color: "#fff", fontWeight: "700" },
  reviewRating: { color: "#FFD700" },
  reviewBody: { color: "#ccc" },
});
