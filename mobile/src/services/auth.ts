// src/services/auth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = "https://pcm-pro.net/api/auth";
console.log('USING API_URL =>', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

export async function login(email: string, password: string) {
  const res = await api.post('/login', { email, password });
  return res.data;
}

export async function register(username: string, email: string, password: string) {
  const res = await api.post('/register', { username, email, password });
  return res.data;
}

export async function saveToken(token: string) {
  await AsyncStorage.setItem('token', token);
}

export async function getToken() {
  return await AsyncStorage.getItem('token');
}

export async function logout() {
  await AsyncStorage.removeItem('token');
}
