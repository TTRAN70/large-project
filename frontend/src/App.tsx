// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Protected from "./components/Protected";
import Landing from "./pages/landing";
import Feed from "./pages/Feed";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import GameDetails from "./pages/GameDetails";
import Friends from "./pages/Friends";
import Reset from "./pages/Reset";
import ResetPassword from "./pages/ResetPassword";
import Verify from "./pages/Verify";
import Goat from "./pages/Goat";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Landing />} />           
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset" element={<Reset />} />
          <Route path="/goat" element={<Goat />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify/:verification_token" element={<Verify />} />
          <Route element={<Protected />}>
            <Route path="/feed" index element={<Feed />} />
            <Route path="/game/:title" element={<GameDetails />} />
            <Route path="/friends" element={<Friends />} />  
            <Route path="/profile/:id" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
