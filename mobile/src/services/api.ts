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

  async updateProfile(username: string, bio: string) {
    const headers = await authHeader();
    const res = await axios.post(
      `${API_URL}/auth/profile/edit`,
      { username, bio },
      { headers }
    );
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
    return res.data;
  },

  async saveReview(gameId: string, rating: number, body: string) {
    const headers = await authHeader();
    const me = await api.me();

    let all = [];
    try {
      all = await api.gameReviews(gameId);
      if (!Array.isArray(all)) all = [];
    } catch {
      all = [];
    }

    const mine = all.find((r: any) => r.user?.username === me.username);

    if (mine) {
      const res = await axios.put(
        `${API_URL}/auth/review/${mine._id}`,
        { rating, body },
        { headers }
      );
      return res.data;
    }

    const res = await axios.post(
      `${API_URL}/auth/review`,
      { gameId, rating, body },
      { headers }
    );
    return res.data;
  },

  async getAllUsers() {
    const res = await axios.get(`${API_URL}/users`);
    return res.data;
  },

  async follow(id: string) {
    const headers = await authHeader();
    const res = await axios.post(
      `${API_URL}/auth/follow/${id}`,
      {},
      { headers }
    );
    return res.data;
  },

  async unfollow(id: string) {
    const headers = await authHeader();
    const res = await axios.post(
      `${API_URL}/auth/unfollow/${id}`,
      {},
      { headers }
    );
    return res.data;
  },

  async deleteAccount() {
    const headers = await authHeader();
    const res = await axios.post(`${API_URL}/auth/profile/delete`, {}, { headers });
    return res.data;
  }

};
