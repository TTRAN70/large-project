// frontend/src/components/Protected.tsx
import { Outlet } from "react-router-dom";

/**
 * Dev-only / UI-cleanup version:
 * Lets you view protected routes without requiring login.
 * Do NOT copy this into backend / main auth logic.
 */
export default function Protected() {
  return <Outlet />;
}
