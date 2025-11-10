import { Navigate, Outlet, useLocation } from "react-router-dom";
import { auth } from "../lib/auth";

export default function Protected() {
  const token = auth.token;
  const loc = useLocation();
  if (!token) {
    // send them to /login and remember where they came from
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }
  return <Outlet />;
}
