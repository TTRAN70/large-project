// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Protected from "./components/Protected";
import Feed from "./pages/Feed";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import GameDetails from "./pages/GameDetails";
import Friends from "./pages/Friends";
import Reset from "./pages/Reset";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset" element={<Reset />} />
          <Route element={<Protected />}>
            <Route index element={<Feed />} />
            <Route path="/game/:id" element={<GameDetails />} />
            <Route path="/friends" element={<Friends />} />  
            <Route path="/profile/:username" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
