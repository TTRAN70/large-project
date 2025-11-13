import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://pcm-pro.net/api";

async function authHeader() {
  const token = await AsyncStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  async me() {
    const headers = await authHeader();
    const res = await axios.get(`${API_URL}/auth/profile/me`, { headers });
    return res.data;
  },

  async searchGames(title: string) {
    const res = await axios.get(`${API_URL}/auth/game`, {
      params: { title },
    });
    return res.data;
  },

  async gameReviews(gameId: string) {
    const res = await axios.get(`${API_URL}/auth/review/${gameId}`);
    return res.data; // array of reviews
  },

  async saveReview(gameId: string, rating: number, body: string) {
    const headers = await authHeader();

    // Get all reviews for this game
    let all = [];
    try {
      all = await api.gameReviews(gameId);
      if (!Array.isArray(all)) all = [];
    } catch {}

    const me = await api.me();

    const mine = all.find((r) => r.user?.username === me.username);

    if (mine) {
      // update
      const res = await axios.put(
        `${API_URL}/auth/review/${mine._id}`,
        { rating, body },
        { headers }
      );
      return res.data;
    }

    // create
    const res = await axios.post(
      `${API_URL}/auth/review`,
      { gameId, rating, body },
      { headers }
    );
    return res.data;
  },
};
