"use client";
import { useEffect } from "react";

// The signup flow is unified into the login page (isSignUp toggle).
// This redirect ensures any /signup links still work.
export default function SignUpPage() {
  useEffect(() => {
    window.location.replace("/login");
  }, []);
  return null;
}
