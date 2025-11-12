import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://10.0.2.2:3000/api";

async function authHeader() {
  const token = await AsyncStorage.getItem("token");
  return { headers: token ? { Authorization: `Bearer ${token}` } : {} };
}

export const api = {
  async me() {
    const res = await axios.get(`${API_URL}/auth/profile/me`, await authHeader());
    return res.data;
  },

  async searchGames(title: string) {
    const res = await axios.get(`${API_URL}/auth/game`, { params: { title } });
    return res.data as any[];
  },

  async postReview(gameId: string, rating: number, body: string) {
    const res = await axios.post(
      `${API_URL}/auth/review/create`,
      { gameId, rating, body },
      await authHeader()
    );
    return res.data;
  },

  async userReviews(userId: string) {
    const res = await axios.get(`${API_URL}/auth/profile/${userId}/reviews`);
    return res.data;
  },

  async updateProfile(body: { username?: string; bio?: string }) {
    const res = await axios.post(`${API_URL}/auth/profile/edit`, body, await authHeader());
    return res.data;
  },
};
