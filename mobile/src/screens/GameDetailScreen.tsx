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

type Review = {
  _id: string;
  rating: number;
  body: string;
  createdAt: string;
  user: { username: string } | null;
};

export default function GameDetailScreen({ route, navigation }: Props) {
  const { game } = route.params;

  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [myBody, setMyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: game.title || "Game Detail" });
  }, [navigation, game.title]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const me = await api.me();
      const data = await api.gameReviews(game._id);

      // backend returns simple array
      setReviews(Array.isArray(data) ? data : []);

      // Calculate average rating
      if (Array.isArray(data) && data.length > 0) {
        const avg =
          data.reduce((sum, r) => sum + (r.rating || 0), 0) / data.length;
        setAverageRating(avg);
      } else {
        setAverageRating(0);
      }

      // Find my review (match by username)
      const mine =
        Array.isArray(data) &&
        data.find((r) => r.user?.username === me.username);

      if (mine) {
        setMyRating((mine.rating || 0) / 2);
        setMyBody(mine.body || "");
      }
    } catch (err) {
      console.error("Error loading game details", err);
      Alert.alert("Error", "Failed to load game details.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitReview() {
    if (myRating <= 0) {
      Alert.alert("Oops", "Please select a star rating first.");
      return;
    }

    try {
      setSubmitting(true);

      const numericRating = myRating * 2;
      await api.saveReview(game._id, numericRating, myBody.trim());

      Alert.alert("Success", "Your review has been saved.");
      await loadData();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        "Something went wrong while saving your review.";
      Alert.alert("Error", msg);
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

  const displayAverage = averageRating
    ? (averageRating / 2).toFixed(1)
    : "0.0";

  return (
    <ScrollView style={styles.container}>
      {/* COVER IMAGE */}
      {game.image && (
        <Image source={{ uri: game.image }} style={styles.cover} />
      )}

      {/* TITLE */}
      <Text style={styles.title}>{game.title}</Text>

      <Text style={styles.meta}>
        {game.genres?.join(", ") || "Unknown Genre"}
      </Text>
      <Text style={styles.meta}>
        {game.platforms?.join(", ") || "Unknown Platform"}
      </Text>

      {/* DESCRIPTION */}
      <Text style={styles.sectionLabel}>Description</Text>
      <Text style={styles.description}>
        {game.description || "No description available."}
      </Text>

      {/* AVERAGE RATING */}
      <View style={styles.avgContainer}>
        <Text style={styles.avgLabel}>Average Rating</Text>
        <Text style={styles.avgValue}>
          {displayAverage} / 5 ({averageRating.toFixed(1)}/10)
        </Text>
      </View>

      {/* MY REVIEW */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Your Rating</Text>

        <StarRating
          rating={myRating}
          onChange={setMyRating}
          starSize={32}
          enableHalfStar={true}
          color="#FFD700"
          animationConfig={{ scale: 1.1 }}
        />

        <Text style={styles.myRatingText}>
          Your rating: {(myRating * 2).toFixed(1)}/10
        </Text>

        <TextInput
          style={styles.reviewInput}
          placeholder="Write your review (optional)..."
          placeholderTextColor="#8899aa"
          multiline
          value={myBody}
          onChangeText={setMyBody}
        />

        <TouchableOpacity
          style={[styles.button, submitting && { opacity: 0.7 }]}
          onPress={handleSubmitReview}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>
            {submitting ? "Saving..." : "Submit Review"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ALL REVIEWS */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>All Reviews</Text>

        {reviews.length === 0 ? (
          <Text style={styles.noReviews}>
            No reviews yet. Be the first to rate this game!
          </Text>
        ) : (
          reviews.map((r, i) => (
            <View key={r._id || i} style={styles.reviewCard}>
              <Text style={styles.reviewUser}>
                {r.user?.username || "Unknown User"}
              </Text>

              <Text style={styles.reviewRating}>
                {(r.rating / 2).toFixed(1)}/5 ({r.rating.toFixed(1)}/10)
              </Text>

              {r.body ? (
                <Text style={styles.reviewBody}>{r.body}</Text>
              ) : (
                <Text style={styles.reviewBodyMuted}>No comment provided.</Text>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#041C32",
    padding: 16,
  },
  cover: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  meta: {
    color: "#9ECFFF",
    fontSize: 14,
    marginBottom: 2,
  },
  section: {
    marginTop: 20,
  },
  sectionLabel: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  description: {
    color: "#B0BEC5",
    fontSize: 14,
    lineHeight: 20,
  },
  avgContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#092A46",
    borderRadius: 10,
  },
  avgLabel: {
    color: "#9ECFFF",
    fontSize: 14,
  },
  avgValue: {
    color: "#FFD700",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },
  myRatingText: {
    color: "#FFD700",
    marginTop: 6,
    fontWeight: "600",
  },
  reviewInput: {
    backgroundColor: "#092A46",
    color: "#fff",
    borderRadius: 10,
    padding: 10,
    minHeight: 80,
    marginTop: 10,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  noReviews: {
    color: "#B0BEC5",
    fontStyle: "italic",
    marginTop: 4,
  },
  reviewCard: {
    backgroundColor: "#092A46",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  reviewUser: {
    color: "#fff",
    fontWeight: "700",
  },
  reviewRating: {
    color: "#FFD700",
    fontSize: 13,
    marginTop: 2,
  },
  reviewBody: {
    color: "#B0BEC5",
    marginTop: 4,
  },
  reviewBodyMuted: {
    color: "#708090",
    fontStyle: "italic",
    marginTop: 4,
  },
});
